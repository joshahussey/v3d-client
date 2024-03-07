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
          addWMTS: (
              uid,
              resourceUrlTemplate,
              title,
              abstract,
              layerIdentifier,
              styleIdentifier,
              format,
              tileMatrixSetIdentifier,
              maximumLevel,
              credit,
              wgs84BoundingBox,
              serviceInfo
          ) => {
              const option = {
                  uid: uid,
                  type: "WMTS",
                  name: title,
                  description: abstract ? abstract : title,
                  url: resourceUrlTemplate,
                  serviceInfo: serviceInfo,
                  bounds: wgs84BoundingBox,
                  layer: layerIdentifier,
                  style: styleIdentifier,
                  format: format,
                  tileMatrixSetID: tileMatrixSetIdentifier,
                  maximumLevel: maximumLevel,
                  credit: credit ? credit : "",
                  show: true,
                  alpha: 1.0
              };
              const mapState = Map3DController.getMapState();
              let imageLayers = mapState.imageLayers;
              imageLayers = imageLayers.filter(l => l.uid !== uid);
              imageLayers = [...imageLayers, option];
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
          addOgcMap: (uid, title, url, wgs84BoundingBox, serviceInfo) => {
              const option = {
                  type: "OgcMap",
                  uid: uid,
                  name: title,
                  show: true,
                  url: url,
                  serviceInfo: serviceInfo,
                  bounds: wgs84BoundingBox
              };
              const mapState = Map3DController.getMapState();
              let imageLayers = mapState.imageLayers;
              imageLayers = imageLayers.filter(l => l.uid !== uid);
              imageLayers.push(option);
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
          addWMS: (uid, url, title, abstract, name, format, credit, wgs84BoundingBox, serviceInfo) => {
              const option = {
                  uid: uid,
                  type: "WMS",
                  name: title,
                  description: abstract ? abstract : title,
                  url: url,
                  serviceInfo: serviceInfo,
                  bounds: wgs84BoundingBox,
                  layers: name,
                  parameters: {
                      transparent: "true",
                      format: format
                  },
                  credit: credit ? credit : "",
                  show: false,
                  alpha: 1.0
              };
              const mapState = Map3DController.getMapState();
              let imageLayers = mapState.imageLayers;
              imageLayers = imageLayers.filter(l => l.uid !== uid);
              imageLayers.push(option);
              mapState.imageLayers = imageLayers;
              Map3DController.setMapState(mapState);
          },

          /**
           * Adds a 3D Tiles to 3DMap if a layer on top of the map primitives if the uid dosn't exist.
           * If the uid exists then the existing layer is first removed.
           *
           * @param {String} uid unique identifier for the layer.
           * @param {String} urlOrGeoJsonObject url to the tile set json.
           * @param {String} title the label dispayed for the layer in the layer manager.
           * @param {String} description the description dispayed for the layer in the layer manager.
           * @param {Object} serviceInfo JSON Dictionary representing service information in the form:
           *                             {
           *                                 "serviceTitle":"Title Of Service",
           *                                 "serviceId":"A Unique Service Identifier",
           *                                 "serviceUrl":"The URL Corresponding To The Service",
           *                             }
           */
          add3DTiles: (uid, urlOrGeoJsonObject, title, description, serviceInfo) => {
              const option = {
                  uid: uid,
                  type: "3D_TILES",
                  name: title,
                  description: description,
                  url: urlOrGeoJsonObject,
                  serviceInfo: serviceInfo,
                  show: true
              };
              const mapState = Map3DController.getMapState();
              let primitiveLayers = mapState.primitiveLayers;
              primitiveLayers = primitiveLayers.filter(l => l.uid !== uid);
              primitiveLayers = [...primitiveLayers, option];
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
          addSensorThings: (uid, url, title, description, wgs84BoundingBox, serviceInfo) => {
              const option = {
                  uid,
                  type: "sensorthings",
                  name: title,
                  description,
                  url,
                  bounds: wgs84BoundingBox,
                  serviceInfo: serviceInfo
              };
              const mapState = Map3DController.getMapState();
              let dataSources = mapState.dataSources;
              dataSources = dataSources.filter(d => d.uid !== uid);
              dataSources.push(option);
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
          addCelestial: (uid, url, title, description, serviceInfo) => {
              const option = {
                  uid,
                  type: "celestial",
                  name: title,
                  description,
                  url,
                  serviceInfo: serviceInfo
              };
              const mapState = Map3DController.getMapState();
              let dataSources = mapState.dataSources;
              dataSources = dataSources.filter(d => d.uid !== uid);
              dataSources.push(option);
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
          addGeoJSON: (uid, urlOrGeoJsonObject, title, description, wgs84BoundingBox, serviceInfo) => {
              const option = {
                  uid: uid,
                  name: title,
                  description: description,
                  url: urlOrGeoJsonObject,
                  type: "geojson",
                  bounds: wgs84BoundingBox,
                  serviceInfo: serviceInfo
              };
              const mapState = Map3DController.getMapState();
              let dataSources = mapState.dataSources;
              dataSources = dataSources.filter(d => d.uid !== uid);
              dataSources.push(option);
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
          addOGCFeature: (uid, url, title, description, wgs84BoundingBox, serviceInfo) => {
              const option = {
                  uid: uid,
                  type: "feature",
                  name: title,
                  description: description,
                  url: url,
                  bounds: wgs84BoundingBox,
                  serviceInfo: serviceInfo
              };
              const mapState = Map3DController.getMapState();
              let dataSources = mapState.dataSources;
              dataSources = dataSources.filter(d => d.uid !== uid);
              dataSources.push(option);
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
          addOGCCoverage: (uid, url, title, description, sourceLayerIndex, id, wgs84BoundingBox, serviceInfo) => {
              const option = {
                  uid: uid,
                  type: "coverage",
                  name: title,
                  description: description,
                  url: url,
                  bounds: wgs84BoundingBox,
                  serviceInfo: serviceInfo,
                  sourceLayerIndex: sourceLayerIndex,
                  id: id
              };
              const mapState = Map3DController.getMapState();
              let dataSources = mapState.dataSources;
              dataSources = dataSources.filter(d => d.uid !== uid);
              dataSources.push(option);
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
