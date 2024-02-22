<%@ page language="java" contentType="text/html; charset=UTF-8"
pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html>
  <head>
    <meta charset="ISO-8859-1" />
    <title>load</title>
  </head>

  <body>
    <script>
      localStorage.cesiumMapState = JSON.stringify({
        accessToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiMDg1MTU5My05ZGVmLTQzOGQtYjY0Mi1kNzM2NGFhYzQ4MWYiLCJpZCI6NzAzMTUsImlhdCI6MTYzNDE3OTE3OH0.dFJM7KajiEEBMusTAo0oxzeMEjH0SHWZzKFh66E9kdc",
        baseMapLayers: [
          {
            uid: "79874ae8-45da-478b-9ceb-5d5a965f1bfa",
            type: "WMTS",
            baseMapLayer: true,
            name: "Open Street Maps",
            description: "Open Street Maps",
            url: "https://wmts-flash.compusult.net/tiles/openstreetmap{TileMatrixSet}/{TileMatrix}/{TileCol}/{TileRow}.png",
            style: "default",
            tileMatrixSetID: "3857",
            maximumLevel: 20,
            show: true,
            alpha: 1.0,
          },
          {
            uid: "27f8a3f7-86a6-4c27-9c96-5c981afc90f6",
            type: "ArcGis",
            baseMapLayer: true,
            name: "ArcGIS World Street Maps",
            description: "ArcGIS World Street Maps",
            url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer",
            show: true,
            alpha: 1.0,
          },
          {
            uid: "a39d2284-5cf8-41d9-8180-29470e3ab01b",
            type: "WMTS",
            baseMapLayer: true,
            name: "USGS Shaded Relief (via WMTS)",
            description: "USGS Shaded Relief (via WMTS)",
            url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer/WMTS",
            layer: "USGSShadedReliefOnly",
            style: "default",
            format: "image/jpeg",
            tileMatrixSetID: "default028mm",
            maximumLevel: 19,
            credit: "U. S. Geological Survey",
            show: true,
            alpha: 1.0,
          },
        ],
        imageLayers: [
          {
            uid: "79874ae8-45da-478b-9ceb-5d5a965f1bfa",
            type: "WMTS",
            baseMapLayer: true,
            name: "Open Street Maps",
            description: "Open Street Maps",
            url: "https://wmts-flash.compusult.net/tiles/openstreetmap{TileMatrixSet}/{TileMatrix}/{TileCol}/{TileRow}.png",
            style: "default",
            tileMatrixSetID: "3857",
            maximumLevel: 20,
            show: true,
            alpha: 1.0,
          },
          {
            uid: "33efaffd-1e2b-48c5-9eee-c9440522d80e",
            type: "WMS",
            name: "United States GOES Infrared",
            description: "United States GOES Infrared",
            url: "https://mesonet.agron.iastate.edu/cgi-bin/wms/goes/conus_ir.cgi?",
            layers: "goes_conus_ir",
            credit: "Infrared data courtesy Iowa Environmental Mesonet",
            parameters: {
              transparent: "true",
              format: "image/png",
            },
            show: false,
            alpha: 1.0,
          },
          {
            uid: "203b47c3-cebb-437e-a750-82c960ffd767",
            type: "WMS",
            name: "United States Weather Radar",
            description: "United States Weather Radar",
            url: "https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi?",
            layers: "nexrad-n0r",
            credit: "Radar data courtesy Iowa Environmental Mesonet",
            parameters: {
              transparent: "true",
              format: "image/png",
            },
            show: false,
            alpha: 1.0,
          },
        ],
        primitiveLayers: [
          {
            uid: "e2fa8977-e44b-4442-9287-2894eb17154e",
            type: "3D_TILES",
            name: "Philip 1 test 2894eb17154e",
            description: "Philip 1 2894eb17154e",
            url: "http://philp-10.compusult.net:8888/wes/3DTiles/e2fa8977-e44b-4442-9287-2894eb17154e/tileset.json?1",
            show: false,
          },
          {
            uid: "ce0edcc6-151f-4bd0-b196-bd628f1bba69",
            type: "3D_TILES",
            name: "Philip 2 bd628f1bba69",
            description: "Philip 2 test 2894eb17154e",
            url: "http://philp-10.compusult.net:8888/wes/3DTiles/ce0edcc6-151f-4bd0-b196-bd628f1bba69/tileset.json?2",
            show: true,
          },
          {
            uid: "d26c37a1-758f-44b5-8d17-cf182eccd7af",
            type: "3D_TILES",
            name: "Philip 3 cf182eccd7af",
            description: "Philip 3 test 2894eb17154e",
            url: "http://philp-10.compusult.net:8888/wes/3DTiles/d26c37a1-758f-44b5-8d17-cf182eccd7af/tileset.json?3",
            show: false,
          },
        ],
      });
    </script>

    <button
      type="button"
      style="
        font-size: xx-large;
        background-color: #04aa6d;
        color: ghostwhite;
        padding: 6px 15px;
        margin-top: 4px;
        margin-right: 10px;
        border-radius: 5px;
      "
      id="myBtn"
      onclick="location.reload()"
    >
      <b>Reset Map State</b>
    </button>
  </body>
</html>
