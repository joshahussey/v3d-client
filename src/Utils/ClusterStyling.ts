import { Cartesian3, DataSource, Math as CesiumMath, HeightReference, SceneMode, VerticalOrigin, Viewer } from "cesium";
import { colorFromRGBGradient, rgbaToHex } from "./Utils";

let defaultCache: Map<string, HTMLCanvasElement> = new Map<string, HTMLCanvasElement>();

export function styleDefaultClusters(dataSource: DataSource, viewer: Viewer) {
     dataSource.clustering.clusterEvent.addEventListener(
         function (clusteredEntities, cluster) {
            cluster.label.show = false;
            cluster.billboard.show = true;
            cluster.billboard.id = cluster.label.id;
            cluster.billboard.verticalOrigin = VerticalOrigin.BOTTOM;
            cluster.billboard.image = createClusterImage(clusteredEntities.length);
            cluster.billboard.width = 56;
            cluster.billboard.height = 56;
            //cluster.billboard!.disableDepthTestDistance = POSTIVE_INFINITY_PROPERTY;
            cluster.billboard.show = true;
             if (viewer.scene.mode === SceneMode.SCENE3D) {
                 cluster.billboard.heightReference = HeightReference.CLAMP_TO_GROUND;
             }
             cluster.billboard.eyeOffset = new Cartesian3(0, 0, -150000);
         }
     );
     const pixelRange = dataSource.clustering.pixelRange;
     dataSource.clustering.pixelRange = 0;
     dataSource.clustering.pixelRange = pixelRange;

}

export function createClusterImage(numPoints: number) {
    if (defaultCache.has(numPoints.toString())) {
        return defaultCache.get(numPoints.toString());
    }
    const text = numPoints.toString();
    const canvasWidth = 56;
    const canvasHeight = 56;
    const fontSize = 40;
    const font = "Browalia";
    const clusterCanvas: HTMLCanvasElement = document.createElement("CANVAS") as HTMLCanvasElement;
    clusterCanvas.width = canvasWidth;
    clusterCanvas.height = canvasHeight;
     const billboardImage = clusterCanvas.getContext("2d")!;
    billboardImage.arc(canvasWidth / 2, canvasHeight / 2, (canvasWidth - 6) / 2, 0, 2 * CesiumMath.PI, false);
    billboardImage.imageSmoothingQuality = "high";
    billboardImage.strokeStyle = "#000000";
    billboardImage.lineWidth = 3;
    billboardImage.fillStyle = rgbaToHex(colorFromRGBGradient(numPoints, 0, 1000));
    billboardImage.stroke();
    billboardImage.fill();
    billboardImage.fillStyle = "#FFFFFF";
    billboardImage.lineWidth = 1.5;
    billboardImage.font = chooseFontSize(billboardImage, text, canvasWidth - 6, fontSize, font);
    billboardImage.textAlign = "center";
    billboardImage.textBaseline = "middle";
    billboardImage.strokeText(text, canvasWidth / 2, canvasHeight / 2);
    billboardImage.fillText(text, canvasWidth / 2, canvasHeight / 2);
    defaultCache.set(numPoints.toString(), clusterCanvas);
    return clusterCanvas;
}

function chooseFontSize(
    context: CanvasRenderingContext2D,
    text: string,
    canvasWidth: number,
    maxFontSize: number,
    font: string
): string {
    context.font = `${maxFontSize.toString()}px ${font}`;
    const textDetails = context.measureText(text);
    if (textDetails.width <= canvasWidth) {
        return context.font;
    }
    return chooseFontSize(context, text, canvasWidth, maxFontSize - 5, font);
    }
 
