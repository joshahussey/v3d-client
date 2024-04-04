import { Entity } from "cesium";
import WesDataSource from "../Datasources/WesDataSource";
import FeaturesApiDataSource from "../Datasources/FeaturesApiDataSource";

export function showEntityProperties(selectedEntity: Entity) {
    if (selectedEntity == null) return;
    if (selectedEntity.properties && selectedEntity.properties.clusterSize) return;
    styleInfoBox();
    if (selectedEntity.entityCollection == null) return;
    const datasource = selectedEntity.entityCollection.owner;
    if (datasource instanceof WesDataSource) {
        if (datasource instanceof FeaturesApiDataSource) {
            if (selectedEntity.properties != null && datasource._collectionInformation.propertyKey !== "") {
                selectedEntity.description =
                    selectedEntity.properties[datasource._collectionInformation.propertyKey].getValue();
            }
        }
    }
}

function styleInfoBox() {
    const infoBox = document.querySelectorAll("iframe[class='cesium-infoBox-iframe']");
    const contDoc = (infoBox[0] as HTMLIFrameElement).contentDocument;
    if (contDoc == null) return;
    const infoBoxDescriptionDiv = contDoc.querySelectorAll(
        "div.cesium-infoBox-description"
    )[0];
    (infoBoxDescriptionDiv as HTMLDivElement).style.color = "#000000";
    (infoBoxDescriptionDiv as HTMLDivElement).style.background = "#FFFFFF";
    (infoBoxDescriptionDiv as HTMLDivElement).style.borderBottomLeftRadius = "4px";
    (infoBoxDescriptionDiv as HTMLDivElement).style.borderBottomRightRadius = "4px";
}
