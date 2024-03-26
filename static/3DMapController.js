//create Map3DController function if it doesn't exist
const Map3DController = window.Map3DController
    ? window.Map3DController
    : {
          /**
           * Adds a WMTS to 3DMap if a layer on top of the imagery if the uid dosn't exist.
           * If the uid exists then the existing layer is first removed.
           *
           * @param {String} uid unique identifier for the layer.
           * @param {String} resourceUrlTemplate WMTS service endpoint.
           * @param {String} title the label dispayed for the layer in the layer manager.
           * @param {String} abstract the abstract displayed for the layer in the layer manager.
           * @param {String} layerIdentifier the layer name from the service to be add to the map.
           * @param {String} styleIdentifier the defined style name.
           * @param {String} format the format of the respose image/png .
           * @param {String} tileMatrixSetIdentifier the id the tileMatrixSet that will also define projection.
           * @param {Number} maximumLevel max zoom level.
           * @param {String} credit discliamer for the source of the data.
           * @param {JSON} wgs84BoundingBox JSON Dictionary representing minimum bounding rectangle surrounding dataset,
           *                                using WGS 84 CRS with decimal degrees and longitude before latitude.
           *                                ie: {
           *                                        "minX": -180,
           *                                        "minY": -90,
           *                                        "maxX": 180,
           *                                        "maxY": 90
           *                                    }
           * @param {JSON} serviceInfo JSON Dictionary representing service information in the form:
           *                           {
           *                               "title":"Title Of Service",
           *                               "id":"A Unique Service Identifier",
           *                               "url":"The URL Corresponding To The Service",
           *                           }
           */
          addWMTS: addWMTSObject => {
              const mapState = Map3DController.getMapState();
              let imageLayers = mapState.imageLayers;
              for (const wmtsObject of addWMTSObject) {
                  const option = {
                      uid: wmtsObject.uid,
                      type: "WMTS",
                      name: wmtsObject.title,
                      description: wmtsObject.abstract ? wmtsObject.abstract : wmtsObject.title,
                      url: wmtsObject.resourceUrlTemplate,
                      serviceInfo: wmtsObject.serviceInfo,
                      bounds: wmtsObject.wgs84BoundingBox,
                      layer: wmtsObject.layerIdentifier,
                      style: wmtsObject.styleIdentifier,
                      format: wmtsObject.format,
                      tileMatrixSetID: wmtsObject.tileMatrixSetIdentifier,
                      maximumLevel: wmtsObject.maximumLevel,
                      credit: wmtsObject.credit ? wmtsObject.credit : "",
                      show: true,
                      alpha: 1.0
                  };
                  imageLayers = imageLayers.filter(l => l.uid !== wmtsObject.uid);
                  imageLayers = [...imageLayers, option];
              }
              Map3DController.setMapState({
                  ...mapState,
                  imageLayers: imageLayers
              });
          },

          /**
           * Adds an OGC Maps Layer to 3DMap if a layer on top of the imagery if the uid dosn't exist.
           * If the uid exists then the existing layer is first removed.
           *
           * @param {String} uid unique identifier for the layer.
           * @param {String} title the label dispayed for the layer in the layer manager.
           * @param {String} url OGC Maps Restful endpoint.
           * @param {Object} wgs84BoundingBox JSON Dictionary representing minimum bounding rectangle surrounding dataset,
           *                                using WGS 84 CRS with decimal degrees and longitude before latitude.
           *                                ie: {
           *                                        "minX": -180,
           *                                        "minY": -90,
           *                                        "maxX": 180,
           *                                        "maxY": 90
           *                                    }
           * @param {Object} serviceInfo JSON Dictionary representing service information in the form:
           *                             {
           *                                 "serviceTitle":"Title Of Service",
           *                                 "serviceId":"A Unique Service Identifier",
           *                                 "serviceUrl":"The URL Corresponding To The Service",
           *                             }
           */
          addOgcMap: addOgcMapObject => {
              const mapState = Map3DController.getMapState();
              let imageLayers = mapState.imageLayers;
              for (const ogcMapObject of addOgcMapObject) {
                  const option = {
                      type: "OgcMap",
                      uid: ogcMapObject.uid,
                      name: ogcMapObject.title,
                      show: true,
                      url: ogcMapObject.url,
                      serviceInfo: ogcMapObject.serviceInfo,
                      bounds: ogcMapObject.wgs84BoundingBox
                  };
                  imageLayers = imageLayers.filter(l => l.uid !== ogcMapObject.uid);
                  imageLayers.push(option);
              }
              mapState.imageLayers = imageLayers;
              Map3DController.setMapState(mapState);
          },

          /**
           * Adds a WMS to 3DMap if a layer on top of the imagery if the uid dosn't exist.
           * If the uid exists then the existing layer is first removed.
           *
           * @param {String} uid unique identifier for the layer.
           * @param {String} url WMTS GetTiles endpoint.
           * @param {String} title the label dispayed for the layer in the layer manager.
           * @param {String} abstract the description dispayed for the layer in the layer manager.
           * @param {String} name the layer name from the service to be add to the map.
           * @param {String} format the format of the respose image/png .
           * @param {String} credit discliamer for the source of the data.
           * @param {Object} wgs84BoundingBox JSON Dictionary representing minimum bounding rectangle surrounding dataset,
           *                                  using WGS 84 CRS with decimal degrees and longitude before latitude.
           *                                  ie: {
           *                                      "minX": -180,
           *                                      "minY": -90,
           *                                      "maxX": 180,
           *                                      "maxY": 90
           *                                  }
           * @param {Object} serviceInfo JSON Dictionary representing service information in the form:
           *                             {
           *                                 "serviceTitle":"Title Of Service",
           *                                 "serviceId":"A Unique Service Identifier",
           *                                 "serviceUrl":"The URL Corresponding To The Service",
           *                             }
           */
          addWMS: addWMSObject => {
              const mapState = Map3DController.getMapState();
              let imageLayers = mapState.imageLayers;
              for (const wmsObject of addWMSObject) {
                  const option = {
                      uid: wmsObject.uid,
                      type: "WMS",
                      name: wmsObject.title,
                      description: wmsObject.abstract ? wmsObject.abstract : wmsObject.title,
                      url: wmsObject.url,
                      serviceInfo: wmsObject.serviceInfo,
                      bounds: wmsObject.wgs84BoundingBox,
                      layers: wmsObject.name,
                      parameters: {
                          transparent: "true",
                          format: wmsObject.format
                      },
                      credit: wmsObject.credit ? wmsObject.credit : "",
                      show: false,
                      alpha: 1.0
                  };
                  imageLayers = imageLayers.filter(l => l.uid !== wmsObject.uid);
                  imageLayers.push(option);
              }
              mapState.imageLayers = imageLayers;
              Map3DController.setMapState(mapState);
          },

          /**
           * Adds a ArcGIS MapServer to 3DMap if the uid dosn't exist.
           * If the uid exists then the existing layer is first removed.
           *
           * @param {String} uid unique identifier for the layer.
           * @param {String} url WMTS GetTiles endpoint.
           * @param {String} title the label dispayed for the layer in the layer manager.
           * @param {String} abstract the description dispayed for the layer in the layer manager.
           * @param {String} credit discliamer for the source of the data.
           * @param {Object} wgs84BoundingBox JSON Dictionary representing minimum bounding rectangle surrounding dataset,
           *                                  using WGS 84 CRS with decimal degrees and longitude before latitude.
           *                                  ie: {
           *                                      "minX": -180,
           *                                      "minY": -90,
           *                                      "maxX": 180,
           *                                      "maxY": 90
           *                                  }
           * @param {Object} serviceInfo JSON Dictionary representing service information in the form:
           *                             {
           *                                 "serviceTitle":"Title Of Service",
           *                                 "serviceId":"A Unique Service Identifier",
           *                                 "serviceUrl":"The URL Corresponding To The Service",
           *                             }
           */
          addArcGisWMS: addArcGISWMSObject => {
              const mapState = Map3DController.getMapState();
              let imageLayers = mapState.imageLayers;
              for (const arcGisWmsObject of addArcGISWMSObject) {
                  const option = {
                      uid: arcGisWmsObject.uid,
                      type: "ArcGis",
                      name: arcGisWmsObject.title,
                      description: arcGisWmsObject.abstract ? arcGisWmsObject.abstract : arcGisWmsObject.title,
                      url: arcGisWmsObject.url,
                      serviceInfo: arcGisWmsObject.serviceInfo,
                      bounds: arcGisWmsObject.wgs84BoundingBox,
                      credit: arcGisWmsObject.credit ? arcGisWmsObject.credit : ""
                  };
                  imageLayers = imageLayers.filter(l => l.uid !== arcGisWmsObject.uid);
                  imageLayers.push(option);
              }
              mapState.imageLayers = imageLayers;
              Map3DController.setMapState(mapState);
          },

          /**
           * Adds a 3D Tiles to 3DMap if a layer on top of the map primitives if the uid dosn't exist.
           * If the uid exists then the existing layer is first removed.
           *
           * @param {String} uid unique identifier for the layer.
           * @param {String} url url to the tile set json.
           * @param {String} title the label dispayed for the layer in the layer manager.
           * @param {String} description the description dispayed for the layer in the layer manager.
           * @param {Object} serviceInfo JSON Dictionary representing service information in the form:
           *                             {
           *                                 "serviceTitle":"Title Of Service",
           *                                 "serviceId":"A Unique Service Identifier",
           *                                 "serviceUrl":"The URL Corresponding To The Service",
           *                             }
           */
          add3DTiles: add3DTilesObject => {
              const mapState = Map3DController.getMapState();
              let primitiveLayers = mapState.primitiveLayers;
              for (const tilesObject of add3DTilesObject) {
                  const option = {
                      uid: tilesObject.uid,
                      type: "3D_TILES",
                      name: tilesObject.title,
                      description: tilesObject.description,
                      url: tilesObject.url,
                      serviceInfo: tilesObject.serviceInfo,
                      show: true
                  };
                  primitiveLayers = primitiveLayers.filter(l => l.uid !== tilesObject.uid);
                  primitiveLayers = [...primitiveLayers, option];
              }
              Map3DController.setMapState({
                  ...mapState,
                  primitiveLayers: primitiveLayers
              });
          },

          /**
           * Adds a SensorThings data source to the 3D map, replacing any existing data source with the same UID.
           *
           * @param {String} uid unique identifier for the layer.
           * @param {String} url url to the layer.
           * @param {String} title the label displayed for the layer in the layer manager.
           * @param {String} description the description for the layer in the layer manager.
           * @param {Object} wgs84BoundingBox JSON Dictionary representing minimum bounding rectangle surrounding dataset,
           *                                  using WGS 84 CRS with decimal degrees and longitude before latitude.
           *                                  ie: {
           *                                      "minX": -180,
           *                                      "minY": -90,
           *                                      "maxX": 180,
           *                                      "maxY": 90
           *                                  }
           * @param {Object} serviceInfo JSON Dictionary representing service information in the form:
           *                             {
           *                                 "serviceTitle":"Title Of Service",
           *                                 "serviceId":"A Unique Service Identifier",
           *                                 "serviceUrl":"The URL Corresponding To The Service",
           *                             }
           */
          addSensorThings: addSensorThingsObject => {
              const mapState = Map3DController.getMapState();
              let dataSources = mapState.dataSources;
              for (const sensorThingsObject of addSensorThingsObject) {
                  const option = {
                      uid: sensorThingsObject.uid,
                      type: "sensorthings",
                      name: sensorThingsObject.title,
                      description: sensorThingsObject.description,
                      url: sensorThingsObject.url,
                      bounds: sensorThingsObject.wgs84BoundingBox,
                      serviceInfo: sensorThingsObject.serviceInfo
                  };
                  dataSources = dataSources.filter(d => d.uid !== sensorThingsObject.uid);
                  dataSources.push(option);
              }
              mapState.dataSources = dataSources;
              Map3DController.setMapState(mapState);
          },

          /**
           * Adds a data source to the 3D map, replacing any existing data source with the same UID.
           *
           * @param {String} uid unique identifier for the layer.
           * @param {String} url url to the layer.
           * @param {String} title the label displayed for the layer in the layer manager.
           * @param {String} description the description for the layer in the layer manager.
           * @param {Object} serviceInfo JSON Dictionary representing service information in the form:
           *                             {
           *                                 "serviceTitle":"Title Of Service",
           *                                 "serviceId":"A Unique Service Identifier",
           *                                 "serviceUrl":"The URL Corresponding To The Service",
           *                             }
           */
          //NOT CURRENTLY SUPPORTED
          addCelestial: addCelestialObject => {
              const mapState = Map3DController.getMapState();
              let dataSources = mapState.dataSources;
              for (const celestialObject of addCelestialObject) {
                  const option = {
                      uid: celestialObject.uid,
                      type: "celestial",
                      name: celestialObject.title,
                      description: celestialObject.description,
                      url: celestialObject.url,
                      serviceInfo: celestialObject.serviceInfo
                  };
                  dataSources = dataSources.filter(d => d.uid !== celestialObject.uid);
                  dataSources.push(option);
              }
              mapState.dataSources = dataSources;
              Map3DController.setMapState(mapState);
          },

          /**
           * Adds a data source to the 3D map, replacing any existing data source with the same UID.
           *
           * @param {String} uid unique identifier for the layer.
           * @param {String} urlOrGeoJsonObject url to the layer, or a geojson object.
           * @param {String} title the label displayed for the layer in the layer manager.
           * @param {String} description the description for the layer in the layer manager.
           * @param {Object} serviceInfo JSON Dictionary representing service information in the form:
           *                             {
           *                                 "serviceTitle":"Title Of Service",
           *                                 "serviceId":"A Unique Service Identifier",
           *                                 "serviceUrl":"The URL Corresponding To The Service",
           *                             }
           */
          addGeoJSON: addGeoJsonObject => {
              const mapState = Map3DController.getMapState();
              let dataSources = mapState.dataSources;
              for (const geoJsonObject of addGeoJsonObject) {
                  const option = {
                      uid: geoJsonObject.uid,
                      name: geoJsonObject.title,
                      description: geoJsonObject.description,
                      url: geoJsonObject.urlOrGeoJsonObject,
                      type: "geojson",
                      serviceInfo: geoJsonObject.serviceInfo
                  };
                  dataSources = dataSources.filter(d => d.uid !== geoJsonObject.uid);
                  dataSources.push(option);
              }
              mapState.dataSources = dataSources;
              Map3DController.setMapState(mapState);
          },

          /**
           * Adds a data source to the 3D map, replacing any existing data source with the same UID.
           *
           * @param {String} uid unique identifier for the layer.
           * @param {String} url url to the kml file.
           * @param {String} title the label displayed for the layer in the layer manager.
           * @param {String} description the description for the layer in the layer manager.
           * @param {Object} serviceInfo JSON Dictionary representing service information in the form:
           *                             {
           *                                 "serviceTitle":"Title Of Service",
           *                                 "serviceId":"A Unique Service Identifier",
           *                                 "serviceUrl":"The URL Corresponding To The Service",
           *                             }
           */
          addKml: addKmlObject => {
              const mapState = Map3DController.getMapState();
              let dataSources = mapState.dataSources;
              for (const kmlObject of addKmlObject) {
                  const option = {
                      uid: kmlObject.uid,
                      name: kmlObject.title,
                      description: kmlObject.description,
                      url: kmlObject.url,
                      type: "kml",
                      serviceInfo: kmlObject.serviceInfo
                  };
                  dataSources = dataSources.filter(d => d.uid !== kmlObject.uid);
                  dataSources.push(option);
              }
              mapState.dataSources = dataSources;
              Map3DController.setMapState(mapState);
          },

          /**
           * Adds a data source to the 3D map, replacing any existing data source with the same UID.
           *
           * @param {String} uid unique identifier for the layer.
           * @param {String} url url to the layer.
           * @param {String} title the label displayed for the layer in the layer manager.
           * @param {String} description the description for the layer in the layer manager.
           * @param {Object} wgs84BoundingBox JSON Dictionary representing minimum bounding rectangle surrounding dataset,
           *                                  using WGS 84 CRS with decimal degrees and longitude before latitude.
           *                                  ie: {
           *                                      "minX": -180,
           *                                      "minY": -90,
           *                                      "maxX": 180,
           *                                      "maxY": 90
           *                                  }
           * @param {Object} serviceInfo JSON Dictionary representing service information in the form:
           *                             {
           *                                 "serviceTitle":"Title Of Service",
           *                                 "serviceId":"A Unique Service Identifier",
           *                                 "serviceUrl":"The URL Corresponding To The Service",
           *                             }
           */
          addOGCFeature: addOGCFeatureObject => {
              const mapState = Map3DController.getMapState();
              let dataSources = mapState.dataSources;
              for (const ogcFeatureObject of addOGCFeatureObject) {
                  const option = {
                      uid: ogcFeatureObject.uid,
                      type: "feature",
                      name: ogcFeatureObject.title,
                      description: ogcFeatureObject.description,
                      url: ogcFeatureObject.url,
                      bounds: ogcFeatureObject.wgs84BoundingBox,
                      serviceInfo: ogcFeatureObject.serviceInfo
                  };
                  dataSources = dataSources.filter(d => d.uid !== ogcFeatureObject.uid);
                  dataSources.push(option);
              }
              mapState.dataSources = dataSources;
              Map3DController.setMapState(mapState);
          },

          /**
           * Adds a data source to the 3D map, replacing any existing data source with the same UID.
           *
           * @param {String} uid unique identifier for the layer.
           * @param {String} url url to the layer.
           * @param {String} title the label displayed for the layer in the layer manager.
           * @param {String} description the description for the layer in the layer manager.
           * @param {String} sourceLayerIndex the layer index of the layer
           * @param {String} id the id of the layer
           * @param {Object} wgs84BoundingBox JSON Dictionary representing minimum bounding rectangle surrounding dataset,
           *                                  using WGS 84 CRS with decimal degrees and longitude before latitude.
           *                                  ie: {
           *                                      "minX": -180,
           *                                      "minY": -90,
           *                                      "maxX": 180,
           *                                      "maxY": 90
           *                                  }
           * @param {Object} serviceInfo JSON Dictionary representing service information in the form:
           *                             {
           *                                 "serviceTitle":"Title Of Service",
           *                                 "serviceId":"A Unique Service Identifier",
           *                                 "serviceUrl":"The URL Corresponding To The Service",
           *                             }
           */
          addOGCCoverage: addOGCCoverageObject => {
              const mapState = Map3DController.getMapState();
              let dataSources = mapState.dataSources;
              for (const ogcCoverageObject of addOGCCoverageObject) {
                  const option = {
                      uid: ogcCoverageObject.uid,
                      type: "coverage",
                      name: ogcCoverageObject.title,
                      description: ogcCoverageObject.description,
                      url: ogcCoverageObject.url,
                      bounds: ogcCoverageObject.wgs84BoundingBox,
                      serviceInfo: ogcCoverageObject.serviceInfo,
                      sourceLayerIndex: ogcCoverageObject.sourceLayerIndex,
                      id: ogcCoverageObject.id
                  };
                  dataSources = dataSources.filter(d => d.uid !== ogcCoverageObject.uid);
                  dataSources.push(option);
              }
              mapState.dataSources = dataSources;
              Map3DController.setMapState(mapState);
          },

          /**
           * If the uid exists then the existing layer is removed.
           *
           * @param {string} uid unique identifier for the layer.
           */
          remove: uid => {
              const mapState = Map3DController.getMapState();

              let primitiveLayers = mapState.primitiveLayers;
              primitiveLayers = primitiveLayers.filter(l => l.uid !== uid);

              let imageLayers = mapState.imageLayers;
              imageLayers = imageLayers.filter(l => l.uid !== uid);

              Map3DController.setMapState({
                  ...mapState,
                  imageLayers: imageLayers,
                  primitiveLayers: primitiveLayers
              });
          },

          /**
           * Return the current map state as json. if the layer dosn't exist then it will load it.
           *
           * @returns {JSON | null} Return the current map state as json.
           */
          getMapState: () => {
              const mapStateString = localStorage.getItem("cesiumMapState");
              if (mapStateString) {
                  const mapState = JSON.parse(mapStateString);
                  if (mapState) {
                      return mapState;
                  }
              }
              //return null;
              return Map3DController.restMap();
          },

          /**
           * Resets the map to the default state.
           * @returns {JSON | null} return the new map state.
           *
           */
          restMap: () => {
              const mapState = Map3DController.getDefaultState();
              if (mapState) {
                  Map3DController.setMapState(mapState);
              }
              return mapState;
          },

          /**
           * Saves the map State.
           *
           * @param {JSON} mapStateJson the new map state as json.
           */
          setMapState: mapStateJson => {
              if (mapStateJson) {
                  localStorage.cesiumMapState = JSON.stringify(mapStateJson);
              }
          },

          /**
           * Return the default map state as json. The default State must be fetched first by fetchDefaultMapState.
           *
           * @returns {JSON | null} Return the default map state as json.
           */
          getDefaultState: () => {
              let mapState = JSON.parse(localStorage.getItem("cesiumMapStateDefault"));
              if (mapState) {
                  return mapState;
              }
              return null;
          },

          /**
           * Retrieves the latest version of of the map state from the server using url stored at 'localStoreage.Default3dMapUrl'.
           * @param {*} force
           * @returns {JSON | null} The default Map State from the server.
           */
          fetchDefaultMapState: async function (force) {
              let url = localStorage.Default3dMapUrl;
              if (!url) {
                  url = "state.json";
              }
              let response = await fetch(url);
              console.log(response.status); // 200
              console.log(response.statusText); // OK
              if (response.status === 200) {
                  try {
                      let data = await response.json();
                      // handle data
                      if (!force || !data) {
                          const oldMapState = Map3DController.getDefaultState();
                          if (oldMapState) {
                              return oldMapState;
                          }
                      }
                      if (data) {
                          localStorage.cesiumMapStateDefault = JSON.stringify(data);
                      }
                      return data;
                  } catch (e) {
                      console.log("Failed to load Default Map State from ", url, e);
                  }
              } else {
                  console.log("Failed to load Default Map State from ", url, " with a status code ", response.status);
              }
          },

          /**
           * The map state might need to be loaded from the server, calling this method will ensure the map is loaded before performing any actions.
           *
           * @param {boolean} force will force the map state to be loaded from the server.
           * @returns {JSON | null}The Map State after it is loaded which might be from the server.
           */
          onLoad: async function (force) {
              const mapState = Map3DController.getMapState();
              if (!mapState) {
                  let result = await Map3DController.fetchDefaultMapState();
                  const s = Map3DController.getMapState();
                  if (s) {
                      return s;
                  }
                  this.setMapState(result);
                  return result;
              } else {
                  return mapState;
              }
          },

          /**
           * Open the 3D Client in a new window.
           */
          openClient: () => {
              window.open(
                  "/wes/Cesium/WES/3dMap.jsp",
                  "3d",
                  "menubar=no,location=no,toolbar=no,status=no,directories=no,resizable=yes"
              );
          },

          /**
           * Raise the map state changed event.
           */
          raiseMapStateChangedEvent: () => {
              const csltRegistry = window.csltWindowRegistry;
              const cesiumWindow = csltRegistry ? csltRegistry.getWindow("3d") : window;
              cesiumWindow.dispatchEvent(new Event("mapStateChanged"));
          },

          /**
           * Raise the map state saved event.
           */
          raiseMapStateSavedEvent: () => {
              const csltRegistry = window.csltWindowRegistry;
              const cesiumWindow = csltRegistry ? csltRegistry.getWindow("3d") : window;
              cesiumWindow.dispatchEvent(new Event("mapStateSaved"));
          },

          /**
           * Raise the map state loaded event.
           */
          raiseMapStateLoadedEvent: () => {
              const csltRegistry = window.csltWindowRegistry;
              const cesiumWindow = csltRegistry ? csltRegistry.getWindow("3d") : window;
              cesiumWindow.dispatchEvent(new Event("mapStateLoaded"));
          }
      };

if (!window.Map3DController) {
    //Set the Map3DController on the window to inscrease scope
    window.Map3DController = Map3DController;
}

//Checks to see if we need to init
if (!Map3DController.getDefaultState()) {
    Map3DController.fetchDefaultMapState();
}
