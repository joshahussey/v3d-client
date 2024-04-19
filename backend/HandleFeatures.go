package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	_ "github.com/mattn/go-sqlite3"
)

type Link struct {
    Href string `json:"href"`
    Rel string `json:"rel"`
    Kind string `json:"type"`
    Hreflang string `json:"hreflang"`
    Title string `json:"title"`
    Length int `json:"length"`
}

type CollectionProperties struct {
    Id string `json:"id"`
}

type CollectionPreview struct {
//    GroupColor string `json:"groupColor"`
    Properties CollectionProperties `json:"properties"`
}


type CollectionInformation struct {
    Id string `json:"id"`
    Title string `json:"title"`
    Description string `json:"description"`
    Links []Link `json:"links"`
    Extent []float64 `json:"extent"`
    ItemType string `json:"itemType"`
    Crs string `json:"crs"`
    Preview CollectionPreview `json:"preview"`
    DefaultStyle string `json:"defaultStyle"`
    Live bool `json:"live"`

}

type ItemsResponse struct {
    Type string `json:"type"`
    Features []json.RawMessage `json:"features"`
}

type FeatError struct {
	step string
	err  error
}

func (fe FeatError) Unwrap() error {
	return fe.err
}

func (fe FeatError) Error() string {
	return fmt.Sprintf("%s", fmt.Errorf("FeatError: %s\nError: %w", fe.step, fe.err))
}

func FE(step string, err error) error {
	return FeatError{step: step, err: err}
}

func HandleFeatures(ctx ReqContext) error {
    ctx.w.Header().Set("Content-Type", "application/json")
    endpoint := ctx.r.URL.EscapedPath()
    reqPath := strings.Split(endpoint, "/")
    switch reqPath[len(reqPath)-1] {
    case "items":
        err := HandleFeatureItems(ctx, reqPath[len(reqPath)-3], reqPath[len(reqPath)-2])
        if err != nil {
            return FE("HandleFeatures", err)
        }
    default:
        err := HandleFeatureCollection(ctx, reqPath[len(reqPath)-3], reqPath[len(reqPath)-2])
        if err != nil {
            return FE("HandleFeatures", err)
        }
    }
    return nil
}

func HandleFeatureCollection(ctx ReqContext, hash string, layername string) error {
    db, err := sql.Open("sqlite3",OgcFeaturesDbPath(hash, layername))
    if err != nil {
        return FE("HandleFeatureCollection", err)
    }
    var collection CollectionInformation
    collection.Extent = []float64{0, 0, 0, 0}
    err = db.QueryRow("SELECT uuid, minx, miny, maxx, maxy FROM layer").Scan(&collection.Id, &collection.Extent[0], &collection.Extent[1], &collection.Extent[2], &collection.Extent[3])
    if err != nil {
        return FE("HandleFeatureCollection", err)
    }
    collection.ItemType = "FeatureCollection"
    collection.Crs = "EPSG:4326"
    collection.Links = []Link{
        { Href: ctx.r.Host + ctx.r.URL.Host + ctx.r.URL.EscapedPath() + "items", Rel: "self", Kind: "application/json", Hreflang: "en", Title: "Items for " + layername },
    }
    collection.Title = layername
    collection.Description = "Collection information for " + layername
    //collection.Preview = CollectionPreview{ GroupColor: "#000000", Properties: CollectionProperties{ Id: "tooltip"} }
    collection.Preview = CollectionPreview{ Properties: CollectionProperties{ Id: "tooltip"} }
    collectionJson, err := json.Marshal(collection)
    if err != nil {
        return FE("HandleFeatureCollection", err)
    }
    ctx.w.Header().Set("Content-Type", "application/json")
    _, err = ctx.w.Write(collectionJson)
    if err != nil {
        return FE("HandleFeatureCollection", err)
    }
    logD("HandleFeatureCollection: %s", ctx.r.URL.Path, "TEST")
    db.Close()
    return nil
}

func HandleFeatureItems(ctx ReqContext, hash string, layername string) error {
    logD("HandleFeatureItems: %s", ctx.r.URL.Path, "TEST")
    logD("HandleFeatureItems: %s", OgcFeaturesDbPath(hash, layername), "DbPath")
    logD("HandleFeatureItems: %s", hash, "hash")
    logD("HandleFeatureItems: %s", layername, "layername")
    db, err := sql.Open("sqlite3",OgcFeaturesDbPath(hash, layername))
    if err != nil {
        return FE("HandleFeatureCollection", err)
    }
    defer db.Close()
     
    var items = ItemsResponse{ Type: "FeatureCollection" }
    items.Features = []json.RawMessage{}
    feat, err := db.Query("SELECT json from geometry")
    if err != nil {
        return FE("HandleFeatureItemsQuery", err)
    }
    for feat.Next() {
        var feature json.RawMessage
        err = feat.Scan(&feature)
        if err != nil {
            return FE("HandleFeatureItemsScan", err)
        }
        items.Features = append(items.Features, feature)
    }
    itemsJson, err := json.Marshal(items)
    if err != nil {
        return FE("HandleFeatureItemsMarshal", err)
    }
    ctx.w.Header().Set("Content-Type", "application/json")
    _, err = ctx.w.Write(itemsJson)
    if err != nil {
        return FE("HandleFeatureItemsWrite", err)
    }
    logD("HandleFeatureItems: %s", ctx.r.URL.Path, "TEST")
    return nil
}
