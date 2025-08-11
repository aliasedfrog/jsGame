import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { KennyGLBAssetService } from './kenny-glb-asset.service';
import { TextureManagerService } from './texture-manager.service';

export interface BuildingInfo {
  id: string;
  name: string;
  type: 'factory' | 'power' | 'storage' | 'research' | 'mining' | 'processing';
  position: { x: number, z: number };
  description: string;
  function: string;
  stats: {
    capacity?: number;
    powerGeneration?: number;
    powerConsumption?: number;
    outputRate?: number;
    workers?: number;
    efficiency?: number;
  };
}

export interface RoadNode {
  x: number;
  z: number;
  connections: RoadNode[];
  roadType: 'straight' | 'intersection' | 'curve' | 'end';
}

@Injectable({
  providedIn: 'root'
})
export class WorldGeneratorService {
  private worldSize = 128;
  private buildings: BuildingInfo[] = [];
  private roadNetwork: RoadNode[] = [];
  
  constructor(
    private kennyAssets: KennyGLBAssetService,
    private textureManager: TextureManagerService
  ) {}

  async generateIndustrialWorld(scene: THREE.Scene): Promise<void> {
    console.log(`Generating 128x128 industrial world...`);
    
    // Clear existing scene
    this.clearScene(scene);
    
    // Add terrain variation
    this.addTerrainVariation(scene);
    
    // Add resource deposits
    this.addResourceDeposits(scene);
    
    // Generate road network first
    this.generateRoadNetwork();
    
    // Place roads in the scene
    await this.placeRoads(scene);
    
    // Generate and place industrial buildings
    await this.generateIndustrialBuildings(scene);
    
    // Add infrastructure elements
    await this.addInfrastructure(scene);
    
    console.log(`World generation complete: ${this.buildings.length} buildings, ${this.roadNetwork.length} road nodes`);
  }

  private clearScene(scene: THREE.Scene): void {
    // Remove all objects except ground and lights
    const objectsToRemove = scene.children.filter(child => 
      !child.name.includes('light') && 
      !child.name.includes('ground') &&
      !child.name.includes('grid') &&
      !(child instanceof THREE.GridHelper)
    );
    
    objectsToRemove.forEach(obj => {
      scene.remove(obj);
    });
    
    // Clear buildings array
    this.buildings = [];
    this.roadNetwork = [];
  }

  private generateRoadNetwork(): void {
    // Create a grid-based road network
    const roadSpacing = 16; // Distance between roads
    const roadCount = Math.floor(this.worldSize / roadSpacing);
    
    // Generate main roads
    for (let i = 0; i < roadCount; i++) {
      for (let j = 0; j < roadCount; j++) {
        const x = (i - roadCount/2) * roadSpacing;
        const z = (j - roadCount/2) * roadSpacing;
        
        const node: RoadNode = {
          x,
          z,
          connections: [],
          roadType: 'intersection'
        };
        
        this.roadNetwork.push(node);
      }
    }
    
    // Connect adjacent nodes
    this.roadNetwork.forEach(node => {
      this.roadNetwork.forEach(otherNode => {
        if (node !== otherNode) {
          const distance = Math.sqrt(
            Math.pow(node.x - otherNode.x, 2) + Math.pow(node.z - otherNode.z, 2)
          );
          
          // Connect if nodes are adjacent (one road spacing apart)
          if (Math.abs(distance - roadSpacing) < 1) {
            node.connections.push(otherNode);
          }
        }
      });
    });
  }

