import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { BehaviorSubject } from 'rxjs';
import { GraphicsService } from './graphics.service';
import { WorldGeneratorService, BuildingInfo } from './world-generator.service';
import { TextureManagerService } from './texture-manager.service';

export interface GameState {
  resources: { [key: string]: number };
  buildings: Building[];
  research: { [key: string]: boolean };
  selectedBuilding?: BuildingInfo;
  cameraPosition: { x: number; z: number };
}

export interface Building {
  id: string;
  type: string;
  position: { x: number; y: number };
  level: number;
  isOperating: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GameEngineService {
  private scene!: THREE.Scene;
  private camera!: THREE.OrthographicCamera;
  private renderer!: THREE.WebGLRenderer;
  private gameLoop: number = 0;

  private gameStateSubject = new BehaviorSubject<GameState>({
    resources: {
      iron: 100,
      coal: 50,
      steel: 0,
      electricity: 0,
      research: 0
    },
    buildings: [],
    research: {
      steelProduction: true,
      automation: false,
      efficiency: false
    },
    cameraPosition: { x: 0, z: 0 }
  });

  public gameState$ = this.gameStateSubject.asObservable();
  private lastTime = 0;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  constructor(
    private graphicsService: GraphicsService, 
    private worldGenerator: WorldGeneratorService,
    private textureManager: TextureManagerService
  ) {
    this.initializeGame();
  }

  private initializeGame(): void {
    // Initialize Three.js scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background

    // Set up orthographic camera for ARPG-style top-down view
    this.camera = new THREE.OrthographicCamera(
      -50, 50, 50, -50, 1, 1000
    );
    // ARPG-style camera angle - elevated and tilted down
    this.camera.position.set(0, 40, 30);
    this.camera.lookAt(0, 0, 0);
    this.camera.rotation.x = -Math.PI / 6; // 30-degree tilt for ARPG feel

    // Add enhanced lighting for better visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Bright white ambient
    this.scene.add(ambientLight);

    // Main directional light - positioned high above center, pointing down
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(0, 200, 0); // Directly above center
    directionalLight.target.position.set(0, 0, 0); // Point at world center
    directionalLight.castShadow = true;
    
    // Configure shadow camera to cover the entire 256x256 ground plane
    directionalLight.shadow.camera.left = -150;
    directionalLight.shadow.camera.right = 150;
    directionalLight.shadow.camera.top = 150;
    directionalLight.shadow.camera.bottom = -150;
    directionalLight.shadow.camera.near = 50;
    directionalLight.shadow.camera.far = 300;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    
    this.scene.add(directionalLight);
    this.scene.add(directionalLight.target); // Important: add the target to scene

    // Add helper to visualize the directional light (can be removed later)
    // const helper = new THREE.DirectionalLightHelper(directionalLight, 20);
    // this.scene.add(helper);

    // Add angled directional light for more natural lighting
    const angleLight = new THREE.DirectionalLight(0xffffff, 0.6);
    angleLight.position.set(100, 150, 100); // Angled from corner
    angleLight.target.position.set(0, 0, 0);
    this.scene.add(angleLight);
    this.scene.add(angleLight.target);

    // Add fill light from opposite corner
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-100, 120, -100);
    fillLight.target.position.set(0, 0, 0);
    this.scene.add(fillLight);
    this.scene.add(fillLight.target);

    console.log('Enhanced lighting added: ambient + 3 directional lights covering full world');
    console.log('Main light position:', directionalLight.position);
    console.log('Main light target:', directionalLight.target.position);
    console.log('Shadow camera bounds:', {
      left: directionalLight.shadow.camera.left,
      right: directionalLight.shadow.camera.right,
      top: directionalLight.shadow.camera.top,
      bottom: directionalLight.shadow.camera.bottom
    });

    // Create ground grid
    this.createGroundGrid();

    console.log('Game initialized with ARPG camera at:', this.camera.position);
  }

  public initializeRenderer(canvas: HTMLCanvasElement): void {
    console.log('Initializing renderer with canvas:', canvas);
    console.log('Canvas dimensions:', canvas.clientWidth, 'x', canvas.clientHeight);
    
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    
    // Ensure canvas has proper dimensions
    const width = canvas.clientWidth || 800;
    const height = canvas.clientHeight || 600;
    
    console.log('Setting renderer size to:', width, 'x', height);
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Update camera aspect ratio for orthographic camera
    if (this.camera instanceof THREE.OrthographicCamera) {
      const aspect = width / height;
      this.camera.left = -50 * aspect;
      this.camera.right = 50 * aspect;
      this.camera.top = 50;
      this.camera.bottom = -50;
      this.camera.updateProjectionMatrix();
    }

    // Initialize graphics service with scene
    this.graphicsService.setScene(this.scene);

    // Add some demo content to make the world more interesting
    this.createInitialWorld().then(() => {
      console.log('Demo world created successfully');
    }).catch(error => {
      console.error('Failed to create demo world:', error);
    });

    this.startGameLoop();
    
    console.log('Renderer initialized, scene has', this.scene.children.length, 'objects');
  }

