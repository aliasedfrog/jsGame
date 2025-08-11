import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { KennyBuildingsService } from './kenny-buildings.service';
import { KennyGLBAssetService } from './kenny-glb-asset.service';

@Injectable({
  providedIn: 'root'
})
export class DemoAssetsService {
  constructor(
    private kennyBuildings: KennyBuildingsService,
    private kennyGLBAssets: KennyGLBAssetService
  ) {}

  /**
   * Creates enhanced demo assets using Kenny's GLB models and procedural fallbacks
   */
  async createDemoScene(scene: THREE.Scene): Promise<void> {
    console.log('Creating KENNY-ONLY demo scene with new assets...');
    
    // Kenny GLB Industrial Zone (right side: X > 20)
    await this.addKennyIndustrialBuildings(scene);
    
    // Kenny Commercial Zone (left side: X < -5)
    await this.addKennyCommercialBuildings(scene);
    
    // Kenny Suburban Zone (center: X -5 to 20)
    await this.addKennySuburbanBuildings(scene);
    
    // Kenny Roads and Infrastructure
    await this.addKennyRoadsAndInfrastructure(scene);
    
    console.log('Kenny-only demo scene created with', scene.children.length, 'objects');
  }

  private async addKennyIndustrialBuildings(scene: THREE.Scene): Promise<void> {
    console.log('Loading Kenny industrial buildings...');
    
    // Kenny GLB buildings in Industrial Zone (right side: X >= 25)
    // Arranged in a nice industrial layout
    const kennyBuildings = [
      // Main factory complex
      { name: 'factory-a', position: [30, 0, -15], scale: 5.0, description: 'Main Factory' },
      { name: 'factory-b', position: [45, 0, -10], scale: 4.4, description: 'Secondary Factory' },
      { name: 'warehouse-a', position: [35, 0, 5], scale: 4.8, description: 'Storage Warehouse' },
      
      // Power and utilities
      { name: 'power-plant', position: [60, 0, -5], scale: 5.6, description: 'Power Plant' },
      { name: 'steel-mill', position: [25, 0, 10], scale: 4.6, description: 'Steel Mill' },
      
      // Research and admin
      { name: 'research-lab', position: [50, 0, 15], scale: 4.0, description: 'Research Lab' },
      { name: 'office-building', position: [40, 0, -25], scale: 4.4, description: 'Office Building' },
    ];

    let loadedCount = 0;
    for (const building of kennyBuildings) {
      try {
        console.log(`Loading Kenny GLB: ${building.description} (${building.name})`);
        const model = await this.kennyGLBAssets.loadKennyAsset(building.name);
        if (model) {
          model.position.set(building.position[0], building.position[1], building.position[2]);
          model.scale.set(building.scale, building.scale, building.scale);
          scene.add(model);
          loadedCount++;
          console.log(`✓ Loaded ${building.description} at (${building.position.join(', ')})`);
        } else {
          console.warn(`✗ Failed to load ${building.description}`);
        }
      } catch (error) {
        console.error(`Error loading ${building.description}:`, error);
      }
    }

    // Add Kenny props and details
    const kennyProps = [
      { name: 'chimney-large', position: [32, 0, -13], scale: 4.0, description: 'Large Chimney' },
      { name: 'storage-tank', position: [28, 0, 8], scale: 4.8, description: 'Storage Tank' },
      { name: 'chimney-medium', position: [48, 0, -8], scale: 3.6, description: 'Medium Chimney' },
      { name: 'chimney-small', position: [37, 0, 3], scale: 3.2, description: 'Small Chimney' },
    ];

    for (const prop of kennyProps) {
      try {
        const model = await this.kennyGLBAssets.loadKennyAsset(prop.name);
        if (model) {
          model.position.set(prop.position[0], prop.position[1], prop.position[2]);
          model.scale.set(prop.scale, prop.scale, prop.scale);
          scene.add(model);
          loadedCount++;
          console.log(`✓ Added ${prop.description}`);
        }
      } catch (error) {
        console.error(`Error loading ${prop.description}:`, error);
      }
    }

    // Add some Kenny characters in the factory area
    const characters = [
      { name: 'worker-a', position: [32, 0, -12], scale: -1.0, description: 'Factory Worker' },
      { name: 'worker-b', position: [38, 0, 2], scale: -1.0, description: 'Warehouse Worker' },
      { name: 'engineer', position: [52, 0, 13], scale: -1.0, description: 'Research Engineer' },
    ];

    for (const character of characters) {
      try {
        const model = await this.kennyGLBAssets.loadKennyAsset(character.name);
        if (model) {
          model.position.set(character.position[0], character.position[1], character.position[2]);
          // Use -1x scale to flip characters horizontally
          model.scale.set(-Math.abs(character.scale), Math.abs(character.scale), Math.abs(character.scale));
          scene.add(model);
          loadedCount++;
          console.log(`✓ Added ${character.description}`);
        }
      } catch (error) {
        console.error(`Error loading ${character.description}:`, error);
      }
    }

    console.log(`Kenny industrial zone complete: ${loadedCount} authentic Kenny assets loaded`);
  }

