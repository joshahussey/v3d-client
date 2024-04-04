import { ColorBlendMode, HorizontalOrigin, LabelStyle, ShadowMode, VerticalOrigin } from "cesium";

export type Styled3dLayerDescriptor = {
    Name?: string;
    Title?: string;
    Abstract?: string;
    NamedLayer?: NamedLayer;
    UserLayer?: UserLayer;
};

export type NamedLayer = {
    Name: string;
    NamedStyle?: NamedStyle;
    UserStyle?: UserStyle[];
};

export type NamedStyle = {
    Name: string;
};

export type UserLayer = {
    Name: string;
    UserStyle: UserStyle;
};

export type UserStyle = {
    Name?: string;
    Title?: string;
    Abstract?: string;
    IsDefault?: boolean;
    FeatureTypeStyle: FeatureTypeStyle;
};

export type FeatureTypeStyle = {
    Name?: string;
    Title?: string;
    Abstract?: string;
    Rule: Rule[];
};

export type Rule = {
    Name?: string;
    Title?: string;
    Abstract?: string;
    Filter?: Filter; // Assuming Filter type as string for simplicity
    ElseFilter?: ElseFilter;
    PointSymbolizer?: PointSymbolizer;
    LineSymbolizer?: LineSymbolizer;
    PolygonSymbolizer?: PolygonSymbolizer;
    RasterSymbolizer?: RasterSymbolizer;
};

export type LineSymbolizer = {
    Width: number; // pixels
    Material: MaterialProperty;
    DepthFailMaterial?: MaterialProperty;
    Shadows?: ShadowMode;
    ZIndex?: number;
    Label?: Label;
    Billboard?: Billboard;
};

export type PointSymbolizer = {
    Point?: PointProperty;
    Model?: ModelProperty;
    Label?: Label;
    Billboard?: Billboard;
};

export type PointProperty = {
    Color: RGBA;
    OutlineColor?: RGBA;
    OutlineWidth?: number; // pixels
    Size: number; // pixels
};

export type ModelProperty = {
    url: string;
    scale?: number;
    MinimumPixelSize?: number; // pixels
    MaximumScale?: number;
    Shadows?: ShadowMode;
    SilhouetteColor?: RGBA;
    SilhouetteSize?: number;
    Color?: RGBA;
    ColorBlendMode?: ColorBlendMode;
    ColorBlendAmount?: number; // 0-1
    LightColor?: RGBA;
    Orientation?: {
        yaw: number; // radians
        pitch: number; // radians
        roll: number; // radians
    };
};

export type PolygonSymbolizer = {
    ExtrudedHeight?: number;
    TextureRotation?: number;
    Fill?: boolean;
    Material: MaterialProperty;
    Outline?: boolean;
    OutlineColor?: RGBA;
    OutlineWidth?: number; // pixels
    CloseTop?: boolean;
    CloseBottom?: boolean;
    Shadows?: ShadowMode;
    ZIndex?: number;
};

export type RasterSymbolizer = {
    Label: {
        Text: string;
        Font?: Font;
        LabelStyle?: LabelStyle;
        scale?: number;
        ShowBackground?: boolean;
        BackgroundColor?: RGBA;
        BackgroundPadding?: {
            vertical?: number;
            horizontal?: number;
        };
        PixelOffset?: {
            Vertical?: number; // pixels
            Horizontal?: number; // pixels
        };
        EyeOffset?: {
            Height?: number;
            Width?: number;
            depth?: number;
        };
        HorizontalOrigin?: HorizontalOrigin;
        VerticalOrigin?: VerticalOrigin;
        FillColor?: RGBA;
        OutlineColor?: RGBA;
        OutlineWidth?: number; // pixels
    };
};

export type Label = {
    Text: string;
    Font?: Font;
    LabelStyle?: LabelStyle;
    scale?: number;
    ShowBackground?: boolean;
    BackgroundColor?: boolean;
    BackgroundPadding?: {
        vertical: number;
        horizontal: number;
    };
    PixelOffset?: {
        Vertical: number; // pixels
        Horizontal: number; // pixels
    };
    EyeOffset?: {
        Height: number;
        Width: number;
        depth: number;
    };
    HorizontalOrigin?: HorizontalOrigin;
    VerticalOrigin?: VerticalOrigin;
    FillColor?: RGBA;
    OutlineColor?: RGBA;
    OutlineWidth?: number; // pixels
};
export type Billboard = {
    image: string;
    scale?: number;
    PixelOffset?: {
        Vertical?: number; // pixels
        Horizontal?: number; // pixels
    };
    EyeOffset?: {
        Height?: number;
        Width?: number;
        depth?: number;
    };
    HorizontalOrigin?: HorizontalOrigin;
    VerticalOrigin?: VerticalOrigin;
    Color?: RGBA;
    Rotation?: number; // radians
    SizeInMeters?: number;
    width?: number; // pixels
    height?: number; // pixels
};

export type MaterialProperty = {
    Material: MaterialType;
};

