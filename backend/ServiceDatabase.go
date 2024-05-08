package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"regexp"
	"sync"
	"time"

	"github.com/go-co-op/gocron"
	_ "github.com/mattn/go-sqlite3"
)

const svcDbPath = "/cslt/db/cslt.sqlite"
const svcDbPathWithOptions = svcDbPath + "?_busy_timeout=1000"

var svcDbMutex sync.Mutex
var svcDbCleanupScheduler = gocron.NewScheduler(time.UTC)

const svcCleanupThreshold = time.Minute * 60 * 60 * 7 * 2

func initSvcDb() {
	err := os.Mkdir("/cslt/db", 0777)
	if err != nil {
		if os.IsExist(err) {
			logI("LOCAL", "Not creating DB dir as it already exists.", "createSvcDbDir")
		} else {
			logE("LOCAL", err, "createSvcDbDir")
		}
	}
	logD("LOCAL", "Checking existence of SQLITE database.", "createSvcDbCheckFile")
	_, err = os.Stat(svcDbPath)
	if err != nil {
		logD("LOCAL", "Encountered error checking for SQLITE database", "createSvcDbCheckFileErr")
		if os.IsNotExist(err) {
			logD("LOCAL", "Error is that database file does not exist.", "createSvcDbCheckFileErrNotExists")
			createSvcDb(svcDbPath)
		} else {
			logE("LOCAL", err, "initDbCheckFile")
			log.Panic("File system error. Cannot stat DB path!")
		}
	}

	logD("LOCAL", "Scheduling cache cleaning thread.", "schedCacheCleanThread")
	job, err := svcDbCleanupScheduler.Every(1).Day().Do(runCleaner)
	if err != nil {
		logE("LOCAL", err, "scheduleCleaner")
	}
	svcDbCleanupScheduler.StartAsync()

	if job.IsRunning() {
		logD("LOCAL", "Job is running", "someStep")
	} else {
		logD("LOCAL", "Job is not running.", "someStep")
	}
	fmt.Println(job.NextRun())

}

func createSvcDb(dbPath string) {
	_, err := os.Create(dbPath)
	if err != nil {
		logE("LOCAL", err, "createSvcDbFile")
	}

	db, err := sql.Open("sqlite3", svcDbPathWithOptions)
	if err != nil {
		logE("LOCAL", err, "openDb")
	}
	defer db.Close()

	svcDbMutex.Lock()
	_, err = db.Exec("create table services (file_hash text primary key, last_access timestamp default current_timestamp);")
	svcDbMutex.Unlock()

	if err != nil {
		logE("LOCAL", err, "createSvcDbSchema")
	}

}

func addServiceToCleanupList(hash string) error {
	db, err := sql.Open("sqlite3", svcDbPath+"?_busy_timeout=1000")
	if err != nil {
		return err
	}

	svcDbMutex.Lock()
	_, err = db.Exec("insert into services (file_hash) values (?)", hash)
	svcDbMutex.Unlock()
	if err != nil {
		return err
	}

	return nil
}

var shaRegex = regexp.MustCompile("[0-9a-f]{64}")
var dirsToClean = [...]string{"/cslt/web/services"}

func runCleaner() error {
	logI("LOCAL", "Running cache cleaner thread", "runCleanerStart")

	db, err := sql.Open("sqlite3", svcDbPathWithOptions)
	if err != nil {
		return err
	}
	defer db.Close()
	cleanupThreshold := time.Now().Add(-svcCleanupThreshold)
	logD("LOCAL", "Removing services last accessed before "+cleanupThreshold.String(), "runCleanerCalculateThreshold")

	svcDbMutex.Lock()
	rows, err := db.Query("delete from services where last_access < ? returning file_hash", cleanupThreshold)
	svcDbMutex.Unlock()

	defer rows.Close()

	if err != nil {
		logE("LOCAL", err, "runCleanerExecQuery")
	}

	// empty struct requires 0 bytes of memory
	hashes := make(map[string]struct{})

	for rows.Next() {
		var hash string
		if err := rows.Scan(&hash); err != nil {
			logE("LOCAL", err, "runCleanerScanRows")
		}
		logI("LOCAL", fmt.Sprintf("Found service to remove: %s", hash), "runCleanerFoundRow")

		// Sanity check that this string is even a hash
		if shaRegex.MatchString(hash) {
			logD("LOCAL", "Adding hash: "+hash, "runCleanerAddRowHash")
			hashes[hash] = struct{}{}
		} else {
			logI("LOCAL", "Rejecting non-hash string: "+hash, "runCleanerCheckHash")
		}
	}

	logD("LOCAL", fmt.Sprintf("Number of hashes to be deleted: %d\n%v", len(hashes), hashes), "runCleanerTotalHashes")
	if len(hashes) == 0 {
		return nil
	}

	var topLevelDirs []string

	for _, dir := range dirsToClean {
		dirs, err := os.ReadDir(dir)
		if err != nil {
			logE("LOCAL", err, "runCleanerFindDirs")
		}

		for _, dirToAdd := range dirs {
			topLevelDirs = append(topLevelDirs, dir+"/"+dirToAdd.Name())
		}
	}

	for _, topLevelDir := range topLevelDirs {
		fileInfo, err := os.Lstat(topLevelDir)
		if err != nil {
			continue
		}

		if fileInfo.IsDir() {
			fsDirs, err := os.ReadDir(topLevelDir)
			if err != nil {
				continue
			}

			for _, dir := range fsDirs {
				dirPath := topLevelDir + "/" + dir.Name()
				logD("LOCAL", "Checking: "+dirPath, "runCleanerCheckDir")
				fileInfo, err = os.Lstat(dirPath)
				if err != nil {
					continue
				}

				if !fileInfo.IsDir() {
					logD("LOCAL", "File is not a directory. Skipping.", "runCleanerCheckFile")
					continue
				}

				if !shaRegex.MatchString(dir.Name()) {
					logD("LOCAL", "File is not a hash. Skipping.", "runCleanerCheckNonHash")
				}

				if _, contains := hashes[dir.Name()]; contains {
					logD("LOCAL", "Deleting "+dirPath, "runCleanerDeleteDir")
					err = os.RemoveAll(dirPath)
					if err != nil {
						logE("LOCAL", err, "runCleanerDeleteDirError")
					}
					delete(hashes, dir.Name())
				} else {
					logD("LOCAL", "File was not contained in set of hashes. Skipping.", "runCleanerHashNotInMap")
				}
			}
		}
	}

	return nil
}