  private async addKennyCommercialBuildings(scene: THREE.Scene): Promise<void> {
    console.log('Loading Kenny commercial buildings...');
    
    // Commercial buildings on the left side (X < -5)
    const commercialBuildings = [
      { name: 'building-skyscraper-a', position: [-15, 0, -20], scale: 3.0, description: 'Office Skyscraper A' },
      { name: 'building-skyscraper-b', position: [-25, 0, -10], scale: 2.8, description: 'Office Skyscraper B' },
      { name: 'building-skyscraper-c', position: [-35, 0, 0], scale: 3.2, description: 'Office Skyscraper C' },
      { name: 'building-a', position: [-10, 0, -15], scale: 2.5, description: 'Commercial Building A' },
      { name: 'building-b', position: [-20, 0, 5], scale: 2.3, description: 'Commercial Building B' },
      { name: 'building-c', position: [-30, 0, -25], scale: 2.7, description: 'Commercial Building C' },
    ];

    let loadedCount = 0;
    for (const building of commercialBuildings) {
      try {
        const model = await this.kennyGLBAssets.loadKennyAsset(`commercial/${building.name}`);
        if (model) {
          model.position.set(building.position[0], building.position[1], building.position[2]);
          model.scale.set(building.scale, building.scale, building.scale);
          scene.add(model);
          loadedCount++;
          console.log(`✓ Added ${building.description}`);
        }
      } catch (error) {
        console.error(`Error loading ${building.description}:`, error);
      }
    }

    console.log(`Kenny commercial zone complete: ${loadedCount} buildings loaded`);
  }

  private async addKennySuburbanBuildings(scene: THREE.Scene): Promise<void> {
    console.log('Loading Kenny suburban buildings...');
    
    // Suburban buildings in the center (X -5 to 20)
    const suburbanBuildings = [
      { name: 'building-type-a', position: [0, 0, -10], scale: 2.0, description: 'House Type A' },
      { name: 'building-type-b', position: [5, 0, 0], scale: 1.8, description: 'House Type B' },
      { name: 'building-type-c', position: [10, 0, -15], scale: 2.2, description: 'House Type C' },
      { name: 'building-type-d', position: [15, 0, 5], scale: 1.9, description: 'House Type D' },
      { name: 'building-type-e', position: [-2, 0, 8], scale: 2.1, description: 'House Type E' },
      { name: 'tree-large', position: [2, 0, -5], scale: 3.0, description: 'Large Tree' },
      { name: 'tree-small', position: [8, 0, -8], scale: 2.5, description: 'Small Tree' },
    ];

    let loadedCount = 0;
    for (const building of suburbanBuildings) {
      try {
        const model = await this.kennyGLBAssets.loadKennyAsset(`suburban/${building.name}`);
        if (model) {
          model.position.set(building.position[0], building.position[1], building.position[2]);
          model.scale.set(building.scale, building.scale, building.scale);
          scene.add(model);
          loadedCount++;
          console.log(`✓ Added ${building.description}`);
        }
      } catch (error) {
        console.error(`Error loading ${building.description}:`, error);
      }
    }

    console.log(`Kenny suburban zone complete: ${loadedCount} buildings loaded`);
  }

