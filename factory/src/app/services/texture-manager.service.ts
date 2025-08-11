import { Injectable } from '@angular/core';
import * as THREE from 'three';

export interface MaterialConfig {
  name: string;
  color: string;
  metalness: number;
  roughness: number;
  normalScale?: number;
  emissive?: string;
  emissiveIntensity?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TextureManagerService {
  private materials: Map<string, THREE.MeshStandardMaterial> = new Map();

  private materialConfigs: { [key: string]: MaterialConfig } = {
    default: {
      name: 'Default',
      color: '#FFFFFF',
      metalness: 0.0,
      roughness: 0.5
    },
    grass: {
      name: 'Grass',
      color: '#4CAF50',
      metalness: 0.0,
      roughness: 0.8
    },
    steel: {
      name: 'Steel',
      color: '#B0C4DE',
      metalness: 0.8,
      roughness: 0.2
    },
    concrete: {
      name: 'Concrete',
      color: '#A0A0A0',
      metalness: 0.0,
      roughness: 0.7
    },
    industrial_floor: {
      name: 'Industrial Floor',
      color: '#5D5D5D',
      metalness: 0.0,
      roughness: 0.6
    }
  };

  constructor() {
    this.initializeMaterials();
  }

  private initializeMaterials(): void {
    Object.entries(this.materialConfigs).forEach(([key, config]) => {
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(config.color),
        metalness: config.metalness,
        roughness: config.roughness,
        name: config.name
      });

      this.materials.set(key, material);
    });
  }

  getMaterial(name: string): THREE.MeshStandardMaterial {
    return this.materials.get(name) || this.materials.get('default')!;
  }

  createTerrainMaterial(terrainType: 'grass' | 'dirt' | 'stone' | 'sand' = 'grass'): THREE.MeshStandardMaterial {
    if (terrainType === 'grass') {
      return this.getMaterial('grass').clone();
    }
    
    const configs = {
      dirt: { color: '#8B4513', roughness: 0.9, metalness: 0.0 },
      stone: { color: '#696969', roughness: 0.8, metalness: 0.1 },
      sand: { color: '#F4A460', roughness: 0.7, metalness: 0.0 }
    };
    
    const config = configs[terrainType];
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.color),
      roughness: config.roughness,
      metalness: config.metalness,
      name: `terrain-${terrainType}`
    });
  }

  createResourceDepositMaterial(resourceType: 'iron' | 'coal' | 'copper' | 'stone'): THREE.MeshStandardMaterial {
    const configs = {
      iron: { color: '#CD853F', roughness: 0.6, metalness: 0.3 },
      coal: { color: '#2F2F2F', roughness: 0.9, metalness: 0.0 },
      copper: { color: '#B87333', roughness: 0.4, metalness: 0.7 },
      stone: { color: '#808080', roughness: 0.8, metalness: 0.1 }
    };
    
    const config = configs[resourceType];
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.color),
      roughness: config.roughness,
      metalness: config.metalness,
      name: `deposit-${resourceType}`
    });
  }

  createResourceMaterial(resourceType: 'iron' | 'coal' | 'copper' | 'stone'): THREE.MeshStandardMaterial {
    const configs = {
      iron: { color: '#C0C0C0', roughness: 0.3, metalness: 0.8 },
      coal: { color: '#1C1C1C', roughness: 0.9, metalness: 0.0 },
      copper: { color: '#FFA500', roughness: 0.2, metalness: 0.9 },
      stone: { color: '#A9A9A9', roughness: 0.7, metalness: 0.2 }
    };
    
    const config = configs[resourceType];
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.color),
      roughness: config.roughness,
      metalness: config.metalness,
      name: `resource-${resourceType}`
    });
  }
}
