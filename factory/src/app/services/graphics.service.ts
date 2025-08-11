import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { KennyAssetService } from './kenny-asset.service';

export interface BuildingGraphicsConfig {
  type: string;
  baseColor: number;
  accentColor: number;
  size: { width: number; height: number; depth: number };
  hasSmoke?: boolean;
  hasGlow?: boolean;
  animationType?: 'rotation' | 'bounce' | 'pulse';
  particleSystem?: 'smoke' | 'sparks' | 'steam';
}

@Injectable({
  providedIn: 'root'
})
export class GraphicsService {
  private scene!: THREE.Scene;
  private particleSystems: THREE.Points[] = [];
  private animatedObjects: Map<string, THREE.Object3D> = new Map();
  private buildingConfigs: Map<string, BuildingGraphicsConfig> = new Map();

  constructor(private kennyAssets: KennyAssetService) {
    this.initializeBuildingConfigs();
  }

  private initializeBuildingConfigs(): void {
    // Iron Mine Configuration
    this.buildingConfigs.set('iron-mine', {
      type: 'iron-mine',
      baseColor: 0x8B4513,
      accentColor: 0xCD853F,
      size: { width: 2, height: 1.5, depth: 2 },
      hasSmoke: true,
      particleSystem: 'smoke'
    });

    // Coal Mine Configuration
    this.buildingConfigs.set('coal-mine', {
      type: 'coal-mine',
      baseColor: 0x2F2F2F,
      accentColor: 0x696969,
      size: { width: 2, height: 1.2, depth: 2 },
      hasSmoke: true,
      particleSystem: 'smoke'
    });

    // Steel Furnace Configuration
    this.buildingConfigs.set('steel-furnace', {
      type: 'steel-furnace',
      baseColor: 0xFF4500,
      accentColor: 0xFF6347,
      size: { width: 3, height: 2.5, depth: 3 },
      hasSmoke: true,
      hasGlow: true,
      animationType: 'pulse',
      particleSystem: 'sparks'
    });

    // Power Plant Configuration
    this.buildingConfigs.set('power-plant', {
      type: 'power-plant',
      baseColor: 0x4169E1,
      accentColor: 0x87CEEB,
      size: { width: 4, height: 3, depth: 4 },
      hasSmoke: true,
      hasGlow: true,
      animationType: 'rotation',
      particleSystem: 'steam'
    });
  }

  public setScene(scene: THREE.Scene): void {
    this.scene = scene;
  }

  public createEnhancedBuilding(buildingId: string, type: string, position: { x: number; y: number }): THREE.Group {
    const config = this.buildingConfigs.get(type);
    if (!config) {
      return this.createBasicBuilding(buildingId, type, position);
    }

    const buildingGroup = new THREE.Group();
    buildingGroup.userData = { buildingId, type };

    // Main building structure
    const mainBuilding = this.createMainStructure(config);
    buildingGroup.add(mainBuilding);

    // Add details based on building type
    const details = this.createBuildingDetails(config);
    buildingGroup.add(details);

    // Add glow effect if specified
    if (config.hasGlow) {
      const glowEffect = this.createGlowEffect(config);
      buildingGroup.add(glowEffect);
    }

    // Add particle system if specified
    if (config.particleSystem) {
      const particles = this.createParticleSystem(config.particleSystem, position);
      buildingGroup.add(particles);
      this.particleSystems.push(particles);
    }

    // Position the building
    buildingGroup.position.set(position.x, config.size.height / 2, position.y);

    // Add to animated objects if it has animation
    if (config.animationType) {
      this.animatedObjects.set(buildingId, buildingGroup);
    }

    return buildingGroup;
  }

  private createMainStructure(config: BuildingGraphicsConfig): THREE.Group {
    const group = new THREE.Group();
    const { size, baseColor, accentColor } = config;

    // Main body
    const bodyGeometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
      color: baseColor,
      transparent: true,
      opacity: 0.9
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);