export type MaterialType =
    | MaterialImage
    | MaterialDiffuseMap
    | MaterialAlphaMap
    | MaterialSpecularMap
    | MaterialEmissionMap
    | MaterialBumpMap
    | MaterialNormalMap
    | MaterialGrid
    | MaterialStripe
    | MaterialCheckerboard
    | MaterialDot
    | MaterialWater
    | MaterialRimLighting
    | MaterialFade
    | MaterialPolylineArrow
    | MaterialPolylineDash
    | MaterialPolylineGlow
    | MaterialPolylineOutline
    | MaterialElevationContour
    | MaterialElevationRamp
    | MaterialSlopeRamp
    | MaterialAspectRamp
    | MaterialElevationBand;

export type RGBA = [number, number, number, number?];

export type Font = {
    size: string;
    family: string;
};

export type MaterialImage = {
    image: string;
    repeat: {
        x: number;
        y: number;
    };
};

export type MaterialDiffuseMap = {
    image: string;
    channels: string; // 3 char from 'r', 'g', 'b', & 'a'
    repeat: {
        x: number;
        y: number;
    };
};

export type MaterialAlphaMap = {
    image: string;
    channel: string; // 1 char from 'r', 'g', 'b', & 'a'
    repeat: {
        x: number;
        y: number;
    };
};

export type MaterialSpecularMap = {
    image: string;
    channel: string; // 1 char from 'r', 'g', 'b', & 'a'
    repeat: {
        x: number;
        y: number;
    };
};

export type MaterialEmissionMap = {
    image: string;
    channels: string; // 3 char from 'r', 'g', 'b', & 'a'
    repeat: {
        x: number;
        y: number;
    };
};

export type MaterialBumpMap = {
    image: string;
    channel: string; // 1 char from 'r', 'g', 'b', & 'a'
    repeat: {
        x: number;
        y: number;
    };
    strength: number; // 0-1
};

export type MaterialNormalMap = {
    image: string;
    channel: string; // 1 char from 'r', 'g', 'b', & 'a'
    repeat: {
        x: number;
        y: number;
    };
    strength: number; // 0-1
};

export type MaterialGrid = {
    Color: RGBA;
    cellAlpha: number;
    lineCount: {
        x: number;
        y: number;
    };
    lineThickness: {
        x: number; // pixels
        y: number; // pixels
    };
    lineOffset: {
        x: number; // 0-1
        y: number; // 0-1
    };
};

export type MaterialStripe = {
    Horizontal: boolean;
    evenColor: RGBA;
    oddColor: RGBA;
    Offset: number;
    Repeat: number; // whole
};

export type MaterialCheckerboard = {
    lightColor: RGBA;
    DarkColor: RGBA;
    repeat: {
        x: number;
        y: number;
    };
};

export type MaterialDot = {
    lightColor: RGBA;
    DarkColor: RGBA;
    repeat: {
        x: number;
        y: number;
    };
};

export type MaterialWater = {
    BaseWaterColor: RGBA;
    blendColor: RGBA;
    specularMap: string; // single channel image
    normalMap: string; // single channel image
    frequency: number;
    animationSpeed: number;
    amplitude: number;
    specularIntensity: number;
};

export type MaterialRimLighting = {
    color: RGBA;
    rimColor: RGBA;
    Width: number;
};

export type MaterialFade = {
    fadeInColor: RGBA;
    fadeOutColor: RGBA;
    maximumDistance: number; // 0-1
    repeat: boolean;
    fadeDirection: {
        x: boolean;
        y: boolean;
    };
    Time: {
        x: number; // 0-1
        y: number; // 0-1
    };
};

export type MaterialPolylineArrow = {
    Color: RGBA;
};

export type MaterialPolylineDash = {
    Color: RGBA;
    gapColor: RGBA;
    dashLength: number;
    dashPattern: string; // 16-bit binary
};

export type MaterialPolylineGlow = {
    Color: RGBA;
    GlowPower: number; // 0-1
    TaperPower: number;
};

export type MaterialPolylineOutline = {
    Color: RGBA;
    OutlineColor: RGBA;
    OutlineWidth: number; // pixel
};

export type MaterialElevationContour = {
    Color: RGBA;
    Spacing: number;
    Width: number;
};

export type MaterialElevationRamp = {
    image: string;
    minimumHeight: number;
    maximumHeight: number;
};

export type MaterialSlopeRamp = {
    image: string;
};

export type MaterialAspectRamp = {
    image: string;
};

export type MaterialElevationBand = {
    heights: string;
    colors: string;
};

export type Filter = And | Or | ValueComparison | PropertyComparison | (ValueComparison | PropertyComparison)[];
export type And = {
    And: Filter[];
};
export type Or = {
    Or: Filter[];
};

export type ValueOperator =
    | "=="
    | "!="
    | "<"
    | "<="
    | ">"
    | ">=";

export type PropertyOperator =
    | "PropertyIsNull"
    | "PropertyIsNotNull"
    | "PropertyIsEqualTo"
    | "PropertyIsNotEqualTo";

export type ValueComparison = {
    [key in ValueOperator]: {
        Property: string;
        Value: string | number | boolean;
    };
};

export type PropertyComparison = {
    [key in PropertyOperator]: {
        PropertyName: string;
        Literal: string;
    };
};

export type ElseFilter = Filter; // Define actual type if needed