  private async addKennyRoadsAndInfrastructure(scene: THREE.Scene): Promise<void> {
    console.log('Loading Kenny roads and infrastructure...');
    
    // Roads and infrastructure elements spread across the scene
    const roadElements = [
      { name: 'road-straight', position: [0, 0, -20], scale: 2.0, description: 'Main Road' },
      { name: 'road-intersection', position: [10, 0, -20], scale: 2.0, description: 'Intersection' },
      { name: 'road-curve', position: [20, 0, -20], scale: 2.0, description: 'Road Curve' },
      { name: 'construction-barrier', position: [25, 0, -30], scale: 1.5, description: 'Construction Barrier' },
      { name: 'construction-cone', position: [27, 0, -28], scale: 1.5, description: 'Construction Cone' },
      { name: 'light-square', position: [-5, 0, -25], scale: 2.5, description: 'Street Light' },
      { name: 'light-curved', position: [15, 0, -25], scale: 2.5, description: 'Curved Light' },
    ];

    let loadedCount = 0;
    for (const element of roadElements) {
      try {
        const model = await this.kennyGLBAssets.loadKennyAsset(`roads/${element.name}`);
        if (model) {
          model.position.set(element.position[0], element.position[1], element.position[2]);
          model.scale.set(element.scale, element.scale, element.scale);
          scene.add(model);
          loadedCount++;
          console.log(`✓ Added ${element.description}`);
        }
      } catch (error) {
        console.error(`Error loading ${element.description}:`, error);
      }
    }

    console.log(`Kenny roads and infrastructure complete: ${loadedCount} elements loaded`);
  }

  private addProceduralBuildings(scene: THREE.Scene): void {
    console.log('Adding procedural buildings in designated zone...');
    
    // Procedural buildings in Zone 2 (left side: X <= -10)
    // These use our Kenny-style procedural generation
    const proceduralBuildings = [
      { type: 'factory-a', position: [-15, 0, -10], description: 'Procedural Factory A' },
      { type: 'power-plant', position: [-25, 0, 5], description: 'Procedural Power Plant' },
      { type: 'warehouse-a', position: [-35, 0, -15], description: 'Procedural Warehouse' },
      { type: 'steel-mill', position: [-20, 0, 10], description: 'Procedural Steel Mill' },
      { type: 'research-lab', position: [-40, 0, 0], description: 'Procedural Research Lab' },
    ];

    let createdCount = 0;
    for (const building of proceduralBuildings) {
      try {
        console.log(`Creating ${building.description}`);
        const model = this.kennyBuildings.createKennyStyleBuilding(building.type);
        model.position.set(building.position[0], building.position[1], building.position[2]);
        scene.add(model);
        createdCount++;
        console.log(`✓ Created ${building.description} at (${building.position.join(', ')})`);
      } catch (error) {
        console.error(`Error creating ${building.description}:`, error);
      }
    }

    // Add procedural props
    const proceduralProps = [
      { type: 'chimney-large', position: [-17, 0, -8], description: 'Procedural Large Chimney' },
      { type: 'storage-tank', position: [-22, 0, 3], description: 'Procedural Storage Tank' },
      { type: 'chimney-medium', position: [-32, 0, -12], description: 'Procedural Medium Chimney' },
    ];

    for (const prop of proceduralProps) {
      try {
        const model = this.kennyBuildings.createKennyStyleBuilding(prop.type);
        model.position.set(prop.position[0], prop.position[1], prop.position[2]);
        scene.add(model);
        createdCount++;
        console.log(`✓ Created ${prop.description}`);
      } catch (error) {
        console.error(`Error creating ${prop.description}:`, error);
      }
    }

    console.log(`Procedural zone complete: ${createdCount} Kenny-style buildings created`);
  }  private async loadKennyBuildingsAsync(scene: THREE.Scene): Promise<void> {
    console.log('Loading Kenny-style buildings...');
    try {
      this.addKennyStyleBuildings(scene);
      console.log('Kenny-style buildings loaded successfully');
    } catch (error) {
      console.warn('Kenny-style buildings failed to load:', error);
    }
  }

