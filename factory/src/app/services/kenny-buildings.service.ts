import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class KennyBuildingsService {
  private textureLoader = new THREE.TextureLoader();

  constructor() {
    console.log('Kenny Buildings Service initialized');
  }

  /**
   * Creates Kenny-style industrial buildings using procedural generation
   * Based on Kenny's industrial city kit aesthetic
   */
  public createKennyStyleBuilding(type: string): THREE.Group {
    console.log(`Creating Kenny-style building: ${type}`);
    
    switch (type) {
      case 'factory-a':
        return this.createIndustrialFactory();
      case 'power-plant':
        return this.createPowerPlant();
      case 'warehouse-a':
        return this.createWarehouse();
      case 'steel-mill':
        return this.createSteelMill();
      case 'research-lab':
        return this.createResearchLab();
      case 'chimney-large':
        return this.createChimney('large');
      case 'chimney-medium':
        return this.createChimney('medium');
      case 'chimney-small':
        return this.createChimney('small');
      case 'storage-tank':
        return this.createStorageTank();
      default:
        return this.createGenericBuilding();
    }
  }

  private createIndustrialFactory(): THREE.Group {
    const factory = new THREE.Group();

    // Main factory building - Kenny style blocky design
    const mainBuilding = new THREE.Mesh(
      new THREE.BoxGeometry(8, 4, 6),
      new THREE.MeshLambertMaterial({ 
        color: 0x8B4513, // Kenny's brown industrial color
        transparent: false
      })
    );
    mainBuilding.position.y = 2;
    mainBuilding.castShadow = true;
    mainBuilding.receiveShadow = true;
    factory.add(mainBuilding);

    // Roof with Kenny-style overhang
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(8.5, 0.5, 6.5),
      new THREE.MeshLambertMaterial({ color: 0x654321 })
    );
    roof.position.y = 4.25;
    roof.castShadow = true;
    factory.add(roof);

    // Industrial chimney
    const chimney = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.5, 3, 8),
      new THREE.MeshLambertMaterial({ color: 0x696969 })
    );
    chimney.position.set(2, 5.5, 1);
    chimney.castShadow = true;
    factory.add(chimney);

    // Kenny-style windows (simple rectangles)
    this.addKennyStyleWindows(factory, 8, 4, 6);

    // Industrial details
    this.addIndustrialPipes(factory);

    console.log('Created Kenny-style industrial factory');
    return factory;
  }

  private createPowerPlant(): THREE.Group {
    const powerPlant = new THREE.Group();

    // Main building with Kenny's blocky style
    const mainBuilding = new THREE.Mesh(
      new THREE.BoxGeometry(10, 5, 8),
      new THREE.MeshLambertMaterial({ color: 0x4169E1 }) // Kenny's blue
    );
    mainBuilding.position.y = 2.5;
    mainBuilding.castShadow = true;
    mainBuilding.receiveShadow = true;
    powerPlant.add(mainBuilding);

    // Cooling towers - Kenny style
    const tower1 = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.5, 6, 12),
      new THREE.MeshLambertMaterial({ color: 0xC0C0C0 })
    );
    tower1.position.set(-3, 3, 0);
    tower1.castShadow = true;
    powerPlant.add(tower1);

    const tower2 = tower1.clone();
    tower2.position.set(3, 3, 0);
    powerPlant.add(tower2);

    // Power transmission tower
    this.addPowerTower(powerPlant, 0, 7, -5);

    console.log('Created Kenny-style power plant');
    return powerPlant;
  }

  private createWarehouse(): THREE.Group {
    const warehouse = new THREE.Group();

    // Large rectangular building - Kenny warehouse style
    const mainBuilding = new THREE.Mesh(
      new THREE.BoxGeometry(12, 3, 8),
      new THREE.MeshLambertMaterial({ color: 0x808080 }) // Kenny's gray
    );
    mainBuilding.position.y = 1.5;
    mainBuilding.castShadow = true;
    mainBuilding.receiveShadow = true;
    warehouse.add(mainBuilding);

    // Loading docks
    for (let i = 0; i < 3; i++) {
      const dock = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.5, 1),
        new THREE.MeshLambertMaterial({ color: 0x654321 })
      );
      dock.position.set(-5 + i * 2, 0.25, 4.5);
      dock.castShadow = true;
      warehouse.add(dock);
    }

    // Simple roof structure
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(12.5, 0.3, 8.5),
      new THREE.MeshLambertMaterial({ color: 0x556B2F })
    );
    roof.position.y = 3.15;
    warehouse.add(roof);

    console.log('Created Kenny-style warehouse');
    return warehouse;
  }

  private createSteelMill(): THREE.Group {
    const steelMill = new THREE.Group();

    // Main mill building
    const mainBuilding = new THREE.Mesh(
      new THREE.BoxGeometry(6, 6, 10),
      new THREE.MeshLambertMaterial({ 
        color: 0x8B0000, // Dark red for steel mill
        emissive: 0x220000,
        emissiveIntensity: 0.2
      })
    );
    mainBuilding.position.y = 3;
    mainBuilding.castShadow = true;
    mainBuilding.receiveShadow = true;
    steelMill.add(mainBuilding);

    // Large industrial chimney
    const chimney = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.8, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0x2F2F2F })
    );
    chimney.position.set(2, 7, 2);
    chimney.castShadow = true;
    steelMill.add(chimney);

    // Blast furnace
    const furnace = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 2, 4, 8),
      new THREE.MeshLambertMaterial({ 
        color: 0xFF4500,
        emissive: 0x331100,
        emissiveIntensity: 0.3
      })
    );
    furnace.position.set(-2, 2, -3);
    furnace.castShadow = true;
    steelMill.add(furnace);

    console.log('Created Kenny-style steel mill');
    return steelMill;
  }

  private createResearchLab(): THREE.Group {
    const lab = new THREE.Group();

    // Modern looking building with Kenny's clean style
    const mainBuilding = new THREE.Mesh(
      new THREE.BoxGeometry(6, 4, 6),
      new THREE.MeshLambertMaterial({ color: 0xFFFFFF }) // Kenny's clean white
    );
    mainBuilding.position.y = 2;
    mainBuilding.castShadow = true;
    mainBuilding.receiveShadow = true;
    lab.add(mainBuilding);

    // Glass panels (Kenny style simplified)
    const glassMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x87CEEB, 
      transparent: true, 
      opacity: 0.6 
    });

    for (let i = 0; i < 4; i++) {
      const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 2),
        glassMaterial
      );
      const angle = (i / 4) * Math.PI * 2;
      glass.position.set(
        Math.cos(angle) * 3.01,
        2,
        Math.sin(angle) * 3.01
      );
      glass.rotation.y = angle + Math.PI;
      lab.add(glass);
    }

    // Antenna array
    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 2, 6),
      new THREE.MeshLambertMaterial({ color: 0x2F2F2F })
    );
    antenna.position.set(0, 5, 0);
    lab.add(antenna);

    console.log('Created Kenny-style research lab');
    return lab;
  }

  private createChimney(size: 'small' | 'medium' | 'large'): THREE.Group {
    const chimney = new THREE.Group();

    let height: number, radiusBottom: number, radiusTop: number;
    switch (size) {
      case 'small':
        height = 3; radiusBottom = 0.3; radiusTop = 0.25;
        break;
      case 'medium':
        height = 5; radiusBottom = 0.4; radiusTop = 0.3;
        break;
      case 'large':
        height = 8; radiusBottom = 0.6; radiusTop = 0.4;
        break;
    }

    const chimneyMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 8),
      new THREE.MeshLambertMaterial({ color: 0x696969 })
    );
    chimneyMesh.position.y = height / 2;
    chimneyMesh.castShadow = true;
    chimney.add(chimneyMesh);

    // Chimney cap
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(radiusTop + 0.1, radiusTop + 0.1, 0.2, 8),
      new THREE.MeshLambertMaterial({ color: 0x2F2F2F })
    );
    cap.position.y = height + 0.1;
    chimney.add(cap);

    console.log(`Created Kenny-style ${size} chimney`);
    return chimney;
  }

  private createStorageTank(): THREE.Group {
    const tank = new THREE.Group();

    // Main tank body
    const tankBody = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 3, 12),
      new THREE.MeshLambertMaterial({ color: 0xC0C0C0 })
    );
    tankBody.position.y = 1.5;
    tankBody.castShadow = true;
    tankBody.receiveShadow = true;
    tank.add(tankBody);

    // Tank top
    const tankTop = new THREE.Mesh(
      new THREE.CylinderGeometry(2.1, 2.1, 0.2, 12),
      new THREE.MeshLambertMaterial({ color: 0x808080 })
    );
    tankTop.position.y = 3.1;
    tank.add(tankTop);

    // Support legs
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 3, 6),
        new THREE.MeshLambertMaterial({ color: 0x654321 })
      );
      const angle = (i / 4) * Math.PI * 2;
      leg.position.set(
        Math.cos(angle) * 1.5,
        1.5,
        Math.sin(angle) * 1.5
      );
      tank.add(leg);
    }

    console.log('Created Kenny-style storage tank');
    return tank;
  }

  private createGenericBuilding(): THREE.Group {
    const building = new THREE.Group();

    const mainBuilding = new THREE.Mesh(
      new THREE.BoxGeometry(4, 3, 4),
      new THREE.MeshLambertMaterial({ color: 0x808080 })
    );
    mainBuilding.position.y = 1.5;
    mainBuilding.castShadow = true;
    mainBuilding.receiveShadow = true;
    building.add(mainBuilding);

    console.log('Created Kenny-style generic building');
    return building;
  }

  private addKennyStyleWindows(building: THREE.Group, width: number, height: number, depth: number): void {
    const windowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x87CEEB, 
      transparent: true, 
      opacity: 0.7 
    });

    // Front windows
    for (let i = 0; i < 3; i++) {
      const window = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 1.2),
        windowMaterial
      );
      window.position.set(-width/2 + 1 + i * 2, height/2, depth/2 + 0.01);
      building.add(window);
    }

    // Side windows
    for (let i = 0; i < 2; i++) {
      const window = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 1.2),
        windowMaterial
      );
      window.position.set(width/2 + 0.01, height/2, -depth/2 + 1 + i * 2);
      window.rotation.y = -Math.PI / 2;
      building.add(window);
    }
  }

  private addIndustrialPipes(building: THREE.Group): void {
    // External pipes - Kenny style simple geometry
    const pipeMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 });

    const pipe1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 4, 6),
      pipeMaterial
    );
    pipe1.position.set(-3.5, 2, 0);
    pipe1.rotation.z = Math.PI / 2;
    building.add(pipe1);

    const pipe2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 3, 6),
      pipeMaterial
    );
    pipe2.position.set(0, 2, -2.5);
    pipe2.rotation.x = Math.PI / 2;
    building.add(pipe2);
  }

  private addPowerTower(building: THREE.Group, x: number, y: number, z: number): void {
    // Simple power transmission tower
    const towerMaterial = new THREE.MeshLambertMaterial({ color: 0x2F2F2F });

    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.3, 6, 4),
      towerMaterial
    );
    tower.position.set(x, y, z);
    tower.castShadow = true;
    building.add(tower);

    // Power lines
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const line = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 10, 4),
      lineMaterial
    );
    line.position.set(x, y + 2, z);
    line.rotation.z = Math.PI / 2;
    building.add(line);
  }

  public getAttribution(): string {
    return 'Building style inspired by Kenny Assets (www.kenney.nl) - Procedurally generated';
  }
}
