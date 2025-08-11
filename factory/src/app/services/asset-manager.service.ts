import { Injectable } from '@angular/core';
import * as THREE from 'three';

export interface AssetConfig {
  name: string;
  url: string;
  type: 'texture' | 'model' | 'audio';
  license: string;
  attribution?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AssetManagerService {
  private loadedTextures: Map<string, THREE.Texture> = new Map();
  private loadedModels: Map<string, THREE.Group> = new Map();
  private loadedAudio: Map<string, HTMLAudioElement> = new Map();

  // Free asset configurations
  private assetConfigs: AssetConfig[] = [
    {
      name: 'concrete-texture',
      url: 'assets/textures/concrete.jpg',
      type: 'texture',
      license: 'CC0',
      attribution: 'Created procedurally'
    },
    {
      name: 'metal-texture',
      url: 'assets/textures/metal.jpg', 
      type: 'texture',
      license: 'CC0',
      attribution: 'Created procedurally'
    },
    {
      name: 'factory-ambient',
      url: 'assets/audio/factory-ambient.ogg',
      type: 'audio',
      license: 'CC-BY',
      attribution: 'Factory Ambiance by Various Artists'
    }
  ];

  constructor() {}

  public async loadAsset(name: string): Promise<THREE.Texture | THREE.Group | HTMLAudioElement | null> {
    const config = this.assetConfigs.find(asset => asset.name === name);
    if (!config) {
      console.warn(`Asset '${name}' not found in configurations`);
      return null;
    }

    // Check if already loaded
    switch (config.type) {
      case 'texture':
        if (this.loadedTextures.has(name)) {
          return this.loadedTextures.get(name)!;
        }
        return this.loadTexture(config);

      case 'model':
        if (this.loadedModels.has(name)) {
          return this.loadedModels.get(name)!.clone();
        }
        return this.loadModel(config);

      case 'audio':
        if (this.loadedAudio.has(name)) {
          return this.loadedAudio.get(name)!;
        }
        return this.loadAudio(config);

      default:
        return null;
    }
  }

  private async loadTexture(config: AssetConfig): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        config.url,
        (texture) => {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          this.loadedTextures.set(config.name, texture);
          console.log(`Loaded texture: ${config.name} (${config.license})`);
          if (config.attribution) {
            console.log(`Attribution: ${config.attribution}`);
          }
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error(`Failed to load texture: ${config.name}`, error);
          reject(error);
        }
      );
    });
  }

  private async loadModel(config: AssetConfig): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      const loader = new THREE.ObjectLoader();
      loader.load(
        config.url,
        (model) => {
          this.loadedModels.set(config.name, model as THREE.Group);
          console.log(`Loaded model: ${config.name} (${config.license})`);
          if (config.attribution) {
            console.log(`Attribution: ${config.attribution}`);
          }
          resolve(model as THREE.Group);
        },
        undefined,
        (error) => {
          console.error(`Failed to load model: ${config.name}`, error);
          reject(error);
        }
      );
    });
  }

  private async loadAudio(config: AssetConfig): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(config.url);
      audio.addEventListener('canplaythrough', () => {
        this.loadedAudio.set(config.name, audio);
        console.log(`Loaded audio: ${config.name} (${config.license})`);
        if (config.attribution) {
          console.log(`Attribution: ${config.attribution}`);
        }
        resolve(audio);
      });
      audio.addEventListener('error', reject);
      audio.load();
    });
  }

  public getAssetAttribution(): string[] {
    return this.assetConfigs
      .filter(config => config.attribution)
      .map(config => `${config.name}: ${config.attribution} (${config.license})`);
  }

  public preloadAssets(assetNames: string[]): Promise<void> {
    const loadPromises = assetNames.map(async (name) => {
      try {
        await this.loadAsset(name);
      } catch (e) {
        console.warn('Asset load failed:', e);
      }
    });
    return Promise.all(loadPromises).then(() => {});
  }

  public dispose(): void {
    // Dispose of loaded resources
    this.loadedTextures.forEach(texture => texture.dispose());
    this.loadedTextures.clear();
    this.loadedModels.clear();
    this.loadedAudio.clear();
  }
}