  private async loadKennyGLBAssetsAsync(scene: THREE.Scene): Promise<void> {
    console.log('Loading actual Kenny GLB assets...');
    try {
      await this.addKennyGLBAssets(scene);
      console.log('Kenny GLB assets loaded successfully');
    } catch (error) {
      console.warn('Kenny GLB assets failed to load:', error);
    }
  }

  private setupDemoLighting(scene: THREE.Scene): void {
    // Enhanced ambient lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    // Main directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(50, 50, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // Factory lighting (warmer, industrial feel)
    const factoryLight = new THREE.DirectionalLight(0xffaa44, 0.3);
    factoryLight.position.set(-30, 20, -30);
    scene.add(factoryLight);

    // Add some atmospheric fog
    scene.fog = new THREE.Fog(0x87CEEB, 100, 300);
  }

  private addDemoBuildings(scene: THREE.Scene): void {
    // Create a sample iron mine with enhanced details
    const ironMine = this.createEnhancedIronMine();
    ironMine.position.set(-10, 0, -10);
    scene.add(ironMine);

    // Create a sample steel furnace with glowing effects
    const steelFurnace = this.createEnhancedSteelFurnace();
    steelFurnace.position.set(5, 0, 5);
    scene.add(steelFurnace);

    // Create a power plant with animated elements
    const powerPlant = this.createEnhancedPowerPlant();
    powerPlant.position.set(15, 0, -15);
    scene.add(powerPlant);
  }

  private addKennyStyleBuildings(scene: THREE.Scene): void {
    console.log('Adding Kenny-style buildings...');
    
    // Load and place various Kenny-style buildings
    const buildings = [
      { name: 'factory-a', position: [-10, 0, -10] },
      { name: 'power-plant', position: [5, 0, 5] },
      { name: 'warehouse-a', position: [15, 0, -15] },
      { name: 'steel-mill', position: [-5, 0, 10] },
      { name: 'research-lab', position: [20, 0, 0] }
    ];

    let loadedCount = 0;
    for (const building of buildings) {
      try {
        console.log(`Creating Kenny-style building: ${building.name}`);
        const model = this.kennyBuildings.createKennyStyleBuilding(building.name);
        model.position.set(building.position[0], building.position[1], building.position[2]);
        scene.add(model);
        loadedCount++;
        console.log(`Successfully created ${building.name}`);
      } catch (error) {
        console.error(`Error creating ${building.name}:`, error);
      }
    }

    // Add some props
    const props = [
      { name: 'chimney-large', position: [-8, 0, -8] },
      { name: 'storage-tank', position: [3, 0, 3] },
      { name: 'chimney-medium', position: [12, 0, -12] }
    ];

    for (const prop of props) {
      try {
        console.log(`Creating Kenny-style prop: ${prop.name}`);
        const model = this.kennyBuildings.createKennyStyleBuilding(prop.name);
        model.position.set(prop.position[0], prop.position[1], prop.position[2]);
        scene.add(model);
        loadedCount++;
        console.log(`Successfully created ${prop.name}`);
      } catch (error) {
        console.error(`Error creating ${prop.name}:`, error);
      }
    }

    console.log(`Kenny-style assets loading complete. Created ${loadedCount} models.`);
  }