    // Add beveled edges for more industrial look
    const edgeGeometry = new THREE.EdgesGeometry(bodyGeometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: accentColor, linewidth: 2 });
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    group.add(edges);

    return group;
  }

  private createBuildingDetails(config: BuildingGraphicsConfig): THREE.Group {
    const details = new THREE.Group();
    const { type, size, accentColor } = config;

    switch (type) {
      case 'iron-mine':
        // Add mining equipment details
        const drilGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
        const drillMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 });
        const drill = new THREE.Mesh(drilGeometry, drillMaterial);
        drill.position.set(0, size.height / 2 + 0.3, 0);
        details.add(drill);

        // Add conveyor belt
        const beltGeometry = new THREE.BoxGeometry(size.width * 0.8, 0.1, 0.3);
        const beltMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const belt = new THREE.Mesh(beltGeometry, beltMaterial);
        belt.position.set(0, size.height / 2 + 0.1, size.depth / 2 + 0.2);
        details.add(belt);
        break;

      case 'coal-mine':
        // Add headframe structure
        const frameGeometry = new THREE.BoxGeometry(0.2, size.height + 1, 0.2);
        const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        
        const frame1 = new THREE.Mesh(frameGeometry, frameMaterial);
        frame1.position.set(-size.width / 3, size.height / 2, -size.depth / 3);
        details.add(frame1);
        
        const frame2 = new THREE.Mesh(frameGeometry, frameMaterial);
        frame2.position.set(size.width / 3, size.height / 2, -size.depth / 3);
        details.add(frame2);
        break;

      case 'steel-furnace':
        // Add chimney
        const chimneyGeometry = new THREE.CylinderGeometry(0.3, 0.4, size.height + 1, 8);
        const chimneyMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
        const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
        chimney.position.set(size.width / 3, size.height / 2 + 0.5, -size.depth / 3);
        details.add(chimney);

        // Add furnace door glow
        const doorGeometry = new THREE.PlaneGeometry(0.8, 1.2);
        const doorMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xFF4500,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 0, size.depth / 2 + 0.01);
        details.add(door);
        break;

      case 'power-plant':
        // Add cooling towers
        const towerGeometry = new THREE.CylinderGeometry(0.6, 0.8, size.height + 0.5, 8);
        const towerMaterial = new THREE.MeshLambertMaterial({ color: 0xDCDCDC });
        
        const tower1 = new THREE.Mesh(towerGeometry, towerMaterial);
        tower1.position.set(-size.width / 3, size.height / 2, 0);
        details.add(tower1);
        
        const tower2 = new THREE.Mesh(towerGeometry, towerMaterial);
        tower2.position.set(size.width / 3, size.height / 2, 0);
        details.add(tower2);

        // Add rotating turbine
        const turbineGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 6);
        const turbineMaterial = new THREE.MeshLambertMaterial({ color: accentColor });
        const turbine = new THREE.Mesh(turbineGeometry, turbineMaterial);
        turbine.position.set(0, size.height / 2 + 0.5, 0);
        turbine.rotation.x = Math.PI / 2;
        turbine.userData = { isRotating: true };
        details.add(turbine);
        break;
    }

    return details;
  }

  private createGlowEffect(config: BuildingGraphicsConfig): THREE.Mesh {
    const glowGeometry = new THREE.PlaneGeometry(config.size.width * 1.2, config.size.height * 1.2);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: config.accentColor,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.userData = { isGlow: true };
    return glow;
  }

  private createParticleSystem(type: 'smoke' | 'sparks' | 'steam', position: { x: number; y: number }): THREE.Points {
    const particleCount = 100;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Initial positions around the building
      positions[i3] = position.x + (Math.random() - 0.5) * 2;
      positions[i3 + 1] = Math.random() * 0.5;
      positions[i3 + 2] = position.y + (Math.random() - 0.5) * 2;

      // Velocities
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = Math.random() * 0.05 + 0.01;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

      // Colors based on particle type
      switch (type) {
        case 'smoke':
          colors[i3] = 0.3 + Math.random() * 0.2;     // R
          colors[i3 + 1] = 0.3 + Math.random() * 0.2; // G
          colors[i3 + 2] = 0.3 + Math.random() * 0.2; // B
          break;
        case 'sparks':
          colors[i3] = 1.0;                           // R
          colors[i3 + 1] = 0.5 + Math.random() * 0.5; // G
          colors[i3 + 2] = 0.0;                       // B
          break;
        case 'steam':
          colors[i3] = 0.8 + Math.random() * 0.2;     // R
          colors[i3 + 1] = 0.8 + Math.random() * 0.2; // G
          colors[i3 + 2] = 1.0;                       // B
          break;
      }
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.userData = { 
      velocities,
      particleType: type,
      time: 0
    };

    const material = new THREE.PointsMaterial({
      size: type === 'sparks' ? 0.05 : 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: type === 'sparks' ? THREE.AdditiveBlending : THREE.NormalBlending
    });

    return new THREE.Points(particles, material);
  }

  private createBasicBuilding(buildingId: string, type: string, position: { x: number; y: number }): THREE.Group {
    // Fallback for unknown building types
    const group = new THREE.Group();
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, 0.5, position.y);
    mesh.userData = { buildingId, type };
    group.add(mesh);
    return group;
  }

  public updateAnimations(deltaTime: number): void {
    // Update building animations
    this.animatedObjects.forEach((object, id) => {
      const config = this.buildingConfigs.get(object.userData['type']);
      if (!config?.animationType) return;

      switch (config.animationType) {
        case 'rotation':
          object.children.forEach(child => {
            if (child.userData['isRotating']) {
              child.rotation.y += deltaTime * 2;
            }
          });
          break;
        case 'pulse':
          const pulseScale = 1 + Math.sin(Date.now() * 0.005) * 0.05;
          object.children.forEach(child => {
            if (child.userData['isGlow']) {
              child.scale.setScalar(pulseScale);
            }
          });
          break;
        case 'bounce':
          const bounceOffset = Math.sin(Date.now() * 0.003) * 0.1;
          object.position.y = config.size.height / 2 + bounceOffset;
          break;
      }
    });

    // Update particle systems
    this.particleSystems.forEach(particles => {
      this.updateParticleSystem(particles, deltaTime);
    });
  }

  private updateParticleSystem(particles: THREE.Points, deltaTime: number): void {
    const positions = particles.geometry.attributes['position'].array as Float32Array;
    const velocities = particles.geometry.userData['velocities'];
    const particleType = particles.geometry.userData['particleType'];
    
    particles.geometry.userData['time'] += deltaTime;

    for (let i = 0; i < positions.length; i += 3) {
      // Update positions
      positions[i] += velocities[i];
      positions[i + 1] += velocities[i + 1];
      positions[i + 2] += velocities[i + 2];

      // Reset particles when they get too high or fade out
      if (positions[i + 1] > 5 || Math.random() < 0.01) {
        positions[i] = (Math.random() - 0.5) * 2;
        positions[i + 1] = 0;
        positions[i + 2] = (Math.random() - 0.5) * 2;
      }

      // Add some wind effect
      velocities[i] += (Math.random() - 0.5) * 0.001;
      velocities[i + 2] += (Math.random() - 0.5) * 0.001;
    }

    particles.geometry.attributes['position'].needsUpdate = true;
  }

  public createProceduralTexture(type: string): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;

    switch (type) {
      case 'metal':
        this.drawMetalTexture(context);
        break;
      case 'rust':
        this.drawRustTexture(context);
        break;
      case 'concrete':
        this.drawConcreteTexture(context);
        break;
      default:
        this.drawBasicTexture(context);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  private drawMetalTexture(context: CanvasRenderingContext2D): void {
    // Create metallic base
    const gradient = context.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, '#8C8C8C');
    gradient.addColorStop(0.5, '#B8B8B8');
    gradient.addColorStop(1, '#707070');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);

    // Add scratches and wear
    context.strokeStyle = '#606060';
    context.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      context.beginPath();
      context.moveTo(Math.random() * 256, Math.random() * 256);
      context.lineTo(Math.random() * 256, Math.random() * 256);
      context.stroke();
    }
  }

  private drawRustTexture(context: CanvasRenderingContext2D): void {
    // Create rust base
    context.fillStyle = '#8B4513';
    context.fillRect(0, 0, 256, 256);

    // Add rust spots
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const radius = Math.random() * 10 + 5;
      
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, '#A0522D');
      gradient.addColorStop(1, '#8B4513');
      
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
  }

  private drawConcreteTexture(context: CanvasRenderingContext2D): void {
    // Create concrete base
    context.fillStyle = '#DCDCDC';
    context.fillRect(0, 0, 256, 256);

    // Add concrete texture
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const gray = Math.floor(Math.random() * 50 + 180);
      
      context.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
      context.fillRect(x, y, 1, 1);
    }
  }

  private drawBasicTexture(context: CanvasRenderingContext2D): void {
    context.fillStyle = '#808080';
    context.fillRect(0, 0, 256, 256);
  }

  public removeBuilding(buildingId: string): void {
    this.animatedObjects.delete(buildingId);
    // Note: Actual removal from scene should be handled by the calling component
  }

  public dispose(): void {
    this.animatedObjects.clear();
    this.particleSystems.length = 0;
  }
}
