import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import { 
  Users, 
  Settings, 
  Database, 
  Shield, 
  BarChart3, 
  Upload, 
  Download, 
  Trash2, 
  Edit, 
  Plus,
  Eye,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  X,
  ArrowLeft,
  Save,
  RefreshCw,
  Activity,
  Gamepad2,
  FileText,
  Image,
  Music,
  Video,
  Map,
  Building,
  Leaf,
  Box,
  Globe,
  Layers,
  Grid,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Mountain
} from 'lucide-react'
import './AdminPanel.css'

const AdminPanel = ({ onBack, gameEngine: propGameEngine }) => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [users, setUsers] = useState([])
  const [assets, setAssets] = useState({
    player: [],
    environment: [],
    items: [],
    others: []
  })
  const [gameSettings, setGameSettings] = useState({})
  const [analytics, setAnalytics] = useState({})
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // 3D Assets and Map Management
  const [mapScale, setMapScale] = useState(1)
  const [selectedTool, setSelectedTool] = useState('select')
  const [mapObjects, setMapObjects] = useState([])
  const [externalAssets, setExternalAssets] = useState([])
  const [assetUrl, setAssetUrl] = useState('')
  const [assetType, setAssetType] = useState('gltf')
  const [assetName, setAssetName] = useState('')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isLoadingAsset, setIsLoadingAsset] = useState(false)
  const canvasRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [selectedObject, setSelectedObject] = useState(null)
  const [draggedAsset, setDraggedAsset] = useState(null)
  const [isDraggingAsset, setIsDraggingAsset] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState({
    terrain: true,
    structures: true,
    living: true
  })
  const [gameEngine, setGameEngine] = useState(propGameEngine)
  const [is3DWorldConnected, setIs3DWorldConnected] = useState(false)
  const [syncMode, setSyncMode] = useState('bidirectional') // '2d-to-3d', '3d-to-2d', 'bidirectional'

  // Canvas drawing functionality
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const drawGrid = () => {
      const gridSize = 20 * mapScale
      ctx.strokeStyle = '#4a5568'
      ctx.lineWidth = 0.5

      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
    }

    const drawObjects = () => {
      mapObjects.forEach(obj => {
        const isSelected = selectedObject?.id === obj.id
        ctx.fillStyle = isSelected ? '#f56565' : '#4299e1'
        ctx.strokeStyle = isSelected ? '#e53e3e' : '#3182ce'
        ctx.lineWidth = isSelected ? 3 : 2

        const x = obj.x * mapScale
        const y = obj.y * mapScale
        const width = obj.size.width * mapScale
        const height = obj.size.height * mapScale

        ctx.fillRect(x, y, width, height)
        ctx.strokeRect(x, y, width, height)

        // Draw object name
        ctx.fillStyle = '#ffffff'
        ctx.font = `${12 * mapScale}px Arial`
        ctx.textAlign = 'center'
        ctx.fillText(obj.name, x + width / 2, y + height / 2)
      })
    }

    const drawDragPreview = () => {
      if (isDraggingAsset && draggedAsset) {
        // Get mouse position relative to canvas
        const mouseX = (window.mouseX || 0) * mapScale
        const mouseY = (window.mouseY || 0) * mapScale
        
        // Snap to grid
        const gridX = Math.floor(mouseX / (20 * mapScale)) * 20 * mapScale
        const gridY = Math.floor(mouseY / (20 * mapScale)) * 20 * mapScale
        
        const width = draggedAsset.size.width * mapScale
        const height = draggedAsset.size.height * mapScale

        // Draw semi-transparent preview
        ctx.fillStyle = 'rgba(147, 51, 234, 0.3)'
        ctx.strokeStyle = '#9333ea'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])

        ctx.fillRect(gridX, gridY, width, height)
        ctx.strokeRect(gridX, gridY, width, height)

        // Reset line dash
        ctx.setLineDash([])

        // Draw asset name
        ctx.fillStyle = '#9333ea'
        ctx.font = `${12 * mapScale}px Arial`
        ctx.textAlign = 'center'
        ctx.fillText(draggedAsset.name, gridX + width / 2, gridY + height / 2)
      }
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw background
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw grid and objects
    drawGrid()
    drawObjects()
    drawDragPreview()
  }, [mapObjects, mapScale, selectedObject, isDraggingAsset, draggedAsset])

  // Canvas interaction handlers
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / mapScale
    const y = (e.clientY - rect.top) / mapScale

    if (selectedTool === 'place' && selectedAsset) {
      // Place new object
      const newObject = {
        id: Date.now(),
        name: selectedAsset.name,
        x: Math.floor(x / 20) * 20, // Snap to grid
        y: Math.floor(y / 20) * 20,
        size: selectedAsset.size,
        type: selectedAsset.type,
        category: selectedAsset.category || 'unknown'
      }
      setMapObjects(prev => [...prev, newObject])
      
      // Sync to 3D world if connected
      if (is3DWorldConnected && (syncMode === '2d-to-3d' || syncMode === 'bidirectional')) {
        syncTo3DWorld('add', newObject)
      }
    } else if (selectedTool === 'select') {
      // Select object
      const clickedObject = mapObjects.find(obj => {
        const objX = obj.x
        const objY = obj.y
        const objWidth = obj.size.width
        const objHeight = obj.size.height
        return x >= objX && x <= objX + objWidth && y >= objY && y <= objY + objHeight
      })
      setSelectedObject(clickedObject || null)
    } else if (selectedTool === 'delete' && selectedObject) {
      // Delete selected object
      setMapObjects(prev => prev.filter(obj => obj.id !== selectedObject.id))
      
      // Sync to 3D world if connected
      if (is3DWorldConnected && (syncMode === '2d-to-3d' || syncMode === 'bidirectional')) {
        syncTo3DWorld('remove', selectedObject)
      }
      
      setSelectedObject(null)
    }
  }

  const handleCanvasMouseDown = (e) => {
    if (selectedTool === 'move' && selectedObject) {
      setIsDragging(true)
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / mapScale
      const y = (e.clientY - rect.top) / mapScale
      setDragOffset({
        x: x - selectedObject.x,
        y: y - selectedObject.y
      })
    }
  }

  const handleCanvasMouseMove = (e) => {
    if (isDragging && selectedObject) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / mapScale
      const y = (e.clientY - rect.top) / mapScale

      const newX = Math.floor((x - dragOffset.x) / 20) * 20 // Snap to grid
      const newY = Math.floor((y - dragOffset.y) / 20) * 20

      const updatedObject = { ...selectedObject, x: newX, y: newY }
      
      setMapObjects(prev => prev.map(obj => 
        obj.id === selectedObject.id ? updatedObject : obj
      ))
      
      // Sync to 3D world if connected
      if (is3DWorldConnected && (syncMode === '2d-to-3d' || syncMode === 'bidirectional')) {
        syncTo3DWorld('update', updatedObject)
      }
    }

    // Track mouse position for drag preview
    if (isDraggingAsset) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      window.mouseX = e.clientX - rect.left
      window.mouseY = e.clientY - rect.top
    }
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
    // Clear mouse tracking
    window.mouseX = null
    window.mouseY = null
  }

  // Asset drag and drop handlers
  const handleAssetDragStart = (e, asset) => {
    setDraggedAsset(asset)
    setIsDraggingAsset(true)
    e.dataTransfer.setData('text/plain', asset.id)
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleAssetDragEnd = () => {
    setIsDraggingAsset(false)
    setDraggedAsset(null)
  }

  const handleCanvasDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    
    // Add visual feedback
    const canvas = canvasRef.current
    if (canvas) {
      canvas.style.borderColor = '#9333ea'
      canvas.style.borderWidth = '3px'
    }
  }

  const handleCanvasDrop = (e) => {
    e.preventDefault()
    if (!draggedAsset) return

    const canvas = canvasRef.current
    if (!canvas) return

    // Reset canvas border
    canvas.style.borderColor = 'rgba(147, 51, 234, 0.2)'
    canvas.style.borderWidth = '1px'

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / mapScale
    const y = (e.clientY - rect.top) / mapScale

    // Place the dragged asset on the map
    const newObject = {
      id: Date.now(),
      name: draggedAsset.name,
      x: Math.floor(x / 20) * 20, // Snap to grid
      y: Math.floor(y / 20) * 20,
      size: draggedAsset.size,
      type: draggedAsset.type,
      assetId: draggedAsset.id,
      category: draggedAsset.category || 'unknown'
    }
    
    setMapObjects(prev => [...prev, newObject])
    
    // Sync to 3D world if connected
    if (is3DWorldConnected && (syncMode === '2d-to-3d' || syncMode === 'bidirectional')) {
      syncTo3DWorld('add', newObject)
    }
    
    setIsDraggingAsset(false)
    setDraggedAsset(null)
  }

  // 3D World Synchronization Functions
  const syncTo3DWorld = (action, object) => {
    if (!gameEngine || !gameEngine.scene) return

    try {
      switch (action) {
        case 'add':
          addObjectTo3DWorld(object)
          break
        case 'remove':
          removeObjectFrom3DWorld(object.id)
          break
        case 'update':
          updateObjectIn3DWorld(object)
          break
        case 'sync_all':
          syncAllObjectsTo3DWorld()
          break
      }
    } catch (error) {
      console.error('Error syncing to 3D world:', error)
    }
  }

  const addObjectTo3DWorld = (object) => {
    if (!gameEngine || !gameEngine.scene) return

    // Convert 2D coordinates to 3D world coordinates
    const worldX = (object.x - 400) / 20 // Center the map and scale
    const worldZ = (object.y - 300) / 20
    const worldY = 0 // Ground level

    // Create 3D object based on asset type
    let mesh
    const geometry = new THREE.BoxGeometry(object.size.width, object.size.height, object.size.width)
    const material = new THREE.MeshLambertMaterial({ 
      color: getAssetColor(object.type, object.category),
      transparent: true,
      opacity: 0.8
    })
    mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(worldX, worldY, worldZ)
    mesh.userData = {
      mapObjectId: object.id,
      assetType: object.type,
      category: object.category,
      name: object.name
    }

    // Add to scene
    gameEngine.scene.add(mesh)
    
    // Store reference for later updates
    if (!gameEngine.mapObjects) gameEngine.mapObjects = new Map()
    gameEngine.mapObjects.set(object.id, mesh)

    console.log(`Added ${object.name} to 3D world at (${worldX}, ${worldY}, ${worldZ})`)
  }

  const removeObjectFrom3DWorld = (objectId) => {
    if (!gameEngine || !gameEngine.mapObjects) return

    const mesh = gameEngine.mapObjects.get(objectId)
    if (mesh) {
      gameEngine.scene.remove(mesh)
      gameEngine.mapObjects.delete(objectId)
      console.log(`Removed object ${objectId} from 3D world`)
    }
  }

  const updateObjectIn3DWorld = (object) => {
    if (!gameEngine || !gameEngine.mapObjects) return

    const mesh = gameEngine.mapObjects.get(object.id)
    if (mesh) {
      const worldX = (object.x - 400) / 20
      const worldZ = (object.y - 300) / 20
      mesh.position.set(worldX, 0, worldZ)
      console.log(`Updated ${object.name} position in 3D world`)
    }
  }

  const syncAllObjectsTo3DWorld = () => {
    if (!gameEngine || !gameEngine.scene) return

    // Clear existing 3D objects
    if (gameEngine.mapObjects) {
      gameEngine.mapObjects.forEach(mesh => {
        gameEngine.scene.remove(mesh)
      })
      gameEngine.mapObjects.clear()
    }

    // Add all current map objects
    mapObjects.forEach(object => {
      addObjectTo3DWorld(object)
    })

    console.log(`Synced ${mapObjects.length} objects to 3D world`)
  }

  const getAssetColor = (type, category) => {
    switch (category) {
      case 'terrain':
        return 0x4ade80 // Green
      case 'structures':
        return 0xfbbf24 // Yellow
      case 'living':
        return 0xef4444 // Red
      default:
        return 0x8b5cf6 // Purple
    }
  }

  // Listen for 3D world changes and sync back to 2D map
  const setup3DWorldListener = () => {
    if (!gameEngine) return

    // Listen for object additions in 3D world
    gameEngine.addEventListener('objectAdded', (event) => {
      if (syncMode === '3d-to-2d' || syncMode === 'bidirectional') {
        const { object, position } = event.detail
        
        // Convert 3D coordinates back to 2D map coordinates
        const mapX = (position.x * 20) + 400
        const mapY = (position.z * 20) + 300

        const newMapObject = {
          id: Date.now(),
          name: object.name || '3D Object',
          x: Math.floor(mapX / 20) * 20,
          y: Math.floor(mapY / 20) * 20,
          size: { width: 2, height: 2 },
          type: '3d-imported',
          category: 'imported'
        }

        setMapObjects(prev => [...prev, newMapObject])
        console.log(`Synced 3D object ${object.name} to 2D map`)
      }
    })

    // Listen for object removals in 3D world
    gameEngine.addEventListener('objectRemoved', (event) => {
      if (syncMode === '3d-to-2d' || syncMode === 'bidirectional') {
        const { objectId } = event.detail
        setMapObjects(prev => prev.filter(obj => obj.id !== objectId))
        console.log(`Removed object ${objectId} from 2D map (synced from 3D)`)
      }
    })
  }

  // Initialize 3D world connection
  useEffect(() => {
    if (gameEngine && !is3DWorldConnected) {
      setIs3DWorldConnected(true)
      setup3DWorldListener()
      console.log('Connected to 3D world for synchronization')
    }
  }, [gameEngine, is3DWorldConnected])

  // Update gameEngine when prop changes
  useEffect(() => {
    if (propGameEngine && propGameEngine !== gameEngine) {
      setGameEngine(propGameEngine)
      setIs3DWorldConnected(false) // Reset connection to trigger re-initialization
    }
  }, [propGameEngine])

  const handleCanvasDragLeave = (e) => {
    // Reset canvas border when leaving drop zone
    const canvas = canvasRef.current
    if (canvas) {
      canvas.style.borderColor = 'rgba(147, 51, 234, 0.2)'
      canvas.style.borderWidth = '1px'
    }
  }

  // Map tools
  const mapTools = [
    { id: 'select', name: 'Select', icon: Eye },
    { id: 'place', name: 'Place Asset', icon: Plus },
    { id: 'move', name: 'Move', icon: Map },
    { id: 'delete', name: 'Delete', icon: Trash2 }
  ]

  // 3D Asset categories
  const assetCategories = {
    terrain: {
      name: 'Terrain',
      icon: Mountain,
      subcategories: {
        ground: {
          name: 'Ground',
          assets: [
            { id: 'dirt_patch', name: 'Dirt Patch', type: 'terrain', size: { width: 2, height: 2 } },
            { id: 'grass_patch', name: 'Grass Patch', type: 'terrain', size: { width: 2, height: 2 } },
            { id: 'sand_patch', name: 'Sand Patch', type: 'terrain', size: { width: 2, height: 2 } },
            { id: 'stone_ground', name: 'Stone Ground', type: 'terrain', size: { width: 3, height: 3 } }
          ]
        },
        rocks: {
          name: 'Rocks',
          assets: [
            { id: 'small_rock', name: 'Small Rock', type: 'terrain', size: { width: 1, height: 1 } },
            { id: 'large_rock', name: 'Large Rock', type: 'terrain', size: { width: 2, height: 2 } },
            { id: 'rock_formation', name: 'Rock Formation', type: 'terrain', size: { width: 3, height: 2 } },
            { id: 'crystal_cluster', name: 'Crystal Cluster', type: 'terrain', size: { width: 1, height: 1 } }
          ]
        },
        trees: {
          name: 'Trees',
          assets: [
            { id: 'pine_tree', name: 'Pine Tree', type: 'terrain', size: { width: 1, height: 1 } },
            { id: 'oak_tree', name: 'Oak Tree', type: 'terrain', size: { width: 1, height: 1 } },
            { id: 'willow_tree', name: 'Willow Tree', type: 'terrain', size: { width: 1, height: 1 } },
            { id: 'fruit_tree', name: 'Fruit Tree', type: 'terrain', size: { width: 1, height: 1 } }
          ]
        },
        water: {
          name: 'Water',
          assets: [
            { id: 'small_pond', name: 'Small Pond', type: 'terrain', size: { width: 2, height: 2 } },
            { id: 'large_pond', name: 'Large Pond', type: 'terrain', size: { width: 4, height: 3 } },
            { id: 'stream', name: 'Stream', type: 'terrain', size: { width: 3, height: 1 } },
            { id: 'waterfall', name: 'Waterfall', type: 'terrain', size: { width: 2, height: 3 } }
          ]
        }
      }
    },
    structures: {
      name: 'Structures',
      icon: Building,
      subcategories: {
        buildings: {
          name: 'Buildings',
          assets: [
            { id: 'small_house', name: 'Small House', type: 'structure', size: { width: 2, height: 2 } },
            { id: 'large_house', name: 'Large House', type: 'structure', size: { width: 3, height: 2 } },
            { id: 'shop', name: 'Shop', type: 'structure', size: { width: 2, height: 2 } },
            { id: 'inn', name: 'Inn', type: 'structure', size: { width: 3, height: 2 } }
          ]
        },
        castles: {
          name: 'Castles',
          assets: [
            { id: 'small_castle', name: 'Small Castle', type: 'structure', size: { width: 4, height: 3 } },
            { id: 'large_castle', name: 'Large Castle', type: 'structure', size: { width: 6, height: 4 } },
            { id: 'tower', name: 'Tower', type: 'structure', size: { width: 2, height: 4 } },
            { id: 'gatehouse', name: 'Gatehouse', type: 'structure', size: { width: 3, height: 2 } }
          ]
        },
        monuments: {
          name: 'Monuments',
          assets: [
            { id: 'statue', name: 'Statue', type: 'structure', size: { width: 1, height: 2 } },
            { id: 'obelisk', name: 'Obelisk', type: 'structure', size: { width: 1, height: 3 } },
            { id: 'fountain', name: 'Fountain', type: 'structure', size: { width: 2, height: 2 } },
            { id: 'altar', name: 'Altar', type: 'structure', size: { width: 2, height: 1 } }
          ]
        },
        ruins: {
          name: 'Ruins',
          assets: [
            { id: 'ruined_wall', name: 'Ruined Wall', type: 'structure', size: { width: 3, height: 1 } },
            { id: 'ruined_tower', name: 'Ruined Tower', type: 'structure', size: { width: 2, height: 2 } },
            { id: 'ancient_pillar', name: 'Ancient Pillar', type: 'structure', size: { width: 1, height: 2 } },
            { id: 'crumbled_building', name: 'Crumbled Building', type: 'structure', size: { width: 3, height: 2 } }
          ]
        }
      }
    },
    living: {
      name: 'Living Things',
      icon: Users,
      subcategories: {
        npcs: {
          name: 'NPCs',
          assets: [
            { id: 'merchant', name: 'Merchant', type: 'living', size: { width: 1, height: 1 } },
            { id: 'guard', name: 'Guard', type: 'living', size: { width: 1, height: 1 } },
            { id: 'villager', name: 'Villager', type: 'living', size: { width: 1, height: 1 } },
            { id: 'wizard', name: 'Wizard', type: 'living', size: { width: 1, height: 1 } }
          ]
        },
        animals: {
          name: 'Animals',
          assets: [
            { id: 'deer', name: 'Deer', type: 'living', size: { width: 1, height: 1 } },
            { id: 'wolf', name: 'Wolf', type: 'living', size: { width: 1, height: 1 } },
            { id: 'bear', name: 'Bear', type: 'living', size: { width: 1, height: 1 } },
            { id: 'bird', name: 'Bird', type: 'living', size: { width: 1, height: 1 } }
          ]
        },
        monsters: {
          name: 'Monsters',
          assets: [
            { id: 'goblin', name: 'Goblin', type: 'living', size: { width: 1, height: 1 } },
            { id: 'orc', name: 'Orc', type: 'living', size: { width: 1, height: 1 } },
            { id: 'troll', name: 'Troll', type: 'living', size: { width: 1, height: 1 } },
            { id: 'dragon', name: 'Dragon', type: 'living', size: { width: 2, height: 2 } }
          ]
        },
        spawns: {
          name: 'Spawn Points',
          assets: [
            { id: 'monster_spawn', name: 'Monster Spawn', type: 'living', size: { width: 1, height: 1 } },
            { id: 'animal_spawn', name: 'Animal Spawn', type: 'living', size: { width: 1, height: 1 } },
            { id: 'npc_spawn', name: 'NPC Spawn', type: 'living', size: { width: 1, height: 1 } },
            { id: 'boss_spawn', name: 'Boss Spawn', type: 'living', size: { width: 2, height: 2 } }
          ]
        }
      }
    }
  }

  // Mock data for demonstration
  useEffect(() => {
    setUsers([
      { id: 1, username: 'player1', email: 'player1@example.com', role: 'user', status: 'active', lastLogin: '2024-01-15', playTime: '2h 30m' },
      { id: 2, username: 'admin_user', email: 'admin@skywardrealms.com', role: 'admin', status: 'active', lastLogin: '2024-01-15', playTime: '5h 45m' },
      { id: 3, username: 'moderator1', email: 'mod@skywardrealms.com', role: 'moderator', status: 'active', lastLogin: '2024-01-14', playTime: '1h 20m' },
      { id: 4, username: 'banned_user', email: 'banned@example.com', role: 'user', status: 'banned', lastLogin: '2024-01-10', playTime: '0h 0m' }
    ])

    setAssets({
      player: [
        { id: 1, name: 'fire_elemental.jpg', type: 'image', category: 'characters', size: '2.3MB', uploadDate: '2024-01-10', status: 'active' },
        { id: 2, name: 'water_mage.png', type: 'image', category: 'characters', size: '1.8MB', uploadDate: '2024-01-11', status: 'active' },
        { id: 3, name: 'player_animations.json', type: 'data', category: 'animations', size: '245KB', uploadDate: '2024-01-09', status: 'active' }
      ],
      environment: [
        { id: 4, name: 'crystal_cave.jpg', type: 'image', category: 'environments', size: '4.1MB', uploadDate: '2024-01-12', status: 'active' },
        { id: 5, name: 'enchanted_forest.jpg', type: 'image', category: 'environments', size: '3.7MB', uploadDate: '2024-01-13', status: 'active' },
        { id: 6, name: 'floating_islands.jpg', type: 'image', category: 'environments', size: '5.2MB', uploadDate: '2024-01-14', status: 'active' },
        { id: 7, name: 'environment_audio.mp3', type: 'audio', category: 'ambient', size: '12.3MB', uploadDate: '2024-01-08', status: 'active' }
      ],
      items: [
        { id: 8, name: 'magic_sword.png', type: 'image', category: 'weapons', size: '890KB', uploadDate: '2024-01-10', status: 'active' },
        { id: 9, name: 'health_potion.png', type: 'image', category: 'consumables', size: '456KB', uploadDate: '2024-01-11', status: 'active' },
        { id: 10, name: 'armor_set.png', type: 'image', category: 'armor', size: '1.2MB', uploadDate: '2024-01-12', status: 'active' },
        { id: 11, name: 'item_database.json', type: 'data', category: 'database', size: '78KB', uploadDate: '2024-01-13', status: 'active' }
      ],
      others: [
        { id: 12, name: 'battle_music.mp3', type: 'audio', category: 'music', size: '8.7MB', uploadDate: '2024-01-08', status: 'active' },
        { id: 13, name: 'spell_effects.json', type: 'data', category: 'gameplay', size: '156KB', uploadDate: '2024-01-14', status: 'active' },
        { id: 14, name: 'ui_elements.png', type: 'image', category: 'interface', size: '2.1MB', uploadDate: '2024-01-15', status: 'active' },
        { id: 15, name: 'temporary_effects.mp4', type: 'video', category: 'effects', size: '15.6MB', uploadDate: '2024-01-16', status: 'pending' }
      ]
    })

    setGameSettings({
      maxPlayers: 100,
      serverMaintenance: false,
      autoSave: true,
      debugMode: false,
      version: '1.0.0-beta'
    })

    setAnalytics({
      totalUsers: 1250,
      activeUsers: 342,
      totalPlayTime: '1,234h',
      serverUptime: '99.8%',
      dailyLogins: 89,
      weeklyGrowth: '+12%'
    })
  }, [])

  const handleUserAction = (userId, action) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: action === 'ban' ? 'banned' : 'active' }
        : user
    ))
  }

  const handleAssetUpload = (file, category = 'others') => {
    const newAsset = {
      id: Date.now(),
      name: file.name,
      type: file.type.split('/')[0],
      category: category,
      size: `${(file.size / 1024 / 1024).toFixed(1)}MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'active'
    }
    setAssets(prev => ({
      ...prev,
      [category]: [...prev[category], newAsset]
    }))
  }

  // Enhanced asset management functions
  const handleAssetReplace = (oldAssetId, newAsset) => {
    // Replace asset in the appropriate category
    setAssets(prev => {
      const newAssets = { ...prev }
      Object.keys(newAssets).forEach(category => {
        newAssets[category] = newAssets[category].map(asset => 
          asset.id === oldAssetId ? { ...asset, ...newAsset, id: Date.now() } : asset
        )
      })
      return newAssets
    })
  }

  const handleExternalAssetLoad = () => {
    if (!assetUrl.trim()) return

    setIsLoadingAsset(true)
    setLoadingProgress(0)
    
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 10
      })
    }, 100)
    
    setTimeout(() => {
      setLoadingProgress(100)
      setIsLoadingAsset(false)
      
      // Add to external assets
      const newAsset = {
        id: Date.now(),
        name: assetName || 'External Asset',
        type: 'external',
        url: assetUrl,
        fileType: assetType,
        size: { width: 2, height: 2 },
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'active'
      }
      
      setExternalAssets(prev => [...prev, newAsset])
      
      // Also add to legacy assets for compatibility
      setAssets(prev => ({
        ...prev,
        others: [...prev.others, {
          id: newAsset.id,
          name: newAsset.name,
          type: '3d-model',
          category: 'external',
          size: 'Unknown',
          uploadDate: newAsset.uploadDate,
          status: newAsset.status
        }]
      }))
      
      setAssetUrl('')
      setAssetName('')
      setLoadingProgress(0)
    }, 2000)
  }

  // File upload handler for local files
  const handleFileUpload = (event, category = 'others') => {
    const file = event.target.files[0]
    if (!file) return

    // Check if file already exists and replace it
    const existingAsset = assets[category]?.find(asset => asset.name === file.name)
    
    if (existingAsset) {
      // Replace existing asset
      handleAssetReplace(existingAsset.id, {
        name: file.name,
        type: file.type.split('/')[0],
        category: category,
        size: `${(file.size / 1024 / 1024).toFixed(1)}MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'active'
      })
    } else {
      // Add new asset
      handleAssetUpload(file, category)
    }
  }

  const handleSettingChange = (key, value) => {
    setGameSettings({ ...gameSettings, [key]: value })
  }

  return (
    <div className="admin-panel min-h-screen p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center space-x-8">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-white hover:bg-white/10 px-4 py-2"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Game
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
            <p className="text-purple-300">Skyward Realms Game Administration</p>
          </div>
        </div>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2 text-base">
          <CheckCircle className="h-4 w-4 mr-2" />
          Admin Access
        </Badge>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
        <TabsList className="grid w-full grid-cols-6 bg-black/20 backdrop-blur-sm border border-purple-500/20 mb-8 rounded-xl p-2 gap-4">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-500/20 rounded-lg px-3 py-2">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-purple-500/20 rounded-lg px-3 py-2">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="assets" className="data-[state=active]:bg-purple-500/20 rounded-lg px-3 py-2">
            <Database className="h-4 w-4 mr-2" />
            Assets
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-purple-500/20 rounded-lg px-3 py-2">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-purple-500/20 rounded-lg px-3 py-2">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500/20 rounded-lg px-3 py-2">
            <Activity className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-300">Total Users</p>
                    <p className="text-2xl font-bold text-white">{analytics.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-300">Active Users</p>
                    <p className="text-2xl font-bold text-white">{analytics.activeUsers}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-300">Server Uptime</p>
                    <p className="text-2xl font-bold text-white">{analytics.serverUptime}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-300">Total Play Time</p>
                    <p className="text-2xl font-bold text-white">{analytics.totalPlayTime}</p>
                  </div>
                  <Gamepad2 className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 rounded bg-white/5">
                    <Users className="h-4 w-4 text-green-400" />
                    <div>
                      <p className="text-sm text-white">New user registered: player123</p>
                      <p className="text-xs text-gray-400">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded bg-white/5">
                    <Upload className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-sm text-white">Asset uploaded: new_character.png</p>
                      <p className="text-xs text-gray-400">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded bg-white/5">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <div>
                      <p className="text-sm text-white">Server warning: High CPU usage</p>
                      <p className="text-xs text-gray-400">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Asset
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Settings className="h-4 w-4 mr-2" />
                    Game Settings
                  </Button>
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Shield className="h-4 w-4 mr-2" />
                    Security
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 rounded bg-white/5">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.username}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant={user.role === 'admin' ? 'default' : 'secondary'}
                            className={user.role === 'admin' ? 'bg-purple-500' : 'bg-gray-500'}
                          >
                            {user.role}
                          </Badge>
                          <Badge 
                            variant={user.status === 'active' ? 'default' : 'destructive'}
                            className={user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}
                          >
                            {user.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-400 hover:bg-blue-500/20"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {user.status === 'active' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUserAction(user.id, 'ban')}
                          className="text-red-400 hover:bg-red-500/20"
                        >
                          <Lock className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUserAction(user.id, 'unban')}
                          className="text-green-400 hover:bg-green-500/20"
                        >
                          <Unlock className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-6">
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">3D Asset Management & Map Editor</CardTitle>
                <div className="flex space-x-2">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Save className="h-4 w-4 mr-2" />
                    Save Map
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Asset
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="map-editor" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-black/20 backdrop-blur-sm border border-purple-500/20">
                  <TabsTrigger value="map-editor" className="data-[state=active]:bg-purple-500/20">
                    <Map className="h-4 w-4 mr-2" />
                    2D Map Editor
                  </TabsTrigger>
                  <TabsTrigger value="3d-assets" className="data-[state=active]:bg-purple-500/20">
                    <Box className="h-4 w-4 mr-2" />
                    3D Assets
                  </TabsTrigger>
                  <TabsTrigger value="external-assets" className="data-[state=active]:bg-purple-500/20">
                    <Globe className="h-4 w-4 mr-2" />
                    External Assets
                  </TabsTrigger>
                  <TabsTrigger value="legacy-assets" className="data-[state=active]:bg-purple-500/20">
                    <Database className="h-4 w-4 mr-2" />
                    Legacy Assets
                  </TabsTrigger>
                </TabsList>

                {/* 2D Map Editor Tab */}
                <TabsContent value="map-editor" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Asset Palette */}
                    <div className="space-y-4">
                      <Card className="bg-black/10 backdrop-blur-sm border-purple-500/10">
                        <CardHeader>
                          <CardTitle className="text-white text-sm">Asset Palette</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Tools */}
                          <div>
                            <label className="text-sm text-purple-300 mb-2 block">Tools</label>
                            <div className="grid grid-cols-2 gap-2">
                              {mapTools.map(tool => (
                                <Button
                                  key={tool.id}
                                  variant={selectedTool === tool.id ? "default" : "outline"}
                                  size="sm"
                                  className="justify-start"
                                  onClick={() => setSelectedTool(tool.id)}
                                >
                                  <tool.icon className="h-4 w-4 mr-2" />
                                  {tool.name}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {/* Asset Categories */}
                          <div className="space-y-3">
                            {Object.entries(assetCategories).map(([category, data]) => (
                              <div key={category}>
                                <button
                                  onClick={() => setExpandedCategories(prev => ({
                                    ...prev,
                                    [category]: !prev[category]
                                  }))}
                                  className="flex items-center justify-between w-full text-left text-sm text-purple-300 mb-2 hover:text-purple-200"
                                >
                                  <div className="flex items-center">
                                    <data.icon className="h-4 w-4 mr-2" />
                                    {data.name}
                                  </div>
                                  <div className={`transform transition-transform ${expandedCategories[category] ? 'rotate-90' : ''}`}>
                                    ▶
                                  </div>
                                </button>
                                
                                {expandedCategories[category] && (
                                  <div className="space-y-3 ml-4">
                                    {Object.entries(data.subcategories).map(([subCategory, subData]) => (
                                      <div key={subCategory}>
                                        <label className="text-xs text-purple-400 mb-2 block font-medium">
                                          {subData.name}
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                          {subData.assets.map(asset => (
                                            <div
                                              key={asset.id}
                                              draggable
                                              onDragStart={(e) => handleAssetDragStart(e, asset)}
                                              onDragEnd={handleAssetDragEnd}
                                              className={`
                                                p-2 border rounded cursor-grab active:cursor-grabbing
                                                ${isDraggingAsset && draggedAsset?.id === asset.id 
                                                  ? 'border-purple-500 bg-purple-500/20' 
                                                  : 'border-purple-500/20 bg-black/20 hover:bg-purple-500/10'
                                                }
                                              `}
                                            >
                                              <div className={`w-full h-10 rounded mb-1 flex items-center justify-center ${
                                                category === 'terrain' ? 'bg-gradient-to-br from-green-600/20 to-blue-600/20' :
                                                category === 'structures' ? 'bg-gradient-to-br from-yellow-600/20 to-orange-600/20' :
                                                'bg-gradient-to-br from-red-600/20 to-purple-600/20'
                                              }`}>
                                                <data.icon className="h-5 w-5 text-purple-300" />
                                              </div>
                                              <div className="text-xs text-white font-medium truncate">{asset.name}</div>
                                              <div className="text-xs text-purple-300">{asset.size.width}x{asset.size.height}</div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* External Assets */}
                          {externalAssets.length > 0 && (
                            <div>
                              <label className="text-sm text-purple-300 mb-2 block flex items-center">
                                <Globe className="h-4 w-4 mr-2" />
                                External Assets
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                {externalAssets.map(asset => (
                                  <div
                                    key={asset.id}
                                    draggable
                                    onDragStart={(e) => handleAssetDragStart(e, asset)}
                                    onDragEnd={handleAssetDragEnd}
                                    className={`
                                      p-2 border rounded cursor-grab active:cursor-grabbing
                                      ${isDraggingAsset && draggedAsset?.id === asset.id 
                                        ? 'border-purple-500 bg-purple-500/20' 
                                        : 'border-purple-500/20 bg-black/20 hover:bg-purple-500/10'
                                      }
                                    `}
                                  >
                                    <div className="w-full h-12 bg-gradient-to-br from-green-600/20 to-blue-600/20 rounded mb-1 flex items-center justify-center">
                                      <Box className="h-6 w-6 text-green-300" />
                                    </div>
                                    <div className="text-xs text-white font-medium truncate">{asset.name}</div>
                                    <div className="text-xs text-green-300">{asset.fileType}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Map Controls */}
                      <Card className="bg-black/10 backdrop-blur-sm border-purple-500/10">
                        <CardHeader>
                          <CardTitle className="text-white text-sm">Map Controls</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* 3D World Sync Status */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm text-purple-300">3D World Sync</label>
                              <div className={`w-3 h-3 rounded-full ${is3DWorldConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            </div>
                            <div className="text-xs text-purple-400 mb-3">
                              {is3DWorldConnected ? 'Connected to 3D world' : 'Not connected to 3D world'}
                            </div>
                            
                            {is3DWorldConnected && (
                              <>
                                <div className="mb-3">
                                  <label className="text-xs text-purple-300 mb-1 block">Sync Mode</label>
                                  <Select value={syncMode} onValueChange={setSyncMode}>
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="bidirectional">Bidirectional</SelectItem>
                                      <SelectItem value="2d-to-3d">2D → 3D Only</SelectItem>
                                      <SelectItem value="3d-to-2d">3D → 2D Only</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => syncTo3DWorld('sync_all')}
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                  >
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Sync All to 3D
                                  </Button>
                                  
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      if (gameEngine && gameEngine.mapObjects) {
                                        gameEngine.mapObjects.forEach(mesh => {
                                          gameEngine.scene.remove(mesh)
                                        })
                                        gameEngine.mapObjects.clear()
                                        console.log('Cleared all 3D objects')
                                      }
                                    }}
                                    className="w-full"
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Clear 3D Objects
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>

                          <div>
                            <label className="text-sm text-purple-300">Zoom: {Math.round(mapScale * 100)}%</label>
                            <div className="flex space-x-2 mt-2">
                              <Button size="sm" onClick={() => setMapScale(Math.max(0.1, mapScale / 1.2))}>
                                <ZoomOut className="h-4 w-4" />
                              </Button>
                              <Button size="sm" onClick={() => setMapScale(1)}>
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                              <Button size="sm" onClick={() => setMapScale(Math.min(5, mapScale * 1.2))}>
                                <ZoomIn className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm text-purple-300">Grid Size: {20 * mapScale}px</label>
                            <Slider
                              value={[mapScale]}
                              onValueChange={([value]) => setMapScale(value)}
                              min={0.1}
                              max={5}
                              step={0.1}
                              className="mt-2"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Map Canvas */}
                    <div className="lg:col-span-2">
                      <Card className="bg-black/10 backdrop-blur-sm border-purple-500/10">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-white text-sm">2D Map Editor</CardTitle>
                            {isDraggingAsset && (
                              <div className="flex items-center space-x-2 text-purple-300 text-sm">
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                <span>Drag to place: {draggedAsset?.name}</span>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="relative">
                            <canvas
                              ref={canvasRef}
                              className="w-full h-96 border border-purple-500/20 rounded cursor-crosshair transition-all duration-200"
                              style={{ background: '#1a1a2e' }}
                              onClick={handleCanvasClick}
                              onMouseDown={handleCanvasMouseDown}
                              onMouseMove={handleCanvasMouseMove}
                              onMouseUp={handleCanvasMouseUp}
                              onMouseLeave={handleCanvasMouseUp}
                              onDragOver={handleCanvasDragOver}
                              onDrop={handleCanvasDrop}
                              onDragLeave={handleCanvasDragLeave}
                            />
                            {mapObjects.length === 0 && !isDraggingAsset && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center text-purple-300/50">
                                  <Map className="h-12 w-12 mx-auto mb-2" />
                                  <p className="text-sm">Drag assets from the palette to place them on the map</p>
                                  <p className="text-xs mt-1">Use tools to select, move, or delete objects</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Object List */}
                    <div>
                      <Card className="bg-black/10 backdrop-blur-sm border-purple-500/10">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-white text-sm">Map Objects</CardTitle>
                            <div className="text-xs text-purple-300">
                              {mapObjects.length} objects
                              {is3DWorldConnected && (
                                <span className="ml-2 text-green-400">
                                  • {gameEngine?.mapObjects?.size || 0} synced
                                </span>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 max-h-80 overflow-y-auto">
                            {mapObjects.map(obj => {
                              const isSynced = gameEngine?.mapObjects?.has(obj.id)
                              return (
                                <div 
                                  key={obj.id} 
                                  className={`flex items-center justify-between p-2 border rounded ${
                                    selectedObject?.id === obj.id 
                                      ? 'border-purple-500 bg-purple-500/20' 
                                      : 'border-purple-500/20 bg-black/20'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    <div className="flex flex-col">
                                      <div className="font-medium text-white text-sm">{obj.name}</div>
                                      <div className="text-xs text-purple-300">{obj.x}, {obj.y}</div>
                                      <div className="text-xs text-gray-400">{obj.category} • {obj.size.width}x{obj.size.height}</div>
                                    </div>
                                    {is3DWorldConnected && (
                                      <div className={`w-2 h-2 rounded-full ${isSynced ? 'bg-green-500' : 'bg-gray-500'}`} 
                                           title={isSynced ? 'Synced to 3D' : 'Not synced'} />
                                    )}
                                  </div>
                                  <div className="flex space-x-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setSelectedObject(obj)}
                                      className="text-blue-400 hover:bg-blue-500/20"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => {
                                        setMapObjects(prev => prev.filter(o => o.id !== obj.id))
                                        if (is3DWorldConnected && (syncMode === '2d-to-3d' || syncMode === 'bidirectional')) {
                                          syncTo3DWorld('remove', obj)
                                        }
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              )
                            })}
                            {mapObjects.length === 0 && (
                              <div className="text-center text-purple-300 py-4 text-sm">
                                No objects placed
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* 3D Assets Tab */}
                <TabsContent value="3d-assets" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(assetCategories).map(([category, data]) => (
                      <Card key={category} className="bg-black/10 backdrop-blur-sm border-purple-500/10">
                        <CardHeader>
                          <CardTitle className="text-white text-sm flex items-center">
                            <data.icon className="h-4 w-4 mr-2" />
                            {data.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {Object.entries(data.subcategories).map(([subCategory, subData]) => (
                              <div key={subCategory}>
                                <h4 className="text-xs text-purple-400 font-medium mb-2">{subData.name}</h4>
                                <div className="space-y-2">
                                  {subData.assets.map(asset => (
                                    <div key={asset.id} className="flex items-center justify-between p-2 border border-purple-500/20 rounded">
                                      <div>
                                        <div className="font-medium text-white text-sm">{asset.name}</div>
                                        <div className="text-xs text-purple-300">{asset.type} • {asset.size.width}x{asset.size.height}</div>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setSelectedAsset(asset)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* External Assets Tab */}
                <TabsContent value="external-assets" className="space-y-4 mt-4">
                  <Card className="bg-black/10 backdrop-blur-sm border-purple-500/10">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">Load External Asset</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-purple-300">Asset URL</label>
                          <Input
                            placeholder="https://example.com/model.glb"
                            value={assetUrl}
                            onChange={(e) => setAssetUrl(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm text-purple-300">File Type</label>
                          <Select value={assetType} onValueChange={setAssetType}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gltf">GLTF/GLB</SelectItem>
                              <SelectItem value="obj">OBJ</SelectItem>
                              <SelectItem value="fbx">FBX</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-purple-300">Asset Name</label>
                        <Input
                          placeholder="My Custom Asset"
                          value={assetName}
                          onChange={(e) => setAssetName(e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      {isLoadingAsset && (
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${loadingProgress}%` }}
                          />
                        </div>
                      )}
                      <Button 
                        onClick={handleExternalAssetLoad}
                        disabled={isLoadingAsset || !assetUrl.trim()}
                        className="w-full"
                      >
                        {isLoadingAsset ? `Loading... ${loadingProgress}%` : 'Load Asset'}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/10 backdrop-blur-sm border-purple-500/10">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">External Assets</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {externalAssets.map(asset => (
                          <div key={asset.id} className="flex items-center justify-between p-3 border border-purple-500/20 rounded">
                            <div>
                              <div className="font-medium text-white">{asset.name}</div>
                              <div className="text-sm text-purple-300">{asset.url}</div>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {externalAssets.length === 0 && (
                          <div className="text-center text-purple-300 py-4">
                            No external assets loaded
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Legacy Assets Tab */}
                <TabsContent value="legacy-assets" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Legacy Assets ({assets.player.length + assets.environment.length + assets.items.length + assets.others.length})</h3>
                    <div className="flex space-x-2">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'others')}
                        accept="image/*,audio/*,video/*,.json,.gltf,.glb,.obj,.fbx"
                      />
                      <label htmlFor="file-upload">
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Asset
                        </Button>
                      </label>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Legacy Asset
                      </Button>
                    </div>
                  </div>
                  
                  {/* Player Assets */}
                                     <Card className="bg-black/10 backdrop-blur-sm border-purple-500/10">
                     <CardHeader>
                       <div className="flex items-center justify-between">
                         <CardTitle className="text-white text-sm">Player Assets ({assets.player.length})</CardTitle>
                         <div className="flex space-x-2">
                           <input
                             type="file"
                             id="player-upload"
                             className="hidden"
                             onChange={(e) => handleFileUpload(e, 'player')}
                             accept="image/*,audio/*,video/*,.json"
                           />
                           <label htmlFor="player-upload">
                             <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                               <Upload className="h-4 w-4" />
                             </Button>
                           </label>
                         </div>
                       </div>
                     </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {assets.player.map((asset) => (
                          <div key={asset.id} className="flex items-center justify-between p-4 rounded bg-white/5">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
                                {asset.type === 'image' && <Image className="h-5 w-5 text-white" />}
                                {asset.type === 'audio' && <Music className="h-5 w-5 text-white" />}
                                {asset.type === 'video' && <Video className="h-5 w-5 text-white" />}
                                {asset.type === 'data' && <FileText className="h-5 w-5 text-white" />}
                              </div>
                              <div>
                                <p className="text-white font-medium">{asset.name}</p>
                                <p className="text-sm text-gray-400">{asset.category} • {asset.size}</p>
                                <p className="text-xs text-gray-500">Uploaded: {asset.uploadDate}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={asset.status === 'active' ? 'default' : 'secondary'}
                                className={asset.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}
                              >
                                {asset.status}
                              </Badge>
                              <Button size="sm" variant="ghost" className="text-blue-400 hover:bg-blue-500/20">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/20">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Environment Assets */}
                                     <Card className="bg-black/10 backdrop-blur-sm border-purple-500/10">
                     <CardHeader>
                       <div className="flex items-center justify-between">
                         <CardTitle className="text-white text-sm">Environment Assets ({assets.environment.length})</CardTitle>
                         <div className="flex space-x-2">
                           <input
                             type="file"
                             id="environment-upload"
                             className="hidden"
                             onChange={(e) => handleFileUpload(e, 'environment')}
                             accept="image/*,audio/*,video/*,.json"
                           />
                           <label htmlFor="environment-upload">
                             <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white cursor-pointer">
                               <Upload className="h-4 w-4" />
                             </Button>
                           </label>
                         </div>
                       </div>
                     </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {assets.environment.map((asset) => (
                          <div key={asset.id} className="flex items-center justify-between p-4 rounded bg-white/5">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-green-600 rounded flex items-center justify-center">
                                {asset.type === 'image' && <Image className="h-5 w-5 text-white" />}
                                {asset.type === 'audio' && <Music className="h-5 w-5 text-white" />}
                                {asset.type === 'video' && <Video className="h-5 w-5 text-white" />}
                                {asset.type === 'data' && <FileText className="h-5 w-5 text-white" />}
                              </div>
                              <div>
                                <p className="text-white font-medium">{asset.name}</p>
                                <p className="text-sm text-gray-400">{asset.category} • {asset.size}</p>
                                <p className="text-xs text-gray-500">Uploaded: {asset.uploadDate}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={asset.status === 'active' ? 'default' : 'secondary'}
                                className={asset.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}
                              >
                                {asset.status}
                              </Badge>
                              <Button size="sm" variant="ghost" className="text-blue-400 hover:bg-blue-500/20">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/20">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Game Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-white font-medium">Max Players</label>
                    <Input
                      type="number"
                      value={gameSettings.maxPlayers}
                      onChange={(e) => handleSettingChange('maxPlayers', parseInt(e.target.value))}
                      className="bg-black/20 border-purple-500/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white font-medium">Game Version</label>
                    <Input
                      value={gameSettings.version}
                      onChange={(e) => handleSettingChange('version', e.target.value)}
                      className="bg-black/20 border-purple-500/20 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-white font-medium">Server Maintenance</label>
                    <Button
                      variant={gameSettings.serverMaintenance ? 'default' : 'secondary'}
                      onClick={() => handleSettingChange('serverMaintenance', !gameSettings.serverMaintenance)}
                      className={gameSettings.serverMaintenance ? 'bg-red-600' : 'bg-green-600'}
                    >
                      {gameSettings.serverMaintenance ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-white font-medium">Auto Save</label>
                    <Button
                      variant={gameSettings.autoSave ? 'default' : 'secondary'}
                      onClick={() => handleSettingChange('autoSave', !gameSettings.autoSave)}
                      className={gameSettings.autoSave ? 'bg-green-600' : 'bg-gray-600'}
                    >
                      {gameSettings.autoSave ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-white font-medium">Debug Mode</label>
                    <Button
                      variant={gameSettings.debugMode ? 'default' : 'secondary'}
                      onClick={() => handleSettingChange('debugMode', !gameSettings.debugMode)}
                      className={gameSettings.debugMode ? 'bg-yellow-600' : 'bg-gray-600'}
                    >
                      {gameSettings.debugMode ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" className="border-purple-500/20 text-white">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset to Default
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Access Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded bg-white/5">
                  <div>
                    <p className="text-white font-medium">Admin Panel Access</p>
                    <p className="text-sm text-gray-400">Control who can access admin features</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Restricted
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded bg-white/5">
                  <div>
                    <p className="text-white font-medium">API Rate Limiting</p>
                    <p className="text-sm text-gray-400">Prevent abuse of game APIs</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded bg-white/5">
                  <div>
                    <p className="text-white font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-400">Enhanced security for admin accounts</p>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    Optional
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Security Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 rounded bg-white/5">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <div>
                      <p className="text-sm text-white">Failed login attempt from IP: 192.168.1.100</p>
                      <p className="text-xs text-gray-400">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded bg-white/5">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <div>
                      <p className="text-sm text-white">Admin login successful: admin_user</p>
                      <p className="text-xs text-gray-400">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded bg-white/5">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-sm text-white">Security scan completed - No threats detected</p>
                      <p className="text-xs text-gray-400">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">User Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white">Daily Active Users</span>
                    <span className="text-purple-400 font-bold">{analytics.dailyLogins}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Weekly Growth</span>
                    <span className="text-green-400 font-bold">{analytics.weeklyGrowth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Average Session</span>
                    <span className="text-blue-400 font-bold">45m</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Retention Rate</span>
                    <span className="text-yellow-400 font-bold">78%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white">Server Response Time</span>
                    <span className="text-green-400 font-bold">45ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">CPU Usage</span>
                    <span className="text-yellow-400 font-bold">67%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Memory Usage</span>
                    <span className="text-blue-400 font-bold">2.1GB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Network Traffic</span>
                    <span className="text-purple-400 font-bold">1.2TB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminPanel 