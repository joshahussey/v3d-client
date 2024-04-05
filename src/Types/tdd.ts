import { Cartesian3, HorizontalOrigin, LabelStyle, VerticalOrigin } from "cesium";

export type Styled3dLayerDescriptor = {
    StyledLayerDescriptor: StyledLayerDescriptor;
};

export type StyledLayerDescriptor = {
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
    Material: MaterialProperty | MaterialColor;
    DepthFailMaterial?: MaterialProperty | MaterialColor;
    Shadows?: Shadows;
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
    Url: string;
    Scale?: number;
    MinimumPixelSize?: number; // pixels
    MaximumScale?: number;
    Shadows?: Shadows;
    SilhouetteColor?: RGBA;
    SilhouetteSize?: number;
    Color?: RGBA;
    ColorBlendMode?: ColorBlends;
    ColorBlendAmount?: number; // 0-1
    LightColor?: RGBA;
    Orientation?: {
        Yaw: string | PropertyLookup; // radians
        Pitch: string | PropertyLookup; // radians
        Roll: string | PropertyLookup; // radians
    };
    DistanceDisplayCondition?: {
        Near: number;
        Far: number;
    };
};

export type PolygonSymbolizer = {
    ExtrudedHeight?: number;
    TextureRotation?: number;
    Fill?: boolean;
    Material: MaterialProperty | MaterialColor;
    Outline?: boolean;
    OutlineColor?: RGBA;
    OutlineWidth?: number; // pixels
    CloseTop?: boolean;
    CloseBottom?: boolean;
    Shadows?: Shadows;
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
    Text: string | { PropertyName: string };
    Font?: Font;
    LabelStyle?: LabelStyle;
    scale?: number;
    ShowBackground?: boolean;
    BackgroundColor?: RGBA;
    BackgroundPadding?: {
        Vertical: number;
        Horizontal: number;
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
    DistanceDisplayCondition?: {
        Near: number;
        Far: number;
    };
};
export type Billboard = {
    Image: string;
    Scale?: number;
    PixelOffset?: {
        Vertical: number;
        Horizontal: number;
    };
    EyeOffset?: {
        Height: number;
        Width: number;
        Depth: number;
    };
    HorizontalOrigin?: HorizontalOrigin;
    VerticalOrigin?: VerticalOrigin;
    Color?: RGBA;
    Rotation?: number;
    SizeInMeters?: number;
    Width?: number;
    Height?: number;
    DistanceDisplayCondition?: {
        Near: number;
        Far: number;
    };
};

export type MaterialProperty = { MaterialProperty: MaterialType; };

export type MaterialColor = { Color: RGBA; };

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
    Size: string;
    Family: string;
};

export type MaterialImage = {
    MaterialImage: {
        Image: string;
        Repeat: {
            x: number;
            y: number;
        };
    }
};

export type MaterialDiffuseMap = {
    Image: string;
    Channels: string; // 3 char from 'r', 'g', 'b', & 'a'
    Repeat: {
        x: number;
        y: number;
    };
};

export type MaterialAlphaMap = {
    Image: string;
    Channel: string; // 1 char from 'r', 'g', 'b', & 'a'
    Repeat: {
        x: number;
        y: number;
    };
};

export type MaterialSpecularMap = {
    Image: string;
    Channel: string; // 1 char from 'r', 'g', 'b', & 'a'
    Repeat: {
        x: number;
        y: number;
    };
};

export type MaterialEmissionMap = {
    Image: string;
    Channels: string; // 3 char from 'r', 'g', 'b', & 'a'
    Repeat: {
        x: number;
        y: number;
    };
};

export type MaterialBumpMap = {
    Image: string;
    Channel: string; // 1 char from 'r', 'g', 'b', & 'a'
    Repeat: {
        x: number;
        y: number;
    };
    Strength: number; // 0-1
};

export type MaterialNormalMap = {
    Image: string;
    Channel: string; // 1 char from 'r', 'g', 'b', & 'a'
    Repeat: {
        x: number;
        y: number;
    };
    Strength: number; // 0-1
};

export type MaterialGrid = {
    Color: RGBA;
    CellAlpha: number;
    LineCount: {
        x: number;
        y: number;
    };
    LineThickness: {
        x: number; // pixels
        y: number; // pixels
    };
    LineOffset: {
        x: number; // 0-1
        y: number; // 0-1
    };
};

export type MaterialStripe = {
    Horizontal: boolean;
    EvenColor: RGBA;
    OddColor: RGBA;
    Offset: number;
    Repeat: number; // whole
};

export type MaterialCheckerboard = {
    LightColor: RGBA;
    DarkColor: RGBA;
    Repeat: {
        x: number;
        y: number;
    };
};

export type MaterialDot = {
    LightColor: RGBA;
    DarkColor: RGBA;
    Repeat: {
        x: number;
        y: number;
    };
};

export type MaterialWater = {
    BaseWaterColor: RGBA;
    BlendColor: RGBA;
    SpecularMap: string; // single channel image
    NormalMap: string; // single channel image
    Frequency: number;
    AnimationSpeed: number;
    Amplitude: number;
    SpecularIntensity: number;
};

export type MaterialRimLighting = {
    Color: RGBA;
    RimColor: RGBA;
    Width: number;
};

export type MaterialFade = {
    FadeInColor: RGBA;
    FadeOutColor: RGBA;
    MaximumDistance: number; // 0-1
    Repeat: boolean;
    FadeDirection: {
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
    GapColor: RGBA;
    DashLength: number;
    DashPattern: string; // 16-bit binary
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
    Image: string;
    MinimumHeight: number;
    MaximumHeight: number;
};

export type MaterialSlopeRamp = {
    Image: string;
};

export type MaterialAspectRamp = {
    Image: string;
};

export type MaterialElevationBand = {
    Heights: string;
    Colors: string;
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
export type PropertyLookup = { PropertyName: string }; // Define actual type if needed

export type Shadows = "ENABLED" | "DISABLED" | "CAST_ONLY" | "RECEIVE_ONLY";

export type ColorBlends = "HIGHLIGHT" | "MIX" | "REPLACE";

export type BLProps = {
    image?: string;
    scale?: number;
    distanceDisplayCondition?: { near: number; far: number };
    eyeOffset?: Cartesian3;
    text?: string;
    font?: { Size: string; Family: string };
    fillColor?: RGBA;
    outlineColor?: RGBA;
    outlineWidth?: number;
    backgroundColor?: RGBA;
}

