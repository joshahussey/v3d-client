import { Cartesian3, Color, ConstantProperty, DataSource, Entity, GeoJsonDataSource } from "cesium";
import { CesiumWindow, GeoJsonAoi, Wes3dMapLayer, WesDatasources } from "../Wes";
import { AOI_BUFFER_DATASOURCE_ID, AOI_BUFFER_METRES_KEY, AOI_DATASOURCE_ID } from "../Constants";
import WesDataSource from "../Datasources/WesDataSource";
import AoiDataSource from "../Datasources/AoiDataSource";

export async function handleAoiEvent(event: string) {
    let eventContent = decodeURIComponent(decodeURIComponent(event));
    const params = new URLSearchParams(eventContent);

    const aoisContent = params.get("AOIS");
    if (!aoisContent) {
        console.error("Received AOI update event without AOI key.");
        return;
    }
    const aoisArr = JSON.parse(aoisContent);

    let geoJson = aoisArr && aoisArr.length > 0 ? aoisArr[0] : undefined;

    const viewer = (window as CesiumWindow).Map3DViewer;
    const datasources = viewer.dataSources as WesDatasources;

    let uncastAoiDatasource = datasources._dataSources.find(ds => (ds as any).uid === "AOI");
    let aoiDatasource: AoiDataSource;

    if (geoJson) {
        if (uncastAoiDatasource == null) {
            aoiDatasource = new AoiDataSource(viewer);
            viewer.dataSources.add(aoiDatasource);
        } else {
            aoiDatasource = uncastAoiDatasource as AoiDataSource;
        }
        aoiDatasource.setAoiObject(geoJson);
        aoiDatasource.initialize();
    } else if (uncastAoiDatasource) {
        viewer.dataSources.remove(uncastAoiDatasource);
    }
}
/*
    // Parse the AOI GeoJSON and its corresponding buffer (if it exists)
    let aoi = undefined;

    if (aoisArr && aoisArr.length > 0) {
        for (const aoiEntry of aoisArr) {
            if (aoiEntry.properties?.wes_3d_aoi_id) {
                const aoiMatch = aoiEntry.properties.wes_3d_aoi_id.match(/main_[0-9]+$/);
                if (!aoiMatch) continue;

                aoi = aoiEntry;
            }
        }
    }

    if (!aoi) return;

    const buffer = aoi.properties[AOI_BUFFER_METRES_KEY];

    console.log(aoi);
    console.log(buffer);

    const viewer = (window as CesiumWindow).Map3DViewer;
    const datasources = viewer.dataSources as WesDatasources;

    let aoiDatasource = undefined;

    aoiDatasource = datasources._dataSources.find(d => d.uid == AOI_DATASOURCE_ID);

    console.log(aoiDatasource);

    if (aoiDatasource) datasources.remove(aoiDatasource);
    const newAoiDatasource = await GeoJsonDataSource.load(aoi, {
        clampToGround: true,
        stroke: Color.HOTPINK,
        strokeWidth: 6,
        markerSymbol: "AOI"
    });
    (newAoiDatasource as any).uid = AOI_DATASOURCE_ID;
    datasources.add(newAoiDatasource);

    if (bufferDatasource) datasources.remove(bufferDatasource);

    if (buffer) {
        const newBufferDatasource = await GeoJsonDataSource.load(buffer, {
            clampToGround: true,
            stroke: Color.AQUA,
            fill: Color.AQUA.withAlpha(0.5),
            markerSymbol: "?"
        });
        (newBufferDatasource as any).uid = AOI_BUFFER_DATASOURCE_ID;
        console.log("Adding buffer");
        console.log(buffer);
        console.log(newBufferDatasource);
        datasources.add(newBufferDatasource);
    }
}
/*
const aoi = ((!aoisArr) || aoisArr.length === 0) ? undefined : aoisArr.find((a: any) =>
  a.properties && a.properties.wes_3d_aoi_id && a.properties.wes_3d_aoi_id.startsWith("main_"));

GeoJsonDataSource.clampToGround = true;
const viewer = (window as CesiumWindow).Map3DViewer;
const datasources = (viewer.dataSources as WesDatasources);

let aoiDatasource, bufferAoiDatasource: DataSource | undefined = undefined;

for (let i = 0; i < datasources._dataSources.length; i++) {
  let dataSource = datasources._dataSources[i];
  if (dataSource.uid === AOI_DATASOURCE_ID) {
    aoiDatasource = dataSource;
  } else if (dataSource.uid === AOI_BUFFER_DATASOURCE_ID) {
    bufferAoiDatasource = dataSource;
  }
  if (aoiDatasource && bufferAoiDatasource) break;
}

if ((!aoiDatasource) && bufferAoiDatasource) {
  datasources.remove(bufferAoiDatasource);
}


  /*
    if (aoi) {
      if (aoiDatasource) {
        let entities: Entity[] = aoiDatasource.entities.values;
        if (entities.length === 0) {
          console.error("Unable to set AOI; the AOI data source has no entities.");
          return;
        }
        let polylineEntity: Entity | undefined = undefined;
  
        for (const entity of entities) {
          if (entity.polyline) {
            polylineEntity = entity;
            break;
          }
        }
  
        
  /*
        entities.forEach(e => {
          if (e.id !== polylineEntity.id) {
            aoiDatasource!.entities.remove(e);
          }
        });
  
        if ((! aoi.type) || aoi.type !== "LineString" || (! aoi.coordinates)) {
          console.error(`Unknown AOI type ${aoi.type}`);
          return;
        } else if (! polylineEntity.polyline) {
          console.error("Existing entity has no polyline.");
          return;
        }
  
        let positions: Cartesian3[] = [];
        let coordinates: number[][] = aoi.coordinates;
        console.log("coordinates");
        console.log(coordinates);
        for (let i = 0; i < coordinates.length; i++) {
          let coord: number[] = coordinates[i];
          console.log(coord);
          positions.push(Cartesian3.fromDegrees(coord[0], coord[1]));
        }
        polylineEntity.polyline!.positions = new ConstantProperty(positions);
      } else {
        aoiDatasource = await GeoJsonDataSource.load(aoi, {
          stroke: Color.HOTPINK,
          strokeWidth: 8,
          markerSymbol: "?"
        });
        (aoiDatasource as any).uid = AOI_DATASOURCE_ID;
  
        viewer.dataSources.add(aoiDatasource);
      }
    } else if (aoiDatasource) {
      viewer.dataSources.remove(aoiDatasource);
    }*/
