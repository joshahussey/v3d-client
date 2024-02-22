//create Map3DController function if it dosn't esist
const Map3DController = window.Map3DController
    ? window.Map3DController
    : {
          /**
           * Adds a WMTS to 3DMap if a layer on top of the imagery if the uid dosn't exist.
           * If the uid exists then the existing layer is first removed.
           *
           * @param {String} uid unique identifier for the layer.
           * @param {String} url WMS service endpoint.
           * @param {String} title the label dispayed for the layer in the layer manager.
           * @param {String} description the description dispayed for the layer in the layer manager.
           * @param {String} layer the layer name from the service to be add to the map.
           * @param {String} style the defined style name.
           * @param {String} format the format of the respose image/png .
           * @param {String} tileMatrixSetID the id the tileMatrixSet that will also define projection.
           * @param {Number} maximumLevel max zoom level.
           * @param {String} credit discliamer for the source of the data.
           */
          addWMTS: (uid, url, name, description, layer, style, format, tileMatrixSetID, maximumLevel, credit) => {
              const option = {
                  uid: uid,
                  type: "WMTS",
                  name: name,
                  description: description ? description : name,
                  url: url,
                  layer: layer,
                  style: style,
                  format: format,
                  tileMatrixSetID: tileMatrixSetID,
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
           * @param {String} url OGC Maps Restful endpoint.
           * @param {String} name the label dispayed for the layer in the layer manager.
           */
          addOgcMap: (uid, name, url) => {
              const option = {
                  type: "OgcMap",
                  uid: uid,
                  name: name,
                  show: true,
                  url: url
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
           * @param {String} description the description dispayed for the layer in the layer manager.
           * @param {String} layers the layer name from the service to be add to the map.
           * @param {String} format the format of the respose image/png .
           * @param {String} credit discliamer for the source of the data.
           */
          addWMS: (uid, url, name, description, layers, format, credit) => {
              const option = {
                  uid: uid,
                  type: "WMS",
                  name: name,
                  description: description ? description : name,
                  url: url,
                  layers: layers,
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
           * @param {String} url url to the tile set json.
           * @param {String} title the label dispayed for the layer in the layer manager.
           * @param {String} description the description dispayed for the layer in the layer manager.
           */
          add3DTiles: (uid, url, title, description) => {
              const option = {
                  uid: uid,
                  type: "3D_TILES",
                  name: title,
                  description: description,
                  url: url,
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
           * Adds a data source to the 3D map, replacing any existing data source with the same UID.
           */
          addDataSource: (uid, url, name, description, type, sourceLayerIndex, id) => {
              const option = {
                  uid,
                  type,
                  name: name,
                  description,
                  url,
                  sourceLayerIndex,
                  id
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
           * @param {String} uid unique identifier for the layer.
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
           * @returns Return the current map state as json.
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
           *
           * @returns return the new map state.
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
           * @returns Return the default map state as json.
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
           *
           * @returns The default Map State from the server.
           */
          fetchDefaultMapState: async function (force) {
              let url = localStorage.Default3dMapUrl;
              if (!url) {
                  console.log("Using State.json");
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
           * @returns The Map State after it is loaded which might be from the server.
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

          raiseMapStateChangedEvent: () => {
              const cesiumWindow = window.csltWindowRegistry.getWindow("3d");
              cesiumWindow.dispatchEvent(new Event("mapStateChanged"));
          },

          raiseMapStateSavedEvent: () => {
              const cesiumWindow = window.csltWindowRegistry.getWindow("3d");
              cesiumWindow.dispatchEvent(new Event("mapStateSaved"));
          },

          raiseMapStateLoadedEvent: () => {
              const cesiumWindow = window.csltWindowRegistry.getWindow("3d");
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
