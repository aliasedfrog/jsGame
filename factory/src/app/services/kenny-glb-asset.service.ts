import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TextureManagerService } from './texture-manager.service';

export interface KennyAssetInfo {
  name: string;
  path: string;
  type: 'building' | 'character' | 'prop';
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class KennyGLBAssetService {
  private gltfLoader!: GLTFLoader;
  private loadedModels: Map<string, THREE.Group> = new Map();

  // Kenny GLB asset configurations
  private kennyAssets: KennyAssetInfo[] = [
    // Industrial Buildings
    { name: 'factory-a', path: 'assets/models/buildings/glb/building-a.glb', type: 'building', description: 'Industrial Factory A' },
    { name: 'factory-b', path: 'assets/models/buildings/glb/building-b.glb', type: 'building', description: 'Industrial Factory B' },
    { name: 'warehouse-a', path: 'assets/models/buildings/glb/building-c.glb', type: 'building', description: 'Warehouse A' },
    { name: 'warehouse-b', path: 'assets/models/buildings/glb/building-d.glb', type: 'building', description: 'Warehouse B' },
    { name: 'power-plant', path: 'assets/models/buildings/glb/building-e.glb', type: 'building', description: 'Power Plant' },
    { name: 'research-lab', path: 'assets/models/buildings/glb/building-f.glb', type: 'building', description: 'Research Laboratory' },
    { name: 'storage-silo', path: 'assets/models/buildings/glb/building-g.glb', type: 'building', description: 'Storage Silo' },
    { name: 'mining-facility', path: 'assets/models/buildings/glb/building-h.glb', type: 'building', description: 'Mining Facility' },
    { name: 'processing-plant', path: 'assets/models/buildings/glb/building-i.glb', type: 'building', description: 'Processing Plant' },
    { name: 'office-building', path: 'assets/models/buildings/glb/building-j.glb', type: 'building', description: 'Office Building' },
    { name: 'assembly-line', path: 'assets/models/buildings/glb/building-k.glb', type: 'building', description: 'Assembly Line' },
    { name: 'chemical-plant', path: 'assets/models/buildings/glb/building-l.glb', type: 'building', description: 'Chemical Plant' },
    
    // Commercial Buildings (from commercial kenny pack)
    { name: 'shop-a', path: 'assets/models/commercial/shop-a.glb', type: 'building', description: 'Shop A' },
    { name: 'shop-b', path: 'assets/models/commercial/shop-b.glb', type: 'building', description: 'Shop B' },
    { name: 'restaurant', path: 'assets/models/commercial/restaurant.glb', type: 'building', description: 'Restaurant' },
    
    // Roads (from roads kenny pack)
    { name: 'road-straight', path: 'assets/models/roads/glb/road-straight.glb', type: 'prop', description: 'Straight Road' },
    { name: 'road-curve', path: 'assets/models/roads/glb/road-curve.glb', type: 'prop', description: 'Road Curve' },
    { name: 'road-intersection', path: 'assets/models/roads/glb/road-intersection.glb', type: 'prop', description: 'Road Intersection' },
    
    // Suburban elements (from suburban kenny pack)
    { name: 'house-a', path: 'assets/models/suburban/house-a.glb', type: 'building', description: 'House A' },
    { name: 'house-b', path: 'assets/models/suburban/house-b.glb', type: 'building', description: 'House B' },
    
    // Characters
    { name: 'worker-a', path: 'assets/models/characters/glb/character-a.glb', type: 'character', description: 'Worker A' },
    { name: 'worker-b', path: 'assets/models/characters/glb/character-b.glb', type: 'character', description: 'Worker B' },
    { name: 'worker-c', path: 'assets/models/characters/glb/character-c.glb', type: 'character', description: 'Worker C' },
    { name: 'engineer', path: 'assets/models/characters/glb/character-d.glb', type: 'character', description: 'Engineer' },
  ];

  constructor(private textureManager: TextureManagerService) {
    console.log('Kenny GLB Asset Service initialized');
    this.initializeGLTFLoader();
    console.log('Available Kenny GLB assets:', this.kennyAssets.map((a: KennyAssetInfo) => a.name).join(', '));
  }

  private initializeGLTFLoader(): void {
    // Configure the manager to handle loading and texture path resolution
    const manager = new THREE.LoadingManager();
    
    manager.onLoad = () => {
      console.log('All Kenny GLB assets loaded successfully');
    };
    
    manager.onError = (url) => {
      console.warn(`Failed to load Kenny GLB resource: ${url}`);
    };
    
    // Add URL modifier to resolve texture paths
    manager.setURLModifier((url) => {
      console.log(`GLTF Loading manager resolving URL: ${url}`);
      
      // Handle texture path resolution for Kenny GLB assets
      if (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg')) {
        // Extract just the filename
        const filename = url.split('/').pop() || url;
        
        // If it's a character texture
        if (filename.startsWith('texture-')) {
          const resolvedPath = `assets/models/characters/glb/${filename}`;
          console.log(`Character texture path resolved: ${url} -> ${resolvedPath}`);
          return resolvedPath;
        }
        
        // If it's a building texture (colormap.png for Kenny assets)
        if (filename === 'colormap.png' || url.includes('Textures/')) {
          // Check if we're loading from a specific category
          if (url.includes('commercial') || url.includes('Commercial')) {
            const resolvedPath = `assets/models/commercial/Textures/${filename}`;
            console.log(`Commercial texture path resolved: ${url} -> ${resolvedPath}`);
            return resolvedPath;
          } else if (url.includes('roads') || url.includes('Roads')) {
            const resolvedPath = `assets/models/roads/Textures/${filename}`;
            console.log(`Roads texture path resolved: ${url} -> ${resolvedPath}`);
            return resolvedPath;
          } else if (url.includes('suburban') || url.includes('Suburban')) {
            const resolvedPath = `assets/models/suburban/Textures/${filename}`;
            console.log(`Suburban texture path resolved: ${url} -> ${resolvedPath}`);
            return resolvedPath;
          } else {
            // Default to buildings for backward compatibility
            const resolvedPath = `assets/models/buildings/glb/${filename}`;
            console.log(`Building texture path resolved: ${url} -> ${resolvedPath}`);
            return resolvedPath;
          }
        }
        
        // Default texture path resolution
        const resolvedPath = `assets/models/buildings/glb/${filename}`;
        console.log(`Default texture path resolved: ${url} -> ${resolvedPath}`);
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
    
    this.gltfLoader = new GLTFLoader(manager);
    console.log('GLTF Loader initialized successfully with texture path resolution');
  }

  public async loadKennyAsset(name: string): Promise<THREE.Group | null> {
    // Check if already loaded
    if (this.loadedModels.has(name)) {
      console.log(`Returning cached Kenny GLB asset: ${name}`);
      return this.loadedModels.get(name)!.clone();
    }

    // Find asset configuration or construct dynamic path
    let assetPath: string;
    const assetConfig = this.kennyAssets.find(asset => asset.name === name);
    
    if (assetConfig) {
      assetPath = assetConfig.path;
    } else {
      // Handle dynamic asset paths for new Kenny assets
      if (name.includes('/')) {
        // Path includes category like 'commercial/building-a'
        const [category, assetName] = name.split('/');
        assetPath = `assets/models/${category}/${assetName}.glb`;
      } else {
        // Default to buildings directory for backward compatibility
        assetPath = `assets/models/buildings/glb/${name}.glb`;
      }
    }

    try {
      console.log(`Loading Kenny GLB asset: ${name} from ${assetPath}`);
      const model = await this.loadGLBModel(assetPath);
      
      if (model) {
        // Cache the original
        this.loadedModels.set(name, model);
        console.log(`Successfully loaded and cached Kenny GLB asset: ${name}`);
        
        // Return a clone for use
        return model.clone();
      }
      
      return null;
    } catch (error) {
      console.error(`Error loading Kenny GLB asset ${name}:`, error);
      return null;
    }
  }

  private loadGLBModel(path: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      console.log(`Attempting to load GLB: ${path}`);
      
      if (!this.gltfLoader) {
        reject(new Error('GLTF Loader not initialized'));
        return;
      }

      // Test if the file is accessible
      fetch(path)
        .then(response => {
          console.log(`GLB file test for ${path}: ${response.status} ${response.statusText}`);
          if (!response.ok) {
            throw new Error(`GLB file not accessible: ${response.status} ${response.statusText}`);
          }
          return response.blob();
        })
        .then(blob => {
          console.log(`GLB file ${path} is accessible, size: ${blob.size} bytes`);
          
          // Now load with GLTF loader
          this.gltfLoader.load(
            path,
            (gltf) => {
              console.log(`Successfully loaded GLB: ${path}`);
              
              const model = gltf.scene;
              
              // Store asset name for material enhancement
              model.userData['assetName'] = name;
              
              // Scale Kenny models to appropriate size (they might be too small!)
              model.scale.set(1.0, 1.0, 1.0); // Try normal size first
              
              console.log('GLB Model loaded, original scale:', model.scale);
              console.log('GLB Model bounding box before processing:');
              const box = new THREE.Box3().setFromObject(model);
              console.log('  Min:', box.min);
              console.log('  Max:', box.max);
              console.log('  Size:', box.getSize(new THREE.Vector3()));
              
              // Configure shadows and materials
              let meshCount = 0;
              model.traverse((child) => {
                console.log('GLB child found:', child.type, child.name);
                if (child instanceof THREE.Mesh) {
                  meshCount++;
                  child.castShadow = true;
                  child.receiveShadow = true;
                  
                  console.log('  Mesh geometry:', child.geometry);
                  console.log('  Mesh material:', child.material);
                  
                  // Enhance materials for better visibility
                  if (child.material) {
                    this.enhanceMaterial(child);
                  }
                }
              });
              
              console.log(`GLB Model has ${meshCount} meshes`);
              console.log('GLB Model final bounding box:');
              const finalBox = new THREE.Box3().setFromObject(model);
              console.log('  Min:', finalBox.min);
              console.log('  Max:', finalBox.max);
              console.log('  Size:', finalBox.getSize(new THREE.Vector3()));

              resolve(model);
            },
            (progress) => {
              if (progress.total > 0) {
                const loaded = (progress.loaded / progress.total) * 100;
                console.log(`Loading GLB ${path}: ${loaded.toFixed(0)}%`);
              }
            },
            (error) => {
              console.error(`Error loading GLB model: ${path}`, error);
              reject(error);
            }
          );
        })
        .catch(fetchError => {
          console.error(`GLB file accessibility test failed for ${path}:`, fetchError);
          reject(fetchError);
        });
    });
  }

  private enhanceMaterial(mesh: THREE.Mesh): void {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(mat => this.processMaterial(mat, mesh));
    } else {
      this.processMaterial(mesh.material, mesh);
    }
  }

  private processMaterial(material: THREE.Material, mesh: THREE.Mesh): void {
    console.log('Processing material:', material.type, material);
    
    if (material instanceof THREE.MeshStandardMaterial) {
      // Enhance standard materials with better PBR properties
      material.roughness = 0.7;
      material.metalness = 0.1;
      material.visible = true;
      
      // Apply factory-appropriate materials based on mesh name or model type
      if (mesh.parent && mesh.parent.userData['assetName']) {
        const assetName = mesh.parent.userData['assetName'] as string;
        this.applyBuildingMaterial(material, assetName);
      }
      
      console.log('Enhanced MeshStandardMaterial:', material);
    } else if (material instanceof THREE.MeshBasicMaterial) {
      // Convert basic materials to standard materials for better lighting
      const standardMaterial = new THREE.MeshStandardMaterial({
        color: material.color,
        map: material.map,
        transparent: material.transparent,
        opacity: material.opacity
      });
      
      // Replace the basic material with enhanced standard material
      mesh.material = standardMaterial;
      material.visible = true;
      console.log('Converted MeshBasicMaterial to MeshStandardMaterial');
    }
    
    // Ensure all materials are visible
    material.visible = true;
    material.transparent = false;
    material.opacity = 1.0;
  }

  public getAvailableAssets(): KennyAssetInfo[] {
    return [...this.kennyAssets];
  }

  public getAssetsByType(type: 'building' | 'character' | 'prop'): KennyAssetInfo[] {
    return this.kennyAssets.filter(asset => asset.type === type);
  }

  public preloadAssets(assetNames: string[]): Promise<void[]> {
    console.log('Preloading Kenny GLB assets:', assetNames);
    const loadPromises = assetNames.map(name => 
      this.loadKennyAsset(name).then(() => {
        console.log(`Preloaded Kenny GLB asset: ${name}`);
      })
    );
    return Promise.all(loadPromises);
  }

  public dispose(): void {
    this.loadedModels.forEach((model, name) => {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });
    this.loadedModels.clear();
    console.log('Kenny GLB Asset Service disposed');
  }

  public getAttribution(): string {
    return 'Kenny Assets: Models by Kenney (www.kenney.nl) - License: CC0 1.0 Universal';
  }

  private applyBuildingMaterial(material: THREE.MeshStandardMaterial, assetName: string): void {
    // Apply appropriate material properties based on building type
    if (assetName.includes('factory') || assetName.includes('industrial')) {
      // Steel/metal buildings
      material.roughness = 0.3;
      material.metalness = 0.8;
      material.color.setHex(0x8A8A8A);
    } else if (assetName.includes('warehouse') || assetName.includes('storage')) {
      // Concrete/industrial buildings
      material.roughness = 0.7;
      material.metalness = 0.1;
      material.color.setHex(0xA9A9A9);
    } else if (assetName.includes('power') || assetName.includes('chemical')) {
      // High-tech facilities
      material.roughness = 0.2;
      material.metalness = 0.9;
      material.color.setHex(0xC0C0C0);
    } else if (assetName.includes('research') || assetName.includes('office')) {
      // Modern buildings
      material.roughness = 0.4;
      material.metalness = 0.3;
      material.color.setHex(0xB0B0B0);
    } else if (assetName.includes('road')) {
      // Road surfaces
      material.roughness = 0.9;
      material.metalness = 0.0;
      material.color.setHex(0x404040);
    }
  }
}
