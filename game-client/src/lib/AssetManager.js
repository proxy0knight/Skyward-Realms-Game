import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

export class AssetManager {
  constructor() {
    this.loadedAssets = new Map()
    this.loadingPromises = new Map()
    this.textureLoader = new THREE.TextureLoader()
    this.gltfLoader = new GLTFLoader()
    this.objLoader = new OBJLoader()
    this.fbxLoader = new FBXLoader()
    
    // Setup DRACO compression
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    this.gltfLoader.setDRACOLoader(dracoLoader)
    
    // Asset categories
    this.categories = {
      characters: 'characters',
      environments: 'environments',
      props: 'props',
      weapons: 'weapons',
      effects: 'effects'
    }
  }

  // Load external 3D model from URL
  async loadExternalModel(url, type = 'gltf', options = {}) {
    const assetId = options.id || this.generateAssetId(url)
    
    // Check if already loaded
    if (this.loadedAssets.has(assetId)) {
      return this.loadedAssets.get(assetId)
    }
    
    // Check if already loading
    if (this.loadingPromises.has(assetId)) {
      return this.loadingPromises.get(assetId)
    }

    const loadPromise = this.loadModelByType(url, type, options)
    this.loadingPromises.set(assetId, loadPromise)

    try {
      const asset = await loadPromise
      this.loadedAssets.set(assetId, asset)
      this.loadingPromises.delete(assetId)
      return asset
    } catch (error) {
      this.loadingPromises.delete(assetId)
      console.error(`Failed to load external model: ${url}`, error)
      throw error
    }
  }

  // Load model based on file type
  async loadModelByType(url, type, options) {
    switch (type.toLowerCase()) {
      case 'gltf':
      case 'glb':
        return this.loadGLTF(url, options)
      case 'obj':
        return this.loadOBJ(url, options)
      case 'fbx':
        return this.loadFBX(url, options)
      default:
        throw new Error(`Unsupported model type: ${type}`)
    }
  }

