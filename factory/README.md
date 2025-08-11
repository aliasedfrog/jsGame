# Factory Builder Game

A 3D factory builder game built with Angular and Three.js, featuring a top-down perspective and sprite-style graphics.

## Features

- **3D Rendered Environment**: Top-down perspective using Three.js
- **Factory Building Mechanics**: Place and manage different types of buildings
- **Resource Management**: Mine, process, and manage various materials
- **Research Tree**: Unlock new technologies and building types
- **Real-time Production**: Buildings automatically produce resources over time

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Development server

To start a local development server, run:

```bash
ng serve
```

The game will be available at `http://localhost:4200/`

## ✨ Enhanced Graphics Features

### Current Visual Systems:
- **Procedural Building Generation**: Dynamic 3D models with contextual details
- **Particle Effects**: Smoke, sparks, and steam for active buildings
- **Procedural Textures**: Metal, rust, and concrete materials
- **Animation System**: Rotating machinery, pulsing effects, and subtle movements
- **Advanced Lighting**: Multiple light sources with shadows and fog
- **Environmental Elements**: Trees, roads, and resource deposits

### Free Graphics Resources:
See `GRAPHICS_RESOURCES.md` for:
- Recommended free asset libraries (Kenney.nl, OpenGameArt, Itch.io)
- Specific industrial asset packs
- Audio resources for factory ambiance
- Implementation guides for external assets

### Building

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
