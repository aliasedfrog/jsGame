# Free Graphics Resources for Factory Builder Game

## 🎨 Recommended Free Asset Sources

### 1. **Kenney.nl** - Premium Quality, Free Assets
- **Industrial Assets**: https://kenney.nl/assets/city-kit-industrial
- **3D Building Blocks**: https://kenney.nl/assets/blocky-characters
- **UI Elements**: https://kenney.nl/assets/input-prompts
- **License**: CC0 (Public Domain) - Perfect for commercial use

### 2. **OpenGameArt.org** - Community Driven
- **Factory Tilesets**: Search for "industrial", "factory", "mining"
- **Sound Effects**: Ambient machine sounds and factory audio
- **Licenses**: Various (CC-BY, CC0, OGA-BY)

### 3. **Itch.io Free Assets**
- **Industrial Pixel Art**: https://itch.io/game-assets/free/tag-industrial
- **Low-Poly 3D Models**: https://itch.io/game-assets/free/tag-low-poly
- **Top-down Sprites**: https://itch.io/game-assets/free/tag-top-down

### 4. **Recommended Specific Assets**

#### Visual Assets:
1. **PSX Industrial Environment Pack** (Free) - godgoldfear on itch.io
   - 3D industrial models with retro PSX aesthetic
   
2. **Industrial Parallax Background** (Free) - ansimuz on itch.io
   - Animated factory backgrounds

3. **Industrial Assets** (Free) - Atomic Realm on itch.io
   - 16x16 & 32x32 pixel art industrial buildings

4. **Factory Asset Pack** (Free) - Blood_seller on itch.io
   - Isometric factory buildings and equipment

#### Audio Assets:
1. **Factory Ambiance** - OpenGameArt.org
   - Background industrial sounds
   
2. **Machine Sounds Collection** - OpenGameArt.org
   - Various mechanical sound effects

## 🔧 Procedural Graphics Features

Your game already includes procedural graphics generation:

### Current Procedural Features:
- **Building Meshes**: Generated based on building type and configuration
- **Particle Systems**: Smoke, sparks, and steam effects
- **Material Textures**: Procedural metal, rust, and concrete textures
- **Lighting Effects**: Dynamic glow and animation systems

### Procedural Textures Available:
```typescript
// Use in your code
const metalTexture = this.graphicsService.createProceduralTexture('metal');
const rustTexture = this.graphicsService.createProceduralTexture('rust');
const concreteTexture = this.graphicsService.createProceduralTexture('concrete');
```

### Building Animations:
- **Rotation**: Spinning turbines and machinery
- **Pulse**: Glowing effects for active buildings
- **Bounce**: Subtle movement for active buildings
- **Particles**: Contextual effects (smoke for mines, sparks for furnaces)

## 🚀 Implementation Guide

### 1. Download Free Assets
```bash
# Create assets directory
mkdir -p src/assets/graphics/buildings
mkdir -p src/assets/graphics/textures
mkdir -p src/assets/audio

# Download recommended assets from the sources above
# Place 3D models in: src/assets/graphics/buildings/
# Place textures in: src/assets/graphics/textures/
# Place audio in: src/assets/audio/
```

### 2. Load Assets in Angular
```typescript
// In your GraphicsService
private loadAssets(): Promise<void> {
  return new Promise((resolve) => {
    const loader = new THREE.GLTFLoader();
    loader.load('assets/graphics/buildings/factory.glb', (gltf) => {
      this.factoryModel = gltf.scene;
      resolve();
    });
  });
}
```

### 3. Use External Textures
```typescript
// Load external textures
const textureLoader = new THREE.TextureLoader();
const factoryTexture = textureLoader.load('assets/graphics/textures/factory-wall.png');
factoryTexture.wrapS = factoryTexture.wrapT = THREE.RepeatWrapping;
```

## 🎮 Enhanced Visual Features

### Current Graphics System Features:
1. **Enhanced Building Models** with industrial details
2. **Particle Effects** for production visualization
3. **Dynamic Lighting** with glow effects
4. **Procedural Textures** for variety
5. **Animation System** for active buildings
6. **Modular Design** for easy asset swapping

### Performance Optimizations:
- Instanced rendering for repeated elements
- Level-of-detail (LOD) system for distant objects
- Particle pooling for efficiency
- Texture atlasing for reduced draw calls

## 📝 License Compliance

Always check licenses when using free assets:
- **CC0**: Public domain, no attribution required
- **CC-BY**: Attribution required
- **OGA-BY**: OpenGameArt attribution required

### Attribution Template:
```
Assets used:
- Industrial Building Pack by [Author] (License: CC-BY 3.0)
- Factory Sounds by [Author] (License: CC0)
```

## 🔗 Additional Resources

- **Blender**: Free 3D modeling for custom assets
- **GIMP**: Free texture editing and creation
- **Audacity**: Free audio editing for sound effects
- **Three.js Documentation**: For advanced 3D features
