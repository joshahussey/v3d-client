type WGS84BoundingBox = {
    minX: number, 
    minY: number, 
    maxX: number, 
    maxY: number
}

type ServiceInfo = {
    serviceTitle: string;
    serviceId: string;
    serviceUrl: string;
};

type addWMS = {
    type: string,
    args: {
        uid: string,
        url: string,
        title: string,
        abstract: string,
        name: string,
        format: string,
        credit: string,
        wgs84BoundingBox: WGS84BoundingBox,
        serviceInfo: ServiceInfo
    }
}

type addWMTS = {
    type: string,
    args: {
        uid: string,
        resourceUrlTemplate: string,
        title: string,
        abstract: string,
        layerIdentifier: string,
        styleIdentifier: string,
        format: string,
        tileMatrixSetIdentifier: string,
        maximumLevel: number,
        credit: string,
        wgs84BoundingBox: WGS84BoundingBox,
        serviceInfo: ServiceInfo
    }
}

type addOgcMap = {
    type: string,
    args: {
        uid: string,
        title: string,
        url: string,
        wgs84BoundingBox: WGS84BoundingBox,
        serviceInfo: ServiceInfo
    }
}

type add3DTiles = {
    type: string,
    args: {
        uid: string,
        url: string,
        title: string,
        description: string,
        serviceInfo: ServiceInfo
    }
}

type addGeoJSON = {
    type: string,
    args: {
        uid: string,
        urlOrGeoJsonObject: string | JSON,
        title: string,
        description: string,
        serviceInfo: ServiceInfo
    }
}

type addKml = {
    type: string,
    args: {
        uid: string,
        url: string,
        title: string,
        description: string, 
        serviceInfo: ServiceInfo
    }
}

type addSensorThings = {
    type: string,
    args: {
        uid: string,
        url: string,
        title: string,
        description: string,
        wgs84BoundingBox: WGS84BoundingBox,
        serviceInfo: ServiceInfo
    }
}

type addOgcFeature = {
    type: string,
    args: {
        uid: string, 
        url: string, 
        title: string, 
        description: string,
        wgs84BoundingBox: WGS84BoundingBox, 
        serviceInfo: ServiceInfo
    }
}

type addOgcCoverage = {
    type: string,
    args: {
        uid: string, 
        url: string, 
        title: string, 
        description: string, 
        sourceLayerIndex: string, 
        id: string, 
        wgs84BoundingBox: WGS84BoundingBox,
        serviceInfo: ServiceInfo
    }
}