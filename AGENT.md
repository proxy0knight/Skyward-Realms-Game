# AGENT.md - Skyward Realms Game Development Guide

## Build/Test Commands
**Working Directory:** `cd game-client` (required for all commands)
- `pnpm run dev` - Start development server (port 5173)
- `pnpm run build` - Production build 
- `pnpm run lint` - ESLint code quality check
- `pnpm run preview` - Preview production build
- `pnpm install` - Install dependencies
- `pnpm run test` - Run tests in watch mode
- `pnpm run test:run` - Run tests once
- `pnpm run test:coverage` - Run tests with coverage
- `pnpm audit` - Check for security vulnerabilities

## Architecture & Structure
- **Framework:** React 19 + Vite + Babylon.js 3D engine
- **Main Directories:**
  - `game-client/src/components/` - React UI components
  - `game-client/src/lib/` - Game engine systems (BabylonGameEngine, BabylonCharacter, etc.)
  - `game-client/public/assets/` - Static game assets (models, textures, audio)
- **Key Systems:** BabylonGameEngine.js (main), BabylonCharacter.js, ProceduralSystems.js
- **Physics:** Cannon.js integration with collision detection
- **Asset Loading:** GLB/GLTF models with procedural fallbacks

## Code Style & Conventions
- **ESLint Config:** React hooks, no-unused-vars (ignore uppercase), ES2020+
- **Imports:** Use `@/` alias for src directory, explicit .jsx extensions
- **Components:** Functional components, PascalCase naming
- **UI Library:** Radix UI + Tailwind CSS, shadcn/ui patterns
- **Files:** .jsx for React components, .js for utility modules
- **Error Handling:** Graceful fallbacks with procedural systems
- **No Comments:** Keep code clean without explanatory comments unless complex
