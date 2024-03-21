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

const dbPath = "/cslt/db/cslt.sqlite"
const dbPathWithOptions = dbPath + "?_busy_timeout=1000"
var dbMutex sync.Mutex
var cleanupScheduler = gocron.NewScheduler(time.UTC)
const cleanupThreshold = time.Minute * 60 * 60 * 7 * 2

func initDb() {
	err := os.Mkdir("/cslt/db", 0777)
	if err != nil {
		if os.IsExist(err) {
			logI("LOCAL", "Not creating DB dir as it already exists.", "createDbDir")
		} else {
			logE("LOCAL", err, "createDbDir")
		}
	}
	logD("LOCAL", "Checking existence of SQLITE database.", "createDbCheckFile")
	_, err = os.Stat(dbPath)
	if err != nil {
		logD("LOCAL", "Encountered error checking for SQLITE database", "createDbCheckFileErr")
		if os.IsNotExist(err) {
			logD("LOCAL", "Error is that database file does not exist.", "createDbCheckFileErrNotExists")
			createDb(dbPath)
		} else {
			logE("LOCAL", err, "initDbCheckFile")
			log.Panic("File system error. Cannot stat DB path!")
		}
	}

	logD("LOCAL", "Scheduling cache cleaning thread.", "schedCacheCleanThread")
	job, err := cleanupScheduler.Every(1).Day().Do(runCleaner)
	if err != nil {
		logE("LOCAL", err, "scheduleCleaner")
	}
	cleanupScheduler.StartAsync()

	if job.IsRunning() {
		logD("LOCAL", "Job is running", "someStep")
	} else {
		logD("LOCAL", "Job is not running.", "someStep")
}
	fmt.Println(job.NextRun())

}

func createDb(dbPath string) {
	_, err := os.Create(dbPath)
	if err != nil {
		logE("LOCAL", err, "createDbFile")
	}

	db, err := sql.Open("sqlite3", dbPathWithOptions)
	if err != nil {
		logE("LOCAL", err, "openDb")
	}

	dbMutex.Lock()
	_, err = db.Exec("create table services (file_hash text primary key, last_access timestamp default current_timestamp);")
	dbMutex.Unlock()

	if err != nil {
		logE("LOCAL", err, "createDbSchema")
	}

}

func addService(hash string) error {
	db, err := sql.Open("sqlite3", dbPath + "?_busy_timeout=1000")
	if err != nil {
		return err
	}

	dbMutex.Lock()
	_, err = db.Exec("insert into services (file_hash) values (?)", hash)
	dbMutex.Unlock()
	if err != nil {
		return err
	}

	return nil
}

var shaRegex = regexp.MustCompile("[0-9a-f]{64}")
var dirsToClean = [...]string{ "/cslt/web/services" }

func runCleaner() error {
	logI("LOCAL", "Running cache cleaner thread", "runCleanerStart")

	db, err := sql.Open("sqlite3", dbPathWithOptions)
	if err != nil {
		return err
	}
	cleanupThreshold := time.Now().Add(-cleanupThreshold)
	logD("LOCAL", "Removing services last accessed before " + cleanupThreshold.String(), "runCleanerCalculateThreshold")

	dbMutex.Lock()
	rows, err := db.Query("delete from services where last_access < ? returning file_hash", cleanupThreshold)
	dbMutex.Unlock()

	if err != nil {
		logE("LOCAL", err, "runCleanerExecQuery")
	}

	defer rows.Close()

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
			logD("LOCAL", "Adding hash: " + hash, "runCleanerAddRowHash")
			hashes[hash] = struct{}{}
		} else {
			logI("LOCAL", "Rejecting non-hash string: " + hash, "runCleanerCheckHash")
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
			topLevelDirs = append(topLevelDirs, dir + "/" + dirToAdd.Name())
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
				dirPath := topLevelDir+ "/" + dir.Name()
				logD("LOCAL", "Checking: " + dirPath, "runCleanerCheckDir")
				fileInfo, err = os.Lstat(dirPath)
				if err != nil {
					continue
				}

				if ! fileInfo.IsDir() {
					logD("LOCAL", "File is not a directory. Skipping.", "runCleanerCheckFile")
					continue
				}

				if ! shaRegex.MatchString(dir.Name()) {
					logD("LOCAL", "File is not a hash. Skipping.", "runCleanerCheckNonHash")
				}

				if _, contains := hashes[dir.Name()]; contains {
					logD("LOCAL", "Deleting " + dirPath, "runCleanerDeleteDir")
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

