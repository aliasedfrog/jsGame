import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export interface KennyAsset {
  name: string;
  path: string;
  type: 'building' | 'character' | 'prop';
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class KennyAssetService {
  private fbxLoader: FBXLoader;
  private loadedModels: Map<string, THREE.Group> = new Map();

  // Kenny asset configurations
  private kennyAssets: KennyAsset[] = [
    // Industrial Buildings
    { name: 'factory-a', path: 'assets/models/buildings/building-a.fbx', type: 'building', description: 'Industrial Factory A' },
    { name: 'power-plant', path: 'assets/models/buildings/building-e.fbx', type: 'building', description: 'Power Plant' },
    { name: 'warehouse-a', path: 'assets/models/buildings/building-c.fbx', type: 'building', description: 'Warehouse A' },
    { name: 'steel-mill', path: 'assets/models/buildings/building-g.fbx', type: 'building', description: 'Steel Mill' },
    { name: 'research-lab', path: 'assets/models/buildings/building-j.fbx', type: 'building', description: 'Research Lab' },
    
    // Chimney types
    { name: 'chimney-small', path: 'assets/models/buildings/chimney-small.fbx', type: 'prop', description: 'Small Chimney' },
    { name: 'chimney-medium', path: 'assets/models/buildings/chimney-medium.fbx', type: 'prop', description: 'Medium Chimney' },
    { name: 'chimney-large', path: 'assets/models/buildings/chimney-large.fbx', type: 'prop', description: 'Large Chimney' },
    { name: 'storage-tank', path: 'assets/models/buildings/detail-tank.fbx', type: 'prop', description: 'Storage Tank' },
  ];

  constructor() {
    console.log('Kenny Asset Service initialized');
    
    // Initialize FBX loader with error handling and texture path resolution
    try {
      // Configure the manager to handle texture loading
      const manager = new THREE.LoadingManager();
      
      // Handle successful loading
      manager.onLoad = () => {
        console.log('All Kenny assets loaded successfully');
      };
      
      // Handle loading errors
      manager.onError = (url) => {
        console.warn(`Failed to load resource: ${url}`);
      };
      
      manager.setURLModifier((url) => {
        console.log(`Loading manager resolving URL: ${url}`);
        
        // Handle texture path resolution for Kenny assets
        if (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg')) {
          // Extract just the filename
          const filename = url.split('/').pop() || url;
          const resolvedPath = `assets/models/buildings/Textures/${filename}`;
          console.log(`Texture path resolved: ${url} -> ${resolvedPath}`);
          return resolvedPath;
        }
        
        // Handle relative paths that might be missing the assets prefix
        if (!url.startsWith('http') && !url.startsWith('assets/') && !url.startsWith('/')) {
          const resolvedPath = `assets/${url}`;
          console.log(`Relative path resolved: ${url} -> ${resolvedPath}`);
          return resolvedPath;
        }
        
        return url;
      });
      
      this.fbxLoader = new FBXLoader(manager);
      console.log('FBX Loader initialized successfully with texture path resolution');
    } catch (error) {
      console.error('Failed to initialize FBX Loader:', error);
      throw error;
    }
    
    console.log('Available assets:', this.kennyAssets.map(a => a.name).join(', '));
  }

  public async loadKennyAsset(name: string): Promise<THREE.Group | null> {
    // Check if already loaded
    if (this.loadedModels.has(name)) {
      return this.loadedModels.get(name)!.clone();
    }

    const assetConfig = this.kennyAssets.find(asset => asset.name === name);
    if (!assetConfig) {
      console.warn(`Kenny asset '${name}' not found`);
      return null;
    }

    try {
      // Try to load the actual FBX model first
      console.log(`Attempting to load real Kenny FBX: ${name} - ${assetConfig.description}`);
      const model = await this.loadFBXModel(assetConfig.path);
      this.loadedModels.set(name, model);
      console.log(`Successfully loaded Kenny FBX: ${name} - ${assetConfig.description}`);
      return model.clone();
    } catch (error) {
      console.warn(`FBX loading failed for ${name}, using mock fallback:`, error);
      
      // Fallback to mock building if FBX fails
      const mockModel = this.createMockKennyBuilding(assetConfig);
      // Don't cache mock models to allow retry of FBX loading later
      return mockModel;
    }
  }

  private createMockKennyBuilding(asset: KennyAsset): THREE.Group {
    const group = new THREE.Group();
    
    // Create different building styles based on the asset type
    switch (asset.type) {
      case 'building':
        return this.createMockBuilding(asset.name);
      case 'prop':
        return this.createMockProp(asset.name);
      default:
        return this.createMockBuilding(asset.name);
    }
  }

  private createMockBuilding(name: string): THREE.Group {
    const building = new THREE.Group();
    
    // Create different building types based on name
    let color = 0x666666;
    let height = 3;
    let width = 4;
    let depth = 4;
    
    switch (name) {
      case 'factory-a':
        color = 0x8B4513; // Brown for factory
        height = 4;
        width = 6;
        depth = 6;
        break;
      case 'power-plant':
        color = 0x4169E1; // Blue for power plant
        height = 5;
        width = 8;
        depth = 8;
        break;
      case 'warehouse-a':
        color = 0x708090; // Gray for warehouse
        height = 3;
        width = 8;
        depth = 6;
        break;
      case 'steel-mill':
        color = 0x2F4F4F; // Dark gray for steel mill
        height = 6;
        width = 6;
        depth = 6;
        break;
      case 'research-lab':
        color = 0x6A5ACD; // Purple for research
        height = 3;
        width = 5;
        depth = 5;
        break;
    }
    
    // Main building
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = height / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    building.add(mesh);
    
    // Add some details
    this.addBuildingDetails(building, width, height, depth, color);
    
    return building;
  }

  private createMockProp(name: string): THREE.Group {
    const prop = new THREE.Group();
    
    switch (name) {
      case 'chimney-large':
        const chimney = new THREE.Mesh(
          new THREE.CylinderGeometry(0.5, 0.7, 8),
          new THREE.MeshLambertMaterial({ color: 0x696969 })
        );
        chimney.position.y = 4;
        chimney.castShadow = true;
        prop.add(chimney);
        break;
        
      case 'chimney-medium':
        const medChimney = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.5, 6),
          new THREE.MeshLambertMaterial({ color: 0x696969 })
        );
        medChimney.position.y = 3;
        medChimney.castShadow = true;
        prop.add(medChimney);
        break;
        
      case 'storage-tank':
        const tank = new THREE.Mesh(
          new THREE.CylinderGeometry(2, 2, 3),
          new THREE.MeshLambertMaterial({ color: 0xC0C0C0 })
        );
        tank.position.y = 1.5;
        tank.castShadow = true;
        prop.add(tank);
        break;
    }
    
    return prop;
  }

  private addBuildingDetails(building: THREE.Group, width: number, height: number, depth: number, baseColor: number): void {
    // Add a roof
    const roofGeometry = new THREE.BoxGeometry(width + 0.5, 0.5, depth + 0.5);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: baseColor * 0.8 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = height + 0.25;
    roof.castShadow = true;
    building.add(roof);
    
    // Add some windows
    for (let i = 0; i < 3; i++) {
      const windowGeometry = new THREE.PlaneGeometry(0.5, 0.7);
      const windowMaterial = new THREE.MeshBasicMaterial({ color: 0x87CEEB, transparent: true, opacity: 0.7 });
      const window = new THREE.Mesh(windowGeometry, windowMaterial);
      window.position.set(-width/2 + i * 1.5, height/2, depth/2 + 0.01);
      building.add(window);
    }
  }

  private loadFBXModel(path: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      console.log(`Attempting to load FBX: ${path}`);
      console.log(`Full URL will be: ${window.location.origin}/${path}`);
      
      if (!this.fbxLoader) {
        reject(new Error('FBX Loader not initialized'));
        return;
      }

      // First, let's test if the file is accessible via a simple fetch
      fetch(path)
        .then(response => {
          console.log(`Fetch test for ${path}: ${response.status} ${response.statusText}`);
          if (!response.ok) {
            throw new Error(`File not accessible: ${response.status} ${response.statusText}`);
          }
          return response.blob();
        })
        .then(blob => {
          console.log(`File ${path} is accessible, size: ${blob.size} bytes`);
          
          // Now try the FBX loader
          this.fbxLoader.load(
            path,
            (fbx) => {
              console.log(`Successfully loaded FBX: ${path}`);
              
              // Scale down the model (Kenny models are typically quite large)
              fbx.scale.set(0.01, 0.01, 0.01);
              
              // Enable shadows and fix materials on all meshes
              fbx.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                  
                  // Fix materials and handle undefined texture maps
                  if (child.material) {
                    this.fixMaterial(child);
                  }
                }
              });

              resolve(fbx);
            },
            (progress) => {
              // Loading progress (optional)
              if (progress.total > 0) {
                const loaded = (progress.loaded / progress.total) * 100;
                console.log(`Loading ${path}: ${loaded.toFixed(0)}%`);
              }
            },
            (error) => {
              console.error(`Error loading FBX model: ${path}`, error);
              console.error('Error details:', error);
              reject(error);
            }
          );
        })
        .catch(fetchError => {
          console.error(`File accessibility test failed for ${path}:`, fetchError);
          reject(fetchError);
        });
    });
  }

  public getAvailableAssets(): KennyAsset[] {
    return [...this.kennyAssets];
  }

  public getAssetsByType(type: 'building' | 'character' | 'prop'): KennyAsset[] {
    return this.kennyAssets.filter(asset => asset.type === type);
  }

  public preloadAssets(assetNames: string[]): Promise<(THREE.Group | null)[]> {
    const loadPromises = assetNames.map(name => this.loadKennyAsset(name));
    return Promise.all(loadPromises);
  }

  public dispose(): void {
    this.loadedModels.clear();
  }

  public getAttribution(): string {
    return 'Kenny Assets: Models by Kenney (www.kenney.nl) - License: CC0 1.0 Universal';
  }

  private fixMaterial(mesh: THREE.Mesh): void {
    if (Array.isArray(mesh.material)) {
      // Handle array of materials
      mesh.material = mesh.material.map(mat => this.createValidMaterial(mat));
    } else {
      // Handle single material
      mesh.material = this.createValidMaterial(mesh.material);
    }
  }

  private createValidMaterial(originalMaterial: THREE.Material): THREE.Material {
    // Create a fallback material with Kenny-style colors
    const fallbackColors = [0x8B4513, 0x696969, 0x2F4F4F, 0x556B2F, 0x8B0000];
    const randomColor = fallbackColors[Math.floor(Math.random() * fallbackColors.length)];
    
    // Try to preserve original properties when possible
    let color = randomColor;
    let map: THREE.Texture | null = null;
    
    if (originalMaterial instanceof THREE.MeshBasicMaterial || 
        originalMaterial instanceof THREE.MeshLambertMaterial ||
        originalMaterial instanceof THREE.MeshPhongMaterial) {
      
      // Preserve color if it exists and is valid
      if (originalMaterial.color) {
        color = originalMaterial.color.getHex();
      }
      
      // Only use map if it's valid and loaded
      if (originalMaterial.map && originalMaterial.map.image) {
        map = originalMaterial.map;
      }
    }
    
    // Create a new Lambert material with valid properties
    return new THREE.MeshLambertMaterial({
      color: color,
      map: map, // Only set if valid, otherwise null
      transparent: false,
      opacity: 1.0
    });
  }
}