  private async addKennyGLBAssets(scene: THREE.Scene): Promise<void> {
    console.log('Loading Kenny GLB assets...');
    
    // Start with just one building to debug
    try {
      console.log('Testing single Kenny GLB building...');
      const testModel = await this.kennyGLBAssets.loadKennyAsset('factory-a');
      if (testModel) {
        // Position it clearly visible and raised above ground
        testModel.position.set(0, 2, 15); // Raise it up by 2 units
        testModel.scale.set(3, 3, 3); // Make it even bigger so we can definitely see it
        scene.add(testModel);
        
        // Add a bright marker at the same position to show where it should be
        const marker = new THREE.Mesh(
          new THREE.SphereGeometry(0.5, 8, 6),
          new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        );
        marker.position.set(0, 6, 15); // Above the model
        scene.add(marker);
        
        // Add a platform underneath to make it more visible
        const platform = new THREE.Mesh(
          new THREE.BoxGeometry(8, 0.2, 8),
          new THREE.MeshLambertMaterial({ color: 0x444444 })
        );
        platform.position.set(0, 1.9, 15);
        scene.add(platform);
        
        console.log('SUCCESS: Test Kenny GLB model added to scene at (0,2,15) with 3x scale');
        console.log('Added green marker at (0,6,15) and platform underneath');
        console.log('Model details:', testModel);
        console.log('Model children count:', testModel.children.length);
        
        // Log all children to understand the structure
        testModel.traverse((child) => {
          console.log('Model child:', child.type, child.name, child);
          if (child instanceof THREE.Mesh) {
            console.log('  Mesh visible:', child.visible);
            console.log('  Mesh material visible:', child.material.visible);
            console.log('  Mesh position:', child.position);
            console.log('  Mesh scale:', child.scale);
          }
        });
      } else {
        console.error('FAILED: Test Kenny GLB model is null');
      }
    } catch (error) {
      console.error('ERROR loading test Kenny GLB model:', error);
    }
    
    // Load some actual Kenny GLB models alongside the procedural ones
    const glbBuildings = [
      { name: 'factory-b', position: [25, 0, 5], replace: 'kenny-style' },
      { name: 'warehouse-a', position: [35, 0, -15], replace: 'kenny-style' }
    ];

    let loadedCount = 1; // Count the test model
    for (const building of glbBuildings) {
      try {
        console.log(`Loading Kenny GLB building: ${building.name}`);
        const model = await this.kennyGLBAssets.loadKennyAsset(building.name);
        if (model) {
          model.position.set(building.position[0], building.position[1], building.position[2]);
          model.scale.set(1.5, 1.5, 1.5); // Make them a bit bigger
          scene.add(model);
          loadedCount++;
          console.log(`Successfully loaded Kenny GLB ${building.name} at position`, building.position);
        } else {
          console.warn(`Failed to load Kenny GLB ${building.name}: model is null`);
        }
      } catch (error) {
        console.error(`Error loading Kenny GLB ${building.name}:`, error);
      }
    }

    console.log(`Kenny GLB assets loading complete. Loaded ${loadedCount} actual Kenny models.`);
    console.log(`Total scene objects: ${scene.children.length}`);
  }

