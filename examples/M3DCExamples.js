Map3DController.addWMTS(
    "2aefd4dd-c39b-4a63-8b2e-0946f9d29a77",
    "https://om.compusult.com/tiles/landsat/{TileMatrix}/{TileCol}/{TileRow}.png",
    "Landsat-3395",
    "OpenStreetMap creates and provides free geographic data such as street maps to anyone who wants them.\n\t\t\t The project was started because most maps you think of as free actually have legal or technical restrictions on their use, \n\t\t\t holding back people from using them in creative, productive, or unexpected ways. This layer is a copy of OpenStreetMap\n\t\t\t hosted and rendered by Compusult Ltd. using a PostGresQl database backend and Mapnik Rendering.",
    "Sentinel-3395",
    "default",
    "image/png",
    "3395",
    21,
    "",
    { minX: -180, minY: -90, maxX: 180, maxY: 90 },
    {
        serviceTitle: "Landsat 8 Map",
        serviceId: "15842c77-3e95-4e82-b689-028b886905f8",
        serviceUrl: "https://om.compusult.com/1.0.0/landsat.xml"
    }
);

Map3DController.addOgcMap(
    "d10846a2-44bf-46c5-a33f-d826a2981875",
    "test",
    "https://dbwms-srv1.compusult.com/ServiceDBWMS/webservices/geodb/METAR/map",
    { minX: -180, minY: -90, maxX: 180, maxY: 90 },
    {
        serviceTitle: "OGC Map Test Service",
        serviceId: "d111ce85-6e9c-4046-aed1-1f234e163e60",
        serviceUrl: "https://dbwms-srv1.compusult.com/ServiceDBWMS/webservices/geodb/METAR/"
    }
);

Map3DController.addWMS(
    "34aeb60a-94c6-47a8-8481-a456c9d53dbb",
    "https://cwfis.cfs.nrcan.gc.ca/geoserver/public/wms?SERVICE=WMS&",
    "Canadian Forest FBP Fuel Types (CanFG)",
    "A national map of Canadian FBP fuel types (with burn scars) developed from public data sources. The resolution of the raster is 250m. Data sources include the kNN Forest Inventory (2017) and National Burn Area Composite.\r\nMetadata: http://cwfis.cfs.nrcan.gc.ca/downloads/fuels/development/Canadian_Forest_FBP_Fuel_Types/Canadian_Forest_FBP_Fuel_Types_Metadata_v20191114.pdf",
    "FBP_FuelLayer_wBurnScars",
    "image/png",
    "",
    { minX: -121.11200953671239, minY: 38.35766578293069, maxX: -12.021212341103649, maxY: 63.053060923532854 },
    {
        serviceTitle: "GeoServer Web Map Service",
        serviceId: "cb7ddbfd-59dd-4b1b-9591-3fbd33de87b5",
        serviceUrl: "https://cwfis.cfs.nrcan.gc.ca/geoserver/public/wms?SERVICE=WMS&"
    }
);

Map3DController.add3DTiles(
    "a6d38938-0343-4767-bfc5-bdc07a7a414a",
    "https://raw.githubusercontent.com/CesiumGS/3d-tiles-samples/main/1.0/TilesetWithDiscreteLOD/tileset.json",
    "a6d38938-0343-4767-bfc5-bdc07a7a414a",
    "CesiumTest",
    {
        serviceTitle: "CesiumTest",
        serviceId: "a6d38938-0343-4767-bfc5-bdc07a7a414a",
        serviceUrl:
            "https%3A%2F%2Fraw.githubusercontent.com%2FCesiumGS%2F3d-tiles-samples%2Fmain%2F1.0%2FTilesetWithDiscreteLOD%2Ftileset.json"
    }
);