  // Load GLTF/GLB model
  async loadGLTF(url, options) {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          const model = this.processLoadedModel(gltf.scene, options)
          resolve({
            type: 'gltf',
            model: model,
            animations: gltf.animations || [],
            original: gltf
          })
        },
        (progress) => {
          if (options.onProgress) {
            options.onProgress(progress)
          }
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  // Load OBJ model
  async loadOBJ(url, options) {
    return new Promise((resolve, reject) => {
      this.objLoader.load(
        url,
        (object) => {
          const model = this.processLoadedModel(object, options)
          resolve({
            type: 'obj',
            model: model,
            animations: [],
            original: object
          })
        },
        (progress) => {
          if (options.onProgress) {
            options.onProgress(progress)
          }
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  // Load FBX model
  async loadFBX(url, options) {
    return new Promise((resolve, reject) => {
      this.fbxLoader.load(
        url,
        (object) => {
          const model = this.processLoadedModel(object, options)
          resolve({
            type: 'fbx',
            model: model,
            animations: object.animations || [],
            original: object
          })
        },
        (progress) => {
          if (options.onProgress) {
            options.onProgress(progress)
          }
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  // Process loaded model with options
  processLoadedModel(model, options) {
    const processedModel = model.clone()
    
    // Apply transformations
    if (options.scale) {
      processedModel.scale.setScalar(options.scale)
    }
    
    if (options.position) {
      processedModel.position.copy(options.position)
    }
    
    if (options.rotation) {
      processedModel.rotation.copy(options.rotation)
    }
    
    // Apply materials
    if (options.material) {
      this.applyMaterialToModel(processedModel, options.material)
    }
    
    // Apply shadows
    if (options.castShadow !== undefined) {
      processedModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = options.castShadow
        }
      })
    }
    
    if (options.receiveShadow !== undefined) {
      processedModel.traverse((child) => {
        if (child.isMesh) {
          child.receiveShadow = options.receiveShadow
        }
      })
    }
    
    return processedModel
  }

  // Apply material to model
  applyMaterialToModel(model, material) {
    model.traverse((child) => {
      if (child.isMesh) {
        child.material = material
      }
    })
  }

  // Load texture from URL
  async loadTexture(url, options = {}) {
    const textureId = options.id || this.generateAssetId(url)
    
    if (this.loadedAssets.has(textureId)) {
      return this.loadedAssets.get(textureId)
    }

    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          // Apply texture options
          if (options.wrapS) texture.wrapS = options.wrapS
          if (options.wrapT) texture.wrapT = options.wrapT
          if (options.repeat) texture.repeat.copy(options.repeat)
          if (options.offset) texture.offset.copy(options.offset)
          
          this.loadedAssets.set(textureId, texture)
          resolve(texture)
        },
        undefined,
        reject
      )
    })
  }

  // Load multiple assets
  async loadAssets(assetList) {
    const promises = assetList.map(asset => {
      if (asset.type === 'texture') {
        return this.loadTexture(asset.url, asset.options)
      } else {
        return this.loadExternalModel(asset.url, asset.type, asset.options)
      }
    })
    
    return Promise.all(promises)
  }

  // Get loaded asset
  getAsset(assetId) {
    return this.loadedAssets.get(assetId)
  }

  // Check if asset is loaded
  isAssetLoaded(assetId) {
    return this.loadedAssets.has(assetId)
  }

  // Create instance of loaded model
  createModelInstance(assetId, options = {}) {
    const asset = this.getAsset(assetId)
    if (!asset) {
      throw new Error(`Asset not loaded: ${assetId}`)
    }
    
    const instance = asset.model.clone()
    
    // Apply instance-specific options
    if (options.position) {
      instance.position.copy(options.position)
    }
    
    if (options.rotation) {
      instance.rotation.copy(options.rotation)
    }
    
    if (options.scale) {
      instance.scale.setScalar(options.scale)
    }
    
    return instance
  }

  // Predefined external asset sources
  getExternalAssetSources() {
    return {
      // Free 3D model sources
      sketchfab: {
        baseUrl: 'https://sketchfab.com/3d-models/',
        formats: ['gltf', 'glb'],
        description: 'High-quality 3D models (some free)'
      },
      free3d: {
        baseUrl: 'https://free3d.com/',
        formats: ['obj', 'fbx', '3ds'],
        description: 'Free 3D models'
      },
      turbosquid: {
        baseUrl: 'https://www.turbosquid.com/',
        formats: ['obj', 'fbx', '3ds', 'max'],
        description: 'Professional 3D models (paid)'
      },
      cgtrader: {
        baseUrl: 'https://www.cgtrader.com/',
        formats: ['obj', 'fbx', '3ds', 'blend'],
        description: '3D models marketplace'
      },
      // Texture sources
      textures: {
        ambientCG: 'https://ambientcg.com/',
        polyhaven: 'https://polyhaven.com/',
        texturehaven: 'https://texturehaven.com/'
      }
    }
  }

  // Example asset configurations
  getExampleAssets() {
    return [
      {
        id: 'fantasy_sword',
        name: 'Fantasy Sword',
        url: 'https://example.com/models/fantasy_sword.glb',
        type: 'glb',
        category: 'weapons',
        options: {
          scale: 1.0,
          castShadow: true,
          receiveShadow: true
        }
      },
      {
        id: 'magic_crystal',
        name: 'Magic Crystal',
        url: 'https://example.com/models/magic_crystal.obj',
        type: 'obj',
        category: 'props',
        options: {
          scale: 0.5,
          material: new THREE.MeshPhongMaterial({ 
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8
          })
        }
      },
      {
        id: 'dragon_character',
        name: 'Dragon Character',
        url: 'https://example.com/models/dragon.fbx',
        type: 'fbx',
        category: 'characters',
        options: {
          scale: 2.0,
          castShadow: true,
          receiveShadow: true
        }
      }
    ]
  }

  // Generate unique asset ID
  generateAssetId(url) {
    return `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Clear loaded assets
  clearAssets() {
    this.loadedAssets.forEach(asset => {
      if (asset.dispose) {
        asset.dispose()
      }
    })
    this.loadedAssets.clear()
    this.loadingPromises.clear()
  }

  // Get loading progress
  getLoadingProgress() {
    const total = this.loadedAssets.size + this.loadingPromises.size
    const loaded = this.loadedAssets.size
    return total > 0 ? (loaded / total) * 100 : 100
  }

  // Dispose of asset manager
  dispose() {
    this.clearAssets()
    this.textureLoader.dispose()
  }
} 