  private createEnhancedIronMine(): THREE.Group {
    const group = new THREE.Group();

    // Main building with industrial texture
    const buildingGeometry = new THREE.BoxGeometry(4, 2, 4);
    const buildingMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x8B4513,
      transparent: true,
      opacity: 0.9
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 1;
    building.castShadow = true;
    building.receiveShadow = true;
    group.add(building);

    // Mining equipment details
    const drillGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 8);
    const drillMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 });
    const drill = new THREE.Mesh(drillGeometry, drillMaterial);
    drill.position.set(0, 2.5, 0);
    drill.castShadow = true;
    group.add(drill);

    // Conveyor belt
    const beltGeometry = new THREE.BoxGeometry(3, 0.2, 0.8);
    const beltMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const belt = new THREE.Mesh(beltGeometry, beltMaterial);
    belt.position.set(0, 1.1, 2.5);
    belt.castShadow = true;
    group.add(belt);

    // Add some industrial details
    this.addIndustrialDetails(group, 0x8B4513);

    return group;
  }

  private createEnhancedSteelFurnace(): THREE.Group {
    const group = new THREE.Group();

    // Main furnace body
    const furnaceGeometry = new THREE.BoxGeometry(5, 3, 5);
    const furnaceMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xFF4500,
      emissive: 0x331100,
      emissiveIntensity: 0.3
    });
    const furnace = new THREE.Mesh(furnaceGeometry, furnaceMaterial);
    furnace.position.y = 1.5;
    furnace.castShadow = true;
    furnace.receiveShadow = true;
    group.add(furnace);

    // Chimney with smoke effect
    const chimneyGeometry = new THREE.CylinderGeometry(0.6, 0.8, 4, 8);
    const chimneyMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
    const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
    chimney.position.set(1.5, 3.5, -1.5);
    chimney.castShadow = true;
    group.add(chimney);

    // Glowing furnace door
    const doorGeometry = new THREE.PlaneGeometry(1.5, 2);
    const doorMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xFF6600,
      transparent: true,
      opacity: 0.8
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1.5, 2.51);
    group.add(door);

    // Add glow effect
    const glowGeometry = new THREE.PlaneGeometry(6, 4);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF4500,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = 1.5;
    group.add(glow);

    return group;
  }

  private createEnhancedPowerPlant(): THREE.Group {
    const group = new THREE.Group();

    // Main power plant building
    const buildingGeometry = new THREE.BoxGeometry(6, 4, 6);
    const buildingMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x4169E1,
      transparent: true,
      opacity: 0.9
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 2;
    building.castShadow = true;
    building.receiveShadow = true;
    group.add(building);

    // Cooling towers
    const towerGeometry = new THREE.CylinderGeometry(1.2, 1.6, 5, 8);
    const towerMaterial = new THREE.MeshLambertMaterial({ color: 0xDCDCDC });
    
    const tower1 = new THREE.Mesh(towerGeometry, towerMaterial);
    tower1.position.set(-2, 2.5, 0);
    tower1.castShadow = true;
    group.add(tower1);
    
    const tower2 = new THREE.Mesh(towerGeometry, towerMaterial);
    tower2.position.set(2, 2.5, 0);
    tower2.castShadow = true;
    group.add(tower2);

    // Rotating turbine
    const turbineGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 6);
    const turbineMaterial = new THREE.MeshLambertMaterial({ color: 0x87CEEB });
    const turbine = new THREE.Mesh(turbineGeometry, turbineMaterial);
    turbine.position.set(0, 4.5, 0);
    turbine.rotation.x = Math.PI / 2;
    turbine.userData = { isRotating: true };
    group.add(turbine);

    // Power lines (simple representation)
    this.addPowerLines(group);

    return group;
  }

  private addIndustrialDetails(group: THREE.Group, baseColor: number): void {
    // Add pipes
    const pipeGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 6);
    const pipeMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 });
    
    const pipe1 = new THREE.Mesh(pipeGeometry, pipeMaterial);
    pipe1.position.set(-1.5, 1.5, 0);
    pipe1.rotation.z = Math.PI / 2;
    group.add(pipe1);

    const pipe2 = new THREE.Mesh(pipeGeometry, pipeMaterial);
    pipe2.position.set(1.5, 1.5, 0);
    pipe2.rotation.z = Math.PI / 2;
    group.add(pipe2);

    // Add warning signs
    const signGeometry = new THREE.PlaneGeometry(0.5, 0.5);
    const signMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xFFFF00,
      transparent: true,
      opacity: 0.8
    });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(0, 0.5, 2.1);
    group.add(sign);
  }

  private addPowerLines(group: THREE.Group): void {
    // Simple power line representation
    const lineGeometry = new THREE.CylinderGeometry(0.05, 0.05, 10, 4);
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    const powerLine = new THREE.Mesh(lineGeometry, lineMaterial);
    powerLine.position.set(0, 6, 0);
    powerLine.rotation.z = Math.PI / 2;
    group.add(powerLine);

    // Power poles
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 6, 8);
    const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    
    const pole1 = new THREE.Mesh(poleGeometry, poleMaterial);
    pole1.position.set(-5, 3, 0);
    group.add(pole1);
    
    const pole2 = new THREE.Mesh(poleGeometry, poleMaterial);
    pole2.position.set(5, 3, 0);
    group.add(pole2);
  }

  private addEnvironmentalElements(scene: THREE.Scene): void {
    // Add environmental elements in the middle zone (X between -5 and 20)
    // This creates a natural separation between procedural and Kenny GLB zones
    
    console.log('Adding environmental elements in middle zone...');
    
    // Add connecting roads between zones
    this.addConnectingRoads(scene);
    
    // Add some trees in safe areas
    this.addTrees(scene);
    
    // Add resource deposits in designated areas
    this.addResourceDeposits(scene);
    
    console.log('Environmental elements added');
  }

  private addConnectingRoads(scene: THREE.Scene): void {
    // Main east-west road connecting both zones
    const mainRoad = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 4),
      new THREE.MeshLambertMaterial({ 
        color: 0x2F2F2F,
        transparent: true,
        opacity: 0.8
      })
    );
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.set(0, 0.01, 0); // Slightly above ground
    mainRoad.receiveShadow = true;
    scene.add(mainRoad);

    // North-south connecting road
    const connectingRoad = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 60),
      new THREE.MeshLambertMaterial({ 
        color: 0x2F2F2F,
        transparent: true,
        opacity: 0.8
      })
    );
    connectingRoad.rotation.x = -Math.PI / 2;
    connectingRoad.position.set(0, 0.01, 0);
    connectingRoad.receiveShadow = true;
    scene.add(connectingRoad);
  }

  private addTrees(scene: THREE.Scene): void {
    // Add trees in the middle zone and around the perimeter
    const treePositions = [
      // Middle zone trees
      [0, 0, 20], [5, 0, 18], [-3, 0, 22],
      [2, 0, -20], [-2, 0, -18], [8, 0, -22],
      
      // Perimeter trees around Kenny zone
      [70, 0, 0], [65, 0, 20], [68, 0, -25],
      
      // Perimeter trees around procedural zone  
      [-50, 0, 0], [-45, 0, 20], [-48, 0, -25]
    ];

    for (const position of treePositions) {
      const tree = this.createSimpleTree();
      tree.position.set(position[0], position[1], position[2]);
      scene.add(tree);
    }
  }

  private addResourceDeposits(scene: THREE.Scene): void {
    // Iron ore deposits near procedural zone
    const ironPositions = [
      [-30, 0, -25], [-35, 0, -30], [-25, 0, -28]
    ];
    
    for (const position of ironPositions) {
      const deposit = this.createResourceDeposit(0x8B4513, 'iron');
      deposit.position.set(position[0], position[1], position[2]);
      scene.add(deposit);
    }

    // Coal deposits near Kenny zone
    const coalPositions = [
      [65, 0, -15], [70, 0, -20], [62, 0, -18]
    ];
    
    for (const position of coalPositions) {
      const deposit = this.createResourceDeposit(0x2F2F2F, 'coal');
      deposit.position.set(position[0], position[1], position[2]);
      scene.add(deposit);
    }
  }

  private createSimpleTree(): THREE.Group {
    const tree = new THREE.Group();

    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 6);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    tree.add(trunk);

    // Leaves
    const leavesGeometry = new THREE.SphereGeometry(2, 8, 6);
    const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 4;
    leaves.castShadow = true;
    tree.add(leaves);

    return tree;
  }

  private createResourceDeposit(color: number, type: string): THREE.Group {
    const group = new THREE.Group();

    // Main deposit
    const depositGeometry = new THREE.SphereGeometry(1.5, 8, 6);
    const depositMaterial = new THREE.MeshLambertMaterial({ 
      color,
      transparent: true,
      opacity: 0.7
    });
    const deposit = new THREE.Mesh(depositGeometry, depositMaterial);
    deposit.position.y = 0.5;
    deposit.scale.y = 0.5; // Flatten it
    group.add(deposit);

    // Resource indicator
    const indicatorGeometry = new THREE.ConeGeometry(0.2, 1, 4);
    const indicatorMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
    const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
    indicator.position.y = 2;
    group.add(indicator);

    return group;
  }
}
