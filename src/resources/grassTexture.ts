import * as BABYLON from 'babylonjs';

export class GrassProceduralTexture extends BABYLON.ProceduralTexture {
    private _grassColors: BABYLON.Color3[];
    private _groundColor = new BABYLON.Color3(1, 1, 1);
    
    constructor(name: string, size: number, scene: BABYLON.Scene, fallbackTexture?: BABYLON.Texture, generateMipMaps?: boolean) {
        super(name, size, "/Shaders/grassProceduralTexture", scene, fallbackTexture, generateMipMaps);
        
        this._grassColors = [
            new BABYLON.Color3(0.29, 0.38, 0.02),
            new BABYLON.Color3(0.36, 0.49, 0.09),
            new BABYLON.Color3(0.51, 0.6, 0.28)
        ];
        
        this.updateShaderUniforms();
    }
    
    public updateShaderUniforms() {
        this.setColor3("herb1Color", this._grassColors[0]);
        this.setColor3("herb2Color", this._grassColors[1]);
        this.setColor3("herb3Color", this._grassColors[2]);
        this.setColor3("groundColor", this._groundColor);
    }
    
    public get grassColors(): BABYLON.Color3[] {
        return this._grassColors;
    }
    
    public set grassColors(value: BABYLON.Color3[]) {
        this._grassColors = value;
        this.updateShaderUniforms();
    }
    
    @BABYLON.serializeAsColor3()
    public get groundColor(): BABYLON.Color3 {
        return this._groundColor;
    }
    
    public set groundColor(value: BABYLON.Color3) {
        this._groundColor = value;
        this.updateShaderUniforms();
    }
    
    /**
    * Serializes this grass procedural texture
    * @returns a serialized grass procedural texture object
    */
    public serialize(): any {
        var serializationObject = BABYLON.SerializationHelper.Serialize(this, super.serialize());
        serializationObject.customType = "BABYLON.GrassProceduralTexture";
        
        serializationObject.grassColors = [];
        for (var i = 0; i < this._grassColors.length; i++) {
            serializationObject.grassColors.push(this._grassColors[i].asArray());
        }
        
        return serializationObject;
    }
    
    /**
    * Creates a Grass Procedural Texture from parsed grass procedural texture data
    * @param parsedTexture defines parsed texture data
    * @param scene defines the current scene
    * @param rootUrl defines the root URL containing grass procedural texture information
    * @returns a parsed Grass Procedural Texture
    */
    public static Parse(parsedTexture: any, scene: BABYLON.Scene, rootUrl: string): GrassProceduralTexture {
        var texture = BABYLON.SerializationHelper.Parse(() => new GrassProceduralTexture(parsedTexture.name, parsedTexture._size, scene, undefined, parsedTexture._generateMipMaps), parsedTexture, scene, rootUrl);
        
        var colors: BABYLON.Color3[] = [];
        for (var i = 0; i < parsedTexture.grassColors.length; i++) {
            colors.push(BABYLON.Color3.FromArray(parsedTexture.grassColors[i]));
        }
        
        texture.grassColors = colors;
        
        return texture;
    }
}