  private async placeRoads(scene: THREE.Scene): Promise<void> {
    for (const node of this.roadNetwork) {
      try {
        // Determine road type based on connections
        let roadAssetName = 'road-straight';
        
        if (node.connections.length >= 3) {
          roadAssetName = 'road-intersection';
        } else if (node.connections.length === 2) {
          // Check if it's a corner (90-degree turn)
          const conn1 = node.connections[0];
          const conn2 = node.connections[1];
          
          const dir1 = { x: conn1.x - node.x, z: conn1.z - node.z };
          const dir2 = { x: conn2.x - node.x, z: conn2.z - node.z };
          
          // If directions are perpendicular, it's a corner
          const dotProduct = dir1.x * dir2.x + dir1.z * dir2.z;
          if (Math.abs(dotProduct) < 0.1) {
            roadAssetName = 'road-corner';
          }
        }
        
        const road = await this.kennyAssets.loadKennyAsset(roadAssetName);
        if (road) {
          road.position.set(node.x, 0.1, node.z); // Slightly above ground to prevent z-fighting
          road.scale.set(1, 1, 1);
          
          // Rotate based on connections for proper alignment
          if (node.connections.length === 2 && roadAssetName === 'road-straight') {
            const conn = node.connections[0];
            const angle = Math.atan2(conn.z - node.z, conn.x - node.x);
            road.rotation.y = angle;
          }
          
          scene.add(road);
        }
      } catch (error) {
        console.warn(`Could not place road at ${node.x}, ${node.z}:`, error);
        
        // Fallback: create procedural road
        const roadGeometry = new THREE.PlaneGeometry(12, 12);
        const roadMaterial = this.textureManager.getMaterial('industrial_floor');
        roadMaterial.color.setHex(0x404040);
        
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.rotation.x = -Math.PI / 2;
        road.position.set(node.x, 0.05, node.z);
        road.receiveShadow = true;
        road.name = 'procedural-road';
        scene.add(road);
      }
    }
  }

  private async generateIndustrialBuildings(scene: THREE.Scene): Promise<void> {
    // Define zones for different building types
    const zones = [
      { name: 'Heavy Industry', centerX: -30, centerZ: -30, radius: 25, buildingTypes: ['building-sample'] },
      { name: 'Manufacturing', centerX: 30, centerZ: -30, radius: 20, buildingTypes: ['building-sample'] },
      { name: 'Processing', centerX: -30, centerZ: 30, radius: 20, buildingTypes: ['building-sample'] },
      { name: 'Research', centerX: 30, centerZ: 30, radius: 15, buildingTypes: ['building-sample'] }
    ];

    const buildingTemplates = {
      'building-sample': { 
        name: 'Industrial Building', 
        type: 'factory' as const, 
        description: 'Multi-purpose industrial facility', 
        function: 'Provides industrial capacity for the complex', 
        stats: { 
          capacity: 1000, 
          powerConsumption: 500, 
          outputRate: 800, 
          workers: 25, 
          efficiency: 85 
        }
      }
    };

    for (const zone of zones) {
      const buildingsInZone = 4 + Math.floor(Math.random() * 3); // 4-6 buildings per zone
      
      for (let i = 0; i < buildingsInZone; i++) {
        // Find a good position in the zone (away from roads)
        let position = this.findBuildingPosition(zone.centerX, zone.centerZ, zone.radius);
        
        if (position) {
          const buildingType = zone.buildingTypes[Math.floor(Math.random() * zone.buildingTypes.length)];
          const template = buildingTemplates[buildingType as keyof typeof buildingTemplates];
          
          try {
            const building = await this.kennyAssets.loadKennyAsset(buildingType);
            if (building) {
              building.position.set(position.x, 0, position.z);
              building.scale.set(3, 3, 3); // Scale up buildings
              scene.add(building);
              
              // Store building info
              const buildingInfo: BuildingInfo = {
                id: `${buildingType}-${i}`,
                name: template.name,
                type: template.type,
                position: { x: position.x, z: position.z },
                description: template.description,
                function: template.function,
                stats: template.stats
              };
              
              this.buildings.push(buildingInfo);
              console.log(`Placed building: ${buildingInfo.name} at (${position.x}, ${position.z})`);
            }
          } catch (error) {
            console.warn(`Could not load building ${buildingType}:`, error);
          }
        }
      }
    }
  }

  private findBuildingPosition(centerX: number, centerZ: number, radius: number): { x: number, z: number } | null {
    // Try to find a position that's not too close to roads
    for (let attempts = 0; attempts < 20; attempts++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      
      const x = centerX + Math.cos(angle) * distance;
      const z = centerZ + Math.sin(angle) * distance;
      
      // Check if position is too close to roads
      const minDistanceToRoad = 8;
      const tooCloseToRoad = this.roadNetwork.some(road => {
        const distToRoad = Math.sqrt(Math.pow(x - road.x, 2) + Math.pow(z - road.z, 2));
        return distToRoad < minDistanceToRoad;
      });
      
      if (!tooCloseToRoad) {
        return { x, z };
      }
    }
    
    return null; // Couldn't find a good position
  }