  private createGroundGrid(): void {
    const gridSize = 256;  // Increased to match world size
    const divisions = 128;  // Match world generator grid
    
    // Create ground plane with grass texture
    const groundGeometry = new THREE.PlaneGeometry(gridSize, gridSize);
    const groundMaterial = this.textureManager.createTerrainMaterial('grass');
    groundMaterial.name = 'ground';
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = 'ground-plane';
    this.scene.add(ground);

    // Create grid helper with more subtle appearance
    const gridHelper = new THREE.GridHelper(gridSize, divisions, 0x333333, 0x333333);
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);
  }

  private async createInitialWorld(): Promise<void> {
    // Generate the 128x128 industrial world
    await this.worldGenerator.generateIndustrialWorld(this.scene);
  }

  private startGameLoop(): void {
    const animate = (currentTime: number) => {
      this.gameLoop = requestAnimationFrame(animate);
      
      const deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;
      
      this.render();
    };
    animate(0);
  }

  private render(): void {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  public placeBuilding(type: string, x: number, y: number): void {
    const building: Building = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x, y },
      level: 1,
      isOperating: true
    };

    // Add the building to the game state
    const currentState = this.gameStateSubject.value;
    const newState = {
      ...currentState,
      buildings: [...currentState.buildings, building]
    };
    this.gameStateSubject.next(newState);

    // Create the 3D representation
    const buildingGroup = this.graphicsService.createEnhancedBuilding(
      building.id, type, { x, y }
    );
    buildingGroup.position.set(x, 0, y);
    this.scene.add(buildingGroup);
  }

  public updateCameraPosition(x: number, z: number): void {
    if (this.camera) {
      // Keep the ARPG-style elevated view but move horizontally
      this.camera.position.x = x;
      this.camera.position.z = z + 30; // Maintain offset for viewing angle
      this.camera.lookAt(x, 0, z);
      
      // Update game state
      const currentState = this.gameStateSubject.value;
      this.gameStateSubject.next({
        ...currentState,
        cameraPosition: { x, z }
      });
    }
  }

  public moveCameraByDelta(deltaX: number, deltaZ: number): void {
    const currentState = this.gameStateSubject.value;
    const newX = currentState.cameraPosition.x + deltaX;
    const newZ = currentState.cameraPosition.z + deltaZ;
    
    // Clamp to world bounds (128x128 world, so -64 to +64)
    const clampedX = Math.max(-64, Math.min(64, newX));
    const clampedZ = Math.max(-64, Math.min(64, newZ));
    
    this.updateCameraPosition(clampedX, clampedZ);
  }

  public selectBuildingAt(screenX: number, screenY: number, canvas: HTMLCanvasElement): void {
    // Convert screen coordinates to normalized device coordinates
    const rect = canvas.getBoundingClientRect();
    this.mouse.x = ((screenX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((screenY - rect.top) / rect.height) * 2 + 1;
    
    // Cast ray from camera through mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Get world position where ray hits the ground plane
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const worldPosition = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(groundPlane, worldPosition);
    
    if (worldPosition) {
      // Find building at this position
      const building = this.worldGenerator.getBuildingAt(worldPosition.x, worldPosition.z, 15);
      
      if (building) {
        // Update game state with selected building
        const currentState = this.gameStateSubject.value;
        this.gameStateSubject.next({
          ...currentState,
          selectedBuilding: building
        });
        
        console.log(`Selected building: ${building.name} at (${building.position.x}, ${building.position.z})`);
      } else {
        // Deselect if no building found
        const currentState = this.gameStateSubject.value;
        this.gameStateSubject.next({
          ...currentState,
          selectedBuilding: undefined
        });
      }
    }
  }

  public zoomCamera(delta: number): void {
    if (this.camera instanceof THREE.OrthographicCamera) {
      // Calculate zoom factor based on wheel delta (fixed inverted zoom)
      const zoomFactor = delta > 0 ? 1.1 : 0.9; // Scroll up = zoom out, scroll down = zoom in
      
      // Get current camera bounds
      const currentLeft = this.camera.left;
      const currentRight = this.camera.right;
      const currentTop = this.camera.top;
      const currentBottom = this.camera.bottom;
      
      // Calculate new bounds with zoom limits
      const newLeft = currentLeft * zoomFactor;
      const newRight = currentRight * zoomFactor;
      const newTop = currentTop * zoomFactor;
      const newBottom = currentBottom * zoomFactor;
      
      // Apply zoom limits (prevent zooming too close or too far)
      const minZoom = 10; // Minimum view size
      const maxZoom = 200; // Maximum view size
      
      if (Math.abs(newRight - newLeft) >= minZoom && Math.abs(newRight - newLeft) <= maxZoom) {
        this.camera.left = newLeft;
        this.camera.right = newRight;
        this.camera.top = newTop;
        this.camera.bottom = newBottom;
        this.camera.updateProjectionMatrix();
        
        console.log('Camera zoom updated - View size:', Math.abs(newRight - newLeft).toFixed(1));
      }
    }
  }

  public onWindowResize(width: number, height: number): void {
    if (this.camera && this.renderer) {
      const aspect = width / height;
      this.camera.left = -50 * aspect;
      this.camera.right = 50 * aspect;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }

  public destroy(): void {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    this.graphicsService.dispose();
  }

  public get gameState() {
    return this.gameStateSubject;
  }
}
