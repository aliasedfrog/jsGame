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
  private textureLoader = new THREE.TextureLoader();

  // Basic material configurations for factory game
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
    wood: {
      name: 'Wood',
      color: '#DEB887',
      metalness: 0.0,
      roughness: 0.6
    },
    brick: {
      name: 'Brick',
      color: '#B22222',
      metalness: 0.0,
      roughness: 0.8
    },
    glass: {
      name: 'Glass',
      color: '#E0F6FF',
      metalness: 0.0,
      roughness: 0.0
    },
    plastic: {
      name: 'Plastic',
      color: '#FF6B6B',
      metalness: 0.0,
      roughness: 0.3
    },
    copper: {
      name: 'Copper',
      color: '#B87333',
      metalness: 0.9,
      roughness: 0.1
    },
    aluminum: {
      name: 'Aluminum',
      color: '#C0C0C0',
      metalness: 0.9,
      roughness: 0.1
    },
    rubber: {
      name: 'Rubber',
      color: '#2F2F2F',
      metalness: 0.0,
      roughness: 0.9
    },
    ceramic: {
      name: 'Ceramic',
      color: '#F5F5DC',
      metalness: 0.0,
      roughness: 0.2
    },
    industrial_floor: {
      name: 'Industrial Floor',
      color: '#5D5D5D',
      metalness: 0.0,
      roughness: 0.6
    },
    rust: {
      name: 'Rust',
      color: '#B22222',
      metalness: 0.1,
      roughness: 0.9
    },
    chrome: {
      name: 'Chrome',
      color: '#C0C0C0',
      metalness: 1.0,
      roughness: 0.0
    }
  };

  constructor() {
    this.initializeMaterials();
  }

  private initializeMaterials(): void {
    // Create basic materials
    Object.entries(this.materialConfigs).forEach(([key, config]) => {
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(config.color),
        metalness: config.metalness,
        roughness: config.roughness,
        name: config.name
      });

      if (config.emissive) {
        material.emissive = new THREE.Color(config.emissive);
        material.emissiveIntensity = config.emissiveIntensity || 0.1;
      }

      this.materials.set(key, material);
    });

    // Create procedural textures for variety
    this.createProceduralTextures();
  }

  private createProceduralTextures(): void {
    // Create noise textures for materials that benefit from them
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Grass texture with noise
    this.createGrassTexture(ctx, canvas);
    
    // Metal texture with scratches
    this.createMetalTexture(ctx, canvas);
    
    // Stone texture with natural patterns
    this.createStoneTexture(ctx, canvas);
    
    // Concrete texture with subtle variation
    this.createConcreteTexture(ctx, canvas);
  }

  private createGrassTexture(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // Base grass color
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add noise for natural variation
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 40;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));     // R
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Create texture and update grass material
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    
    const grassMaterial = this.materials.get('grass')!;
    grassMaterial.map = texture;
    grassMaterial.needsUpdate = true;
  }

  private createMetalTexture(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // Base steel color
    ctx.fillStyle = '#B0C4DE';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add scratches and wear
    ctx.strokeStyle = 'rgba(160, 160, 160, 0.3)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 100; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      const length = Math.random() * 50 + 10;
      const angle = Math.random() * Math.PI * 2;
      ctx.lineTo(
        Math.random() * canvas.width + Math.cos(angle) * length,
        Math.random() * canvas.height + Math.sin(angle) * length
      );
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    
    const steelMaterial = this.materials.get('steel')!;
    steelMaterial.map = texture;
    steelMaterial.needsUpdate = true;
  }

  private createStoneTexture(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // Base stone color
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add natural stone patterns
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 20 + 5;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${100 + Math.random() * 50}, ${100 + Math.random() * 50}, ${100 + Math.random() * 50}, 0.3)`);
      gradient.addColorStop(1, 'rgba(128, 128, 128, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    
    // Create a stone material if not exists
    if (!this.materials.has('stone')) {
      const stoneMaterial = new THREE.MeshStandardMaterial({
        color: '#808080',
        metalness: 0.1,
        roughness: 0.8,
        name: 'Stone'
      });
      this.materials.set('stone', stoneMaterial);
    }
    
    const stoneMaterial = this.materials.get('stone')!;
    stoneMaterial.map = texture;
    stoneMaterial.needsUpdate = true;
  }

  private createConcreteTexture(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // Base concrete color
    ctx.fillStyle = '#A0A0A0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add concrete speckles and variation
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < 0.1) { // 10% chance for speckles
        const brightness = Math.random() * 60 - 30;
        data[i] = Math.max(0, Math.min(255, data[i] + brightness));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + brightness));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + brightness));
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5);
    
    const concreteMaterial = this.materials.get('concrete')!;
    concreteMaterial.map = texture;
    concreteMaterial.needsUpdate = true;
  }

  getMaterial(name: string): THREE.MeshStandardMaterial {
    return this.materials.get(name) || this.materials.get('default')!;
  }

  createTerrainMaterial(terrainType: 'dirt' | 'stone' | 'sand'): THREE.MeshStandardMaterial {
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

  public getAllMaterialNames(): string[] {
    return Array.from(this.materials.keys());
  }

  public createTerrainMaterial(materialType: 'grass' | 'dirt' | 'stone' | 'sand' = 'grass'): THREE.MeshStandardMaterial {
    return this.getMaterial(materialType).clone();
  }

  public createBuildingMaterial(materialType: 'steel' | 'concrete' | 'industrial_floor' = 'steel'): THREE.MeshStandardMaterial {
    return this.getMaterial(materialType).clone();
  }

  public createResourceMaterial(resourceType: 'iron' | 'coal' | 'copper' | 'stone'): THREE.MeshStandardMaterial {
    const material = this.getMaterial('steel').clone(); // Base metallic look
    
    const colors = {
      iron: '#C0C0C0',   // Silver
      coal: '#2F2F2F',   // Dark gray
      copper: '#B87333', // Copper brown
      stone: '#808080'   // Gray
    };
    
    material.color.setHex(parseInt(colors[resourceType].replace('#', '0x')));
    material.name = `resource-${resourceType}`;
    
    return material;
  }

  public createResourceDepositMaterial(resourceType: 'iron' | 'coal' | 'copper' | 'stone'): THREE.MeshStandardMaterial {
    const material = this.createResourceMaterial(resourceType);
    material.color.multiplyScalar(0.7); // Darker for deposits
    material.roughness = 0.8; // More rough for raw deposits
    material.name = `deposit-${resourceType}`;
    
    return material;
  }
}