  private async addInfrastructure(scene: THREE.Scene): Promise<void> {
    // Add lights and other infrastructure
    const lightPositions: { x: number, z: number }[] = [];
    
    this.roadNetwork.forEach(node => {
      if (node.connections.length >= 3) {
        // Add lights around intersections
        lightPositions.push(
          { x: node.x + 8, z: node.z },
          { x: node.x - 8, z: node.z },
          { x: node.x, z: node.z + 8 },
          { x: node.x, z: node.z - 8 }
        );
      }
    });
    
    // Limit lights to avoid too many
    const maxLights = 20;
    const selectedLights = lightPositions.slice(0, maxLights);
    
    for (const pos of selectedLights) {
      // Create simple procedural light posts
      const postGeometry = new THREE.CylinderGeometry(0.2, 0.2, 8);
      const postMaterial = this.textureManager.getMaterial('steel');
      const post = new THREE.Mesh(postGeometry, postMaterial);
      post.position.set(pos.x, 4, pos.z);
      post.castShadow = true;
      post.receiveShadow = true;
      post.name = 'light-post';
      scene.add(post);
      
      // Add a light source
      const light = new THREE.PointLight(0xFFFFAA, 0.5, 30);
      light.position.set(pos.x, 8, pos.z);
      scene.add(light);
    }
  }

  private addTerrainVariation(scene: THREE.Scene): void {
    // Add terrain patches for visual variety
    const patchCount = 15;
    
    for (let i = 0; i < patchCount; i++) {
      const x = (Math.random() - 0.5) * this.worldSize;
      const z = (Math.random() - 0.5) * this.worldSize;
      const size = Math.random() * 6 + 3;
      
      // Choose terrain type
      const terrainTypes: ('dirt' | 'stone' | 'sand')[] = ['dirt', 'stone', 'sand'];
      const terrainType = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];
      
      // Create terrain patch
      const patchGeometry = new THREE.CircleGeometry(size, 8);
      const patchMaterial = this.textureManager.createTerrainMaterial(terrainType);
      const patch = new THREE.Mesh(patchGeometry, patchMaterial);
      
      patch.rotation.x = -Math.PI / 2;
      patch.position.set(x, 0.01, z); // Slightly above ground to prevent z-fighting
      patch.name = `terrain-${terrainType}-${i}`;
      
      scene.add(patch);
    }
  }

  private addResourceDeposits(scene: THREE.Scene): void {
    // Add resource deposits across the map
    const resourceTypes: ('iron' | 'coal' | 'copper' | 'stone')[] = ['iron', 'coal', 'copper', 'stone'];
    const depositsPerType = 6;
    
    resourceTypes.forEach(resourceType => {
      for (let i = 0; i < depositsPerType; i++) {
        // Place away from center and roads
        let x, z;
        do {
          x = (Math.random() - 0.5) * (this.worldSize - 20);
          z = (Math.random() - 0.5) * (this.worldSize - 20);
        } while (Math.abs(x % 16) < 4 && Math.abs(z % 16) < 4); // Avoid road areas
        
        // Main deposit
        const depositGeometry = new THREE.CylinderGeometry(2.5, 3, 1.2, 8);
        const depositMaterial = this.textureManager.createResourceDepositMaterial(resourceType);
        const deposit = new THREE.Mesh(depositGeometry, depositMaterial);
        
        deposit.position.set(x, 0.6, z);
        deposit.castShadow = true;
        deposit.receiveShadow = true;
        deposit.name = `resource-${resourceType}-${i}`;
        scene.add(deposit);
        
        // Add smaller resource chunks around the deposit
        for (let j = 0; j < 3; j++) {
          const chunkX = x + (Math.random() - 0.5) * 6;
          const chunkZ = z + (Math.random() - 0.5) * 6;
          
          const chunkGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.6);
          const chunkMaterial = this.textureManager.createResourceMaterial(resourceType);
          const chunk = new THREE.Mesh(chunkGeometry, chunkMaterial);
          
          chunk.position.set(chunkX, 0.2, chunkZ);
          chunk.rotation.y = Math.random() * Math.PI;
          chunk.castShadow = true;
          chunk.receiveShadow = true;
          chunk.name = `resource-chunk-${resourceType}-${i}-${j}`;
          scene.add(chunk);
        }
      }
    });
  }

  public getBuildingAt(x: number, z: number, threshold: number = 10): BuildingInfo | null {
    return this.buildings.find(building => 
      Math.abs(building.position.x - x) < threshold && 
      Math.abs(building.position.z - z) < threshold
    ) || null;
  }

  public getAllBuildings(): BuildingInfo[] {
    return [...this.buildings];
  }
}