Map3DController.addGeoJSON(
    "94d6d753-fb4d-4881-9764-a625a83e8939",
    {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                geometry: { type: "Point", coordinates: [102.0, 0.5] },
                properties: { prop0: "value0" }
            },
            {
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: [
                        [102.0, 0.0],
                        [103.0, 1.0],
                        [104.0, 0.0],
                        [105.0, 1.0]
                    ]
                },
                properties: {
                    prop0: "value0",
                    prop1: 0.0
                }
            },
            {
                type: "Feature",
                geometry: {
                    type: "Polygon",
                    coordinates: [
                        [
                            [100.0, 0.0],
                            [101.0, 0.0],
                            [101.0, 1.0],
                            [100.0, 1.0],
                            [100.0, 0.0]
                        ]
                    ]
                },
                properties: {
                    prop0: "value0",
                    prop1: { this: "that" }
                }
            }
        ]
    },
    "Test GeoJSON",
    "Test Description",
    { minX: 101.95, minY: 0.45, maxX: 102.05, maxY: 0.55 },
    {
        serviceTitle: "GeoJSON Test Test Service",
        serviceId: "61d01fdb-2c5c-409f-a7f0-b7b98eab029a",
        serviceUrl: "16515615615651"
    }
);

Map3DController.addGeoJSON(
    "11ed569d-9868-4149-985a-52dc0cd8e508",
    "https://localhost:2016/polygon-samples.geojson",
    "Test GeoJSON URL",
    "Test Description",
    { minX: 101.95, minY: 0.45, maxX: 102.05, maxY: 0.55 },
    {
        serviceTitle: "GeoJSON Tdfsgfgest Test Service",
        serviceId: "d010b9da-fda8-403d-ab84-504711d0fbc1",
        serviceUrl: "sfdgdfgsdfgdfgfdsg"
    }
);

Map3DController.addSensorThings(
    "0c4c6747-8ea5-414b-bbca-666f9bf83e30",
    "https://node1.webenterprisesuite.com/SensorHub/SensorThings/v1.0",
    "0c4c6747-8ea5-414b-bbca-666f9bf83e30",
    "SensorThings: https://node1.webenterprisesuite.com/SensorHub/SensorThings/v1.0",
    "https://node1.webenterprisesuite.com/SensorHub/SensorThings/v1.0",
    { minX: null, minY: null, maxX: null, maxY: null },
    {
        serviceTitle: "SensorThings Test Service",
        serviceId: "d0191985178b9da-fda8-403d-ab84-504711d0fbc1",
        serviceUrl: "15151651685181"
    }
)

Map3DController.addOGCFeature(
    "https://dbwms-srv1.compusult.com/ServiceDBWMS/webservices/geodb/AIS/feature/collections/ships|ships", 
    "https://dbwms-srv1.compusult.com/ServiceDBWMS/webservices/geodb/AIS/feature/collections/ships", 
    "Maritime Ship Traffic", 
    "Ship Traffic Sensor Observation Service provided by Compusult in Mount Pearl, Newfoundland, Canada. Reporting observations related to ship traffic observed by AIS sensors. AIS is an automatic tracking system that uses transceivers on ships and is used by Vessel Traffic Services (VTS).",
    { minX: -180, minY: -90, maxX: 180, maxY: 90}, 
    {
        "serviceTitle": "Automatic Identification System (AIS) Maritime Ship Traffic",
        "serviceId": "37ea8961-942d-4a5f-8e3b-642b63748e4f",
        "serviceUrl": "https://dbwms-srv1.compusult.com/ServiceDBWMS/webservices/geodb/AIS/feature"
    }
)

Map3DController.addOGCCoverage(
    "https://dbwms-srv1.compusult.com/ServiceDBWMS/webservices/datacube/Sea_Ice_Concentrations/coverage/collections/Sea_Ice_Concentrations/coverage?f=json&properties=Band1|Band1", 
    "https://dbwms-srv1.compusult.com/ServiceDBWMS/webservices/datacube/Sea_Ice_Concentrations/coverage/collections/Sea_Ice_Concentrations/coverage?f=json&properties=Band1", 
    "Sea Ice Concentration", 
    null, 
    "Band1", 
    "Band1", 
    { minX: -180, minY: 16.623929999999998, maxX: 179.99999999999997, maxY: 90 },
    {
      "serviceTitle": "Sea Ice Concentrations",
      "serviceId": "fa702413-b55e-49f9-ae4b-29cb1bf5bf46",
      "serviceUrl": "https://dbwms-srv1.compusult.com/ServiceDBWMS/webservices/datacube/Sea_Ice_Concentrations/coverage"
    }
)
