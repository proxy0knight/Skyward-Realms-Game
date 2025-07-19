# 🏰 Skyward Realms Game

A modern 3D fantasy RPG game built with React, Three.js, and cutting-edge web technologies. Features an advanced admin dashboard with 2D map editor and 3D asset management system.

![Skyward Realms Game](assets/images/game-logo.png)

## ✨ Features

### 🎮 Core Game Features
- **3D World Rendering**: Immersive 3D environment with Three.js
- **Character Selection**: Choose from 4 elemental characters (Fire, Water, Earth, Air)
- **Combat System**: Real-time combat mechanics with elemental abilities
- **Story System**: Dynamic dialogue and quest management
- **Inventory Management**: Complete item and equipment system
- **Skills Panel**: Character progression and ability management
- **Map Navigation**: Interactive world exploration

### 🛠️ Admin Dashboard
- **2D Map Editor**: Visual map creation with drag-and-drop interface
- **3D Asset Management**: Comprehensive asset library with categories:
  - 🏔️ **Terrain**: Ground, rocks, trees, water features
  - 🏗️ **Structures**: Buildings, castles, monuments, ruins
  - 👥 **Living Things**: NPCs, animals, monsters, spawn points
- **External Asset Loading**: Support for GLTF/GLB, OBJ, FBX formats
- **Real-time 2D-3D Sync**: Bidirectional synchronization between map editor and 3D world
- **Asset Replacement**: Automatic replacement of existing assets
- **User Management**: Player accounts and analytics
- **Game Settings**: Server configuration and maintenance tools

### 🎨 Technical Features
- **Modern React**: Built with React 18 and functional components
- **Three.js Integration**: Advanced 3D graphics and scene management
- **Tailwind CSS**: Beautiful, responsive UI design
- **Event-Driven Architecture**: Custom event system for game mechanics
- **Modular Design**: Separated systems for combat, story, assets, and world management
- **Keyboard Shortcuts**: Quick access to game features and admin tools

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Skyward-Realms-Game.git
   cd Skyward-Realms-Game
   ```

2. **Install dependencies**
   ```bash
   cd game-client
   npm install
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5173`
   - The game will load automatically

## 🎯 How to Play

### Main Menu
- **Start Game**: Begin your adventure
- **Admin Access**: Access the admin dashboard (requires admin privileges)

### Character Selection
Choose your elemental character:
- 🔥 **Fire Elemental**: Fire magic and offensive abilities
- 💧 **Water Elemental**: Healing and defensive magic
- 🏔️ **Earth Elemental**: Stone magic and protection
- 💨 **Air Elemental**: Wind magic and mobility

### In-Game Controls
- **WASD**: Move character
- **Mouse**: Look around
- **I**: Open inventory
- **K**: Open skills panel
- **M**: Open map
- **Q**: Open quests
- **C**: Combat test panel
- **S**: Story test panel
- **V**: Model test panel
- **A**: Admin dashboard
- **ESC**: Close panels

## 🛠️ Admin Dashboard Usage

### Accessing Admin Panel
1. From main menu: Click "Admin Access"
2. In-game: Press 'A' key

### 2D Map Editor
1. **Navigate to Assets Tab** → **2D Map Editor**
2. **Asset Palette**: Drag assets from the left panel
3. **Tools**:
   - **Select**: Click to select objects
   - **Place Asset**: Drag assets to place them
   - **Move**: Drag existing objects
   - **Delete**: Remove selected objects
4. **Controls**:
   - **Zoom**: Use zoom buttons or slider
   - **Grid**: Adjustable grid size
   - **3D Sync**: Real-time synchronization with 3D world

### 3D Asset Management
1. **Upload External Assets**:
   - Go to "External Assets" tab
   - Enter asset URL (GLTF/GLB, OBJ, FBX)
   - Set asset name and type
   - Click "Load Asset"

2. **Local File Upload**:
   - Use "Upload Asset" buttons in Legacy Assets
   - Supports images, audio, video, and 3D models
   - Automatic replacement of existing assets

3. **Asset Categories**:
   - **Terrain**: Environmental objects (trees, rocks, water)
   - **Structures**: Buildings and architectural elements
   - **Living Things**: Characters, animals, and spawn points

### 3D World Synchronization
- **Connection Status**: Green dot indicates 3D world connection
- **Sync Modes**:
  - **Bidirectional**: Changes sync both ways
  - **2D → 3D Only**: Only map changes affect 3D world
  - **3D → 2D Only**: Only 3D changes affect map
- **Manual Controls**:
  - **Sync All to 3D**: Manually sync all objects
  - **Clear 3D Objects**: Remove all 3D objects

## 📁 Project Structure

```
Skyward-Realms-Game/
├── assets/                 # Game assets (images, audio)
├── game-client/           # Main React application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── ui/        # Reusable UI components
│   │   │   └── ...        # Game-specific components
│   │   ├── lib/           # Game systems and utilities
│   │   │   ├── GameEngine.js
│   │   │   ├── CombatSystem.js
│   │   │   ├── StorySystem.js
│   │   │   └── ...
│   │   └── main.jsx       # Application entry point
│   ├── package.json       # Dependencies and scripts
│   └── vite.config.js     # Build configuration
├── README.md              # This file
└── ...                    # Documentation and guides
```

## 🎨 Asset Management

### Supported Formats
- **3D Models**: GLTF/GLB, OBJ, FBX
- **Images**: JPG, PNG, WebP
- **Audio**: MP3, WAV, OGG
- **Data**: JSON, CSV

### Asset Categories
- **Player Assets**: Character models, animations, textures
- **Environment Assets**: Terrain, buildings, props
- **Item Assets**: Weapons, armor, consumables
- **Other Assets**: UI elements, audio, effects

## 🔧 Development

### Available Scripts
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run tests
npm run lint         # Lint code
```

### Key Technologies
- **Frontend**: React 18, Vite, Tailwind CSS
- **3D Graphics**: Three.js, GLTF Loader
- **State Management**: React Hooks, Context API
- **Build Tool**: Vite
- **Package Manager**: npm/pnpm

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js**: 3D graphics library
- **React**: UI framework
- **Tailwind CSS**: Styling framework
- **Lucide React**: Icon library
- **Vite**: Build tool

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/YOUR_USERNAME/Skyward-Realms-Game/issues) page
2. Create a new issue with detailed description
3. Include system information and error logs

---

**Made with ❤️ for the gaming community**

