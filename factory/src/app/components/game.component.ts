import { Component, ElementRef, ViewChild, OnInit, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameEngineService, GameState } from '../services/game-engine.service';
import { GraphicsService } from '../services/graphics.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-container">
      <div class="game-viewport">
        <canvas #gameCanvas class="game-canvas"></canvas>
      </div>
      
      <div class="ui-overlay">
        <div class="resource-panel">
          <h3>Resources</h3>
          <div class="resource-item" *ngFor="let resource of getResourceEntries(gameState$ | async)">
            <span class="resource-name">{{ formatResourceName(resource[0]) }}:</span>
            <span class="resource-amount">{{ resource[1] | number:'1.0-1' }}</span>
          </div>
        </div>

        <div class="building-info-panel" *ngIf="(gameState$ | async)?.selectedBuilding">
          <h3>{{ (gameState$ | async)?.selectedBuilding?.name }}</h3>
          <div class="building-details">
            <p class="building-description">{{ (gameState$ | async)?.selectedBuilding?.description }}</p>
            <p class="building-function"><strong>Function:</strong> {{ (gameState$ | async)?.selectedBuilding?.function }}</p>
            
            <div class="building-stats">
              <h4>Statistics</h4>
              <div class="stat-row" *ngIf="(gameState$ | async)?.selectedBuilding?.stats?.capacity">
                <span>Capacity:</span>
                <span>{{ (gameState$ | async)?.selectedBuilding?.stats?.capacity }}</span>
              </div>
              <div class="stat-row" *ngIf="(gameState$ | async)?.selectedBuilding?.stats?.powerGeneration">
                <span>Power Generation:</span>
                <span>{{ (gameState$ | async)?.selectedBuilding?.stats?.powerGeneration }} MW</span>
              </div>
              <div class="stat-row" *ngIf="(gameState$ | async)?.selectedBuilding?.stats?.powerConsumption">
                <span>Power Consumption:</span>
                <span>{{ (gameState$ | async)?.selectedBuilding?.stats?.powerConsumption }} MW</span>
              </div>
              <div class="stat-row" *ngIf="(gameState$ | async)?.selectedBuilding?.stats?.outputRate">
                <span>Output Rate:</span>
                <span>{{ (gameState$ | async)?.selectedBuilding?.stats?.outputRate }}/min</span>
              </div>
              <div class="stat-row" *ngIf="(gameState$ | async)?.selectedBuilding?.stats?.workers">
                <span>Workers:</span>
                <span>{{ (gameState$ | async)?.selectedBuilding?.stats?.workers }}</span>
              </div>
              <div class="stat-row" *ngIf="(gameState$ | async)?.selectedBuilding?.stats?.efficiency">
                <span>Efficiency:</span>
                <span>{{ (gameState$ | async)?.selectedBuilding?.stats?.efficiency }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="research-panel">
          <h3>Research</h3>
          <div class="research-item" *ngFor="let research of getResearchEntries(gameState$ | async)">
            <span [class.completed]="research[1]">{{ formatResearchName(research[0]) }}</span>
          </div>
        </div>

        <div class="controls-panel">
          <h3>Controls</h3>
          <p><strong>Camera:</strong></p>
          <p>• WASD / Arrow keys: Move camera</p>
          <p>• Right-click drag: Pan camera</p>
          <p>• Mouse wheel: Zoom in/out</p>
          <p><strong>Building:</strong></p>
          <p>• Left click: Select building</p>
          <p>• View detailed stats and function</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .game-container {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: #1a1a1a;
    }

    .game-viewport {
      width: 100%;
      height: 100%;
    }

    .game-canvas {
      width: 100%;
      height: 100%;
      display: block;
      cursor: crosshair;
      outline: none; /* Remove focus outline */
    }

    .game-canvas:focus {
      outline: none;
    }

    .ui-overlay {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 100;
    }

    .resource-panel,
    .building-info-panel,
    .research-panel,
    .controls-panel {
      position: absolute;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 15px;
      border-radius: 8px;
      min-width: 200px;
      pointer-events: auto;
    }

    .resource-panel {
      top: 20px;
      left: 20px;
    }

    .building-info-panel {
      top: 20px;
      right: 20px;
      max-width: 350px;
    }

    .research-panel {
      bottom: 160px;
      left: 20px;
    }

    .controls-panel {
      bottom: 20px;
      left: 20px;
      background: rgba(0, 100, 0, 0.8);
      max-width: 250px;
    }

    .building-details {
      margin-top: 10px;
    }

    .building-description {
      font-style: italic;
      color: #ccc;
      margin: 5px 0;
    }

    .building-function {
      color: #87CEEB;
      margin: 8px 0;
      font-size: 13px;
    }

    .building-stats {
      margin-top: 12px;
    }

    .building-stats h4 {
      margin: 0 0 8px 0;
      color: #FFA500;
      font-size: 14px;
      border-bottom: 1px solid #444;
      padding-bottom: 3px;
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 12px;
    }

    .stat-row span:first-child {
      color: #ccc;
    }

    .stat-row span:last-child {
      color: #4CAF50;
      font-weight: bold;
    }

    .controls-panel p {
      margin: 5px 0;
      font-size: 12px;
      line-height: 1.4;
    }

    h3 {
      margin: 0 0 10px 0;
      color: #fff;
      font-size: 16px;
      border-bottom: 2px solid #444;
      padding-bottom: 5px;
    }

    .resource-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 14px;
    }

    .resource-name {
      color: #ccc;
    }

    .resource-amount {
      color: #4CAF50;
      font-weight: bold;
    }

    .building-btn {
      display: block;
      width: 100%;
      margin-bottom: 8px;
      padding: 10px;
      background: #333;
      color: white;
      border: 2px solid #555;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .building-btn:hover:not(:disabled) {
      background: #444;
      border-color: #666;
    }

    .building-btn.selected {
      background: #2196F3;
      border-color: #1976D2;
    }

    .building-btn:disabled {
      background: #222;
      color: #666;
      cursor: not-allowed;
      border-color: #333;
    }

    .research-item {
      margin-bottom: 5px;
      font-size: 14px;
      color: #ccc;
    }

    .research-item .completed {
      color: #4CAF50;
    }
  `]
})
export class GameComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  gameState$!: Observable<GameState>;
  selectedBuildingType: string | null = null;
  
  // RTS-style camera controls
  private isDragging = false;
  private lastMousePosition = { x: 0, y: 0 };
  private keys: { [key: string]: boolean } = {};
  private readonly cameraMoveSpeed = 1.0;

  constructor(private gameEngine: GameEngineService, private graphicsService: GraphicsService) {}

  ngOnInit(): void {
    this.gameState$ = this.gameEngine.gameState$;
  }

  ngAfterViewInit(): void {
    // Initialize the game engine with the canvas after view is ready
    console.log('Canvas element:', this.canvasRef.nativeElement);
    console.log('Canvas dimensions:', this.canvasRef.nativeElement.clientWidth, 'x', this.canvasRef.nativeElement.clientHeight);
    
    this.gameEngine.initializeRenderer(this.canvasRef.nativeElement);
    
    // Set up proper event handling
    this.setupCanvasEvents();
  }

  private setupCanvasEvents(): void {
    const canvas = this.canvasRef.nativeElement;
    
    // Prevent context menu on right click
    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    // Handle mouse down for both selection and camera dragging
    canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      
      if (e.button === 0) { // Left click - building selection
        this.gameEngine.selectBuildingAt(e.clientX, e.clientY, canvas);
      } else if (e.button === 2) { // Right click - start camera drag
        this.isDragging = true;
        this.lastMousePosition = { x: e.clientX, y: e.clientY };
        canvas.style.cursor = 'grabbing';
      }
    });

    // Handle mouse movement for camera dragging
    canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging && e.buttons === 2) { // Right mouse button held
        const deltaX = e.clientX - this.lastMousePosition.x;
        const deltaY = e.clientY - this.lastMousePosition.y;
        
        // Convert screen movement to world movement (fixed inverted controls)
        const worldDeltaX = deltaX * 0.1;  // Positive deltaX moves camera right
        const worldDeltaZ = deltaY * 0.1;  // Positive deltaY moves camera down
        
        this.gameEngine.moveCameraByDelta(worldDeltaX, worldDeltaZ);
        
        this.lastMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    // Handle mouse up to stop camera dragging
    canvas.addEventListener('mouseup', (e) => {
      if (e.button === 2) { // Right click release
        this.isDragging = false;
        canvas.style.cursor = 'default';
      }
    });

    // Handle mouse wheel for camera zoom
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.onMouseWheel(e);
    });

    // Handle keyboard events for camera movement
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Start camera update loop
    this.updateCamera();

    // Make canvas focusable for keyboard events
    canvas.tabIndex = 0;
    canvas.focus();
  }

  private updateCamera(): void {
    const speed = this.cameraMoveSpeed;
    let deltaX = 0;
    let deltaZ = 0;

    if (this.keys['w'] || this.keys['arrowup']) {
      deltaZ -= speed;
    }
    if (this.keys['s'] || this.keys['arrowdown']) {
      deltaZ += speed;
    }
    if (this.keys['a'] || this.keys['arrowleft']) {
      deltaX -= speed;
    }
    if (this.keys['d'] || this.keys['arrowright']) {
      deltaX += speed;
    }

    if (deltaX !== 0 || deltaZ !== 0) {
      this.gameEngine.moveCameraByDelta(deltaX, deltaZ);
    }

    // Continue the update loop
    requestAnimationFrame(() => this.updateCamera());
  }

  ngOnDestroy(): void {
    this.gameEngine.destroy();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    const canvas = this.canvasRef.nativeElement;
    this.gameEngine.onWindowResize(canvas.clientWidth, canvas.clientHeight);
  }

  onMouseWheel(event: WheelEvent): void {
    // Pass the wheel delta to the game engine for camera zoom
    this.gameEngine.zoomCamera(event.deltaY);
  }

  getResourceEntries(gameState: GameState | null): [string, number][] {
    return gameState ? Object.entries(gameState.resources) : [];
  }

  getResearchEntries(gameState: GameState | null): [string, boolean][] {
    return gameState ? Object.entries(gameState.research) : [];
  }

  formatResourceName(resource: string): string {
    return resource.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  formatResearchName(research: string): string {
    return research.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  isResearchCompleted(researchId: string): boolean {
    // Use a simple subscription approach for this check
    let completed = false;
    this.gameState$.subscribe(state => {
      completed = state?.research[researchId] || false;
    }).unsubscribe();
    return completed;
  }
}
