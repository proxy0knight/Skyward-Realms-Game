import * as THREE from 'three'

class Enhanced3DAudio {
  constructor(camera, listener) {
    this.camera = camera
    this.listener = listener || new THREE.AudioListener()
    
    // Audio manager
    this.audioLoader = new THREE.AudioLoader()
    this.positionalAudio = new Map()
    this.globalAudio = new Map()
    
    // Audio categories
    this.ambientSounds = []
    this.musicTracks = []
    this.effectSounds = []
    
    // Current state
    this.currentMusicTrack = null
    this.musicVolume = 0.7
    this.sfxVolume = 0.8
    this.ambientVolume = 0.5
    
    // Environment audio
    this.environmentalAudio = {
      wind: null,
      water: null,
      forest: null,
      magic: null
    }
    
    // Dynamic audio context
    this.isEnabled = true
    this.fadeTransitions = new Map()
    
    console.log('Enhanced3DAudio: Initialized')
  }

  async init() {
    console.log('Enhanced3DAudio: Setting up 3D audio system...')
    
    // Add listener to camera
    if (this.camera && !this.camera.children.includes(this.listener)) {
      this.camera.add(this.listener)
    }
    
    // Initialize environmental sounds
    await this.initEnvironmentalAudio()
    
    // Initialize music system
    await this.initMusicSystem()
    
    console.log('Enhanced3DAudio: 3D audio system ready!')
  }

  async initEnvironmentalAudio() {
    try {
      // Wind ambience
      this.environmentalAudio.wind = await this.createPositionalAudio('/assets/audio/wind.mp3', {
        volume: 0.3,
        loop: true,
        refDistance: 20,
        rolloffFactor: 0.5
      })
      
      // Water sounds
      this.environmentalAudio.water = await this.createPositionalAudio('/assets/audio/water.mp3', {
        volume: 0.4,
        loop: true,
        refDistance: 15,
        rolloffFactor: 1.0
      })
      
      // Forest ambience
      this.environmentalAudio.forest = await this.createPositionalAudio('/assets/audio/forest.mp3', {
        volume: 0.35,
        loop: true,
        refDistance: 25,
        rolloffFactor: 0.3
      })
      
      // Magical ambience
      this.environmentalAudio.magic = await this.createPositionalAudio('/assets/audio/magic_ambient.mp3', {
        volume: 0.2,
        loop: true,
        refDistance: 10,
        rolloffFactor: 2.0
      })
      
      console.log('Enhanced3DAudio: Environmental audio loaded')
    } catch (error) {
      console.warn('Enhanced3DAudio: Could not load environmental audio, using procedural sounds')
      this.createProceduralEnvironmentalAudio()
    }
  }

  async initMusicSystem() {
    const musicTracks = [
      { name: 'exploration', file: '/assets/audio/music/exploration.mp3', mood: 'peaceful' },
      { name: 'combat', file: '/assets/audio/music/combat.mp3', mood: 'intense' },
      { name: 'magic', file: '/assets/audio/music/magic.mp3', mood: 'mystical' },
      { name: 'night', file: '/assets/audio/music/night.mp3', mood: 'calm' }
    ]
    
    for (const track of musicTracks) {
      try {
        const audio = await this.createGlobalAudio(track.file, {
          volume: this.musicVolume,
          loop: true
        })
        
        this.musicTracks.push({
          ...track,
          audio: audio,
          isPlaying: false
        })
      } catch (error) {
        console.warn(`Enhanced3DAudio: Could not load music track ${track.name}`)
      }
    }
    
    // Start with exploration music
    this.playMusic('exploration')
  }

  createProceduralEnvironmentalAudio() {
    // Create procedural audio using Web Audio API
    const audioContext = THREE.AudioContext.getContext()
    
    // Wind sound using white noise and filters
    this.createProceduralWind(audioContext)
    
    // Water sound using filtered noise
    this.createProceduralWater(audioContext)
    
    // Forest ambience using multiple oscillators
    this.createProceduralForest(audioContext)
    
    console.log('Enhanced3DAudio: Procedural environmental audio created')
  }

  createProceduralWind(audioContext) {
    const bufferSize = audioContext.sampleRate * 2
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
    const data = buffer.getChannelData(0)
    
    // Generate wind-like noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.1
    }
    
    const source = audioContext.createBufferSource()
    source.buffer = buffer
    source.loop = true
    
    // Filter for wind-like frequency response
    const filter = audioContext.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 400
    filter.Q.value = 1
    
    const gainNode = audioContext.createGain()
    gainNode.gain.value = 0.3
    
    source.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    source.start()
    
    return { source, gainNode, filter }
  }

  createProceduralWater(audioContext) {
    // Similar to wind but with different filter settings for water
    const bufferSize = audioContext.sampleRate * 3
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
    const data = buffer.getChannelData(0)
    
    // Generate water-like noise with variance
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin(i * 0.001) * 0.15
    }
    
    const source = audioContext.createBufferSource()
    source.buffer = buffer
    source.loop = true
    
    const filter = audioContext.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 800
    filter.Q.value = 2
    
    const gainNode = audioContext.createGain()
    gainNode.gain.value = 0.4
    
    source.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    source.start()
    
    return { source, gainNode, filter }
  }

  createProceduralForest(audioContext) {
    // Create multiple oscillators for bird sounds and rustling
    const oscillators = []
    const masterGain = audioContext.createGain()
    masterGain.gain.value = 0.2
    
    // Bird-like sounds
    for (let i = 0; i < 3; i++) {
      const osc = audioContext.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = 800 + Math.random() * 1200
      
      const gain = audioContext.createGain()
      gain.gain.value = 0
      
      osc.connect(gain)
      gain.connect(masterGain)
      
      // Random chirping pattern
      const chirpInterval = setInterval(() => {
        if (Math.random() < 0.3) {
          gain.gain.setValueAtTime(0.1, audioContext.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
          
          osc.frequency.setValueAtTime(osc.frequency.value, audioContext.currentTime)
          osc.frequency.exponentialRampToValueAtTime(
            osc.frequency.value * (0.8 + Math.random() * 0.4),
            audioContext.currentTime + 0.3
          )
        }
      }, 2000 + Math.random() * 8000)
      
      osc.start()
      oscillators.push({ osc, gain, interval: chirpInterval })
    }
    
    masterGain.connect(audioContext.destination)
    
    return { oscillators, masterGain }
  }

  async createPositionalAudio(audioPath, options = {}) {
    const defaults = {
      volume: 1.0,
      loop: false,
      refDistance: 1,
      rolloffFactor: 1,
      position: new THREE.Vector3(0, 0, 0)
    }
    
    const settings = { ...defaults, ...options }
    
    try {
      const buffer = await new Promise((resolve, reject) => {
        this.audioLoader.load(audioPath, resolve, undefined, reject)
      })
      
      const positionalAudio = new THREE.PositionalAudio(this.listener)
      positionalAudio.setBuffer(buffer)
      positionalAudio.setLoop(settings.loop)
      positionalAudio.setVolume(settings.volume)
      positionalAudio.setRefDistance(settings.refDistance)
      positionalAudio.setRolloffFactor(settings.rolloffFactor)
      
      return positionalAudio
    } catch (error) {
      console.warn(`Enhanced3DAudio: Could not load ${audioPath}`)
      return null
    }
  }

  async createGlobalAudio(audioPath, options = {}) {
    const defaults = {
      volume: 1.0,
      loop: false
    }
    
    const settings = { ...defaults, ...options }
    
    try {
      const buffer = await new Promise((resolve, reject) => {
        this.audioLoader.load(audioPath, resolve, undefined, reject)
      })
      
      const audio = new THREE.Audio(this.listener)
      audio.setBuffer(buffer)
      audio.setLoop(settings.loop)
      audio.setVolume(settings.volume)
      
      return audio
    } catch (error) {
      console.warn(`Enhanced3DAudio: Could not load ${audioPath}`)
      return null
    }
  }

  // Music control methods
  playMusic(trackName, fadeTime = 2000) {
    const track = this.musicTracks.find(t => t.name === trackName)
    if (!track || !track.audio) return
    
    // Fade out current track
    if (this.currentMusicTrack && this.currentMusicTrack.audio) {
      this.fadeOut(this.currentMusicTrack.audio, fadeTime)
    }
    
    // Fade in new track
    this.currentMusicTrack = track
    track.audio.setVolume(0)
    track.audio.play()
    track.isPlaying = true
    
    this.fadeIn(track.audio, this.musicVolume, fadeTime)
    
    console.log(`Enhanced3DAudio: Playing music track: ${trackName}`)
  }

  stopMusic(fadeTime = 1000) {
    if (this.currentMusicTrack && this.currentMusicTrack.audio) {
      this.fadeOut(this.currentMusicTrack.audio, fadeTime, () => {
        this.currentMusicTrack.audio.stop()
        this.currentMusicTrack.isPlaying = false
        this.currentMusicTrack = null
      })
    }
  }

  setMusicBasedOnContext(context) {
    const musicMap = {
      exploration: 'exploration',
      combat: 'combat',
      magic: 'magic',
      night: 'night',
      peaceful: 'exploration'
    }
    
    const trackName = musicMap[context] || 'exploration'
    if (!this.currentMusicTrack || this.currentMusicTrack.name !== trackName) {
      this.playMusic(trackName)
    }
  }

  // Environmental audio positioning
  updateEnvironmentalAudio(playerPosition, worldData) {
    // Position wind audio
    if (this.environmentalAudio.wind) {
      // Wind is global but varies with elevation
      const windIntensity = Math.min(1, playerPosition.y / 50)
      this.setAudioVolume(this.environmentalAudio.wind, this.ambientVolume * windIntensity)
    }
    
    // Position water audio near water bodies
    if (this.environmentalAudio.water && worldData.waterBodies) {
      worldData.waterBodies.forEach((water, index) => {
        const waterAudio = this.environmentalAudio.water
        if (waterAudio) {
          const distance = playerPosition.distanceTo(water.position)
          if (distance < 30) {
            if (!water.audioObject) {
              water.audioObject = waterAudio.clone()
              water.audioObject.position.copy(water.position)
              // Add to scene if needed
            }
          }
        }
      })
    }
    
    // Position magical audio near magical structures
    if (this.environmentalAudio.magic && worldData.magicalStructures) {
      worldData.magicalStructures.forEach(structure => {
        const distance = playerPosition.distanceTo(structure.position)
        if (distance < 20) {
          // Increase magical ambience near magical structures
          const intensity = Math.max(0, 1 - distance / 20)
          this.setAudioVolume(this.environmentalAudio.magic, this.ambientVolume * intensity)
        }
      })
    }
  }

  // Spell and combat audio
  async playSpellSound(spellType, position) {
    const spellSounds = {
      fire: '/assets/audio/spells/fireball.mp3',
      water: '/assets/audio/spells/waterblast.mp3',
      earth: '/assets/audio/spells/earthstrike.mp3',
      air: '/assets/audio/spells/windgust.mp3',
      primary: '/assets/audio/spells/primary_cast.mp3',
      secondary: '/assets/audio/spells/secondary_cast.mp3',
      ultimate: '/assets/audio/spells/ultimate_cast.mp3'
    }
    
    const soundPath = spellSounds[spellType]
    if (!soundPath) return
    
    try {
      const spellAudio = await this.createPositionalAudio(soundPath, {
        volume: this.sfxVolume,
        refDistance: 10,
        rolloffFactor: 2
      })
      
      if (spellAudio && position) {
        spellAudio.position.copy(position)
        spellAudio.play()
        
        // Auto-remove after playing
        setTimeout(() => {
          if (spellAudio.isPlaying) {
            spellAudio.stop()
          }
        }, 5000)
      }
    } catch (error) {
      // Fallback to procedural spell sound
      this.createProceduralSpellSound(spellType, position)
    }
  }

  createProceduralSpellSound(spellType, position) {
    const audioContext = THREE.AudioContext.getContext()
    
    // Create different procedural sounds based on spell type
    switch (spellType) {
      case 'fire':
      case 'primary':
        this.createFireSpellSound(audioContext)
        break
      case 'water':
      case 'secondary':
        this.createWaterSpellSound(audioContext)
        break
      case 'earth':
        this.createEarthSpellSound(audioContext)
        break
      case 'air':
        this.createAirSpellSound(audioContext)
        break
      case 'ultimate':
        this.createUltimateSpellSound(audioContext)
        break
    }
  }

  createFireSpellSound(audioContext) {
    // Fire crackling sound using noise and filters
    const duration = 1.5
    const source = audioContext.createBufferSource()
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate)
    const data = buffer.getChannelData(0)
    
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioContext.sampleRate * 0.3))
    }
    
    source.buffer = buffer
    
    const filter = audioContext.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 200
    
    const gain = audioContext.createGain()
    gain.gain.setValueAtTime(this.sfxVolume, audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
    
    source.connect(filter)
    filter.connect(gain)
    gain.connect(audioContext.destination)
    
    source.start()
  }

  createWaterSpellSound(audioContext) {
    // Water splash using filtered noise
    const duration = 1.2
    const source = audioContext.createBufferSource()
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate)
    const data = buffer.getChannelData(0)
    
    for (let i = 0; i < data.length; i++) {
      const t = i / audioContext.sampleRate
      data[i] = (Math.random() * 2 - 1) * Math.sin(t * 400) * Math.exp(-t * 2)
    }
    
    source.buffer = buffer
    
    const filter = audioContext.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 600
    filter.Q.value = 5
    
    const gain = audioContext.createGain()
    gain.gain.setValueAtTime(this.sfxVolume, audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
    
    source.connect(filter)
    filter.connect(gain)
    gain.connect(audioContext.destination)
    
    source.start()
  }

  createEarthSpellSound(audioContext) {
    // Earth rumble using low frequency oscillator
    const duration = 2.0
    const osc = audioContext.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(60, audioContext.currentTime)
    osc.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + duration)
    
    const gain = audioContext.createGain()
    gain.gain.setValueAtTime(this.sfxVolume, audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
    
    osc.connect(gain)
    gain.connect(audioContext.destination)
    
    osc.start()
    osc.stop(audioContext.currentTime + duration)
  }

  createAirSpellSound(audioContext) {
    // Wind whoosh using filtered white noise
    const duration = 1.0
    const source = audioContext.createBufferSource()
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate)
    const data = buffer.getChannelData(0)
    
    for (let i = 0; i < data.length; i++) {
      const t = i / audioContext.sampleRate
      data[i] = (Math.random() * 2 - 1) * (1 - t) // Fade out
    }
    
    source.buffer = buffer
    
    const filter = audioContext.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.setValueAtTime(800, audioContext.currentTime)
    filter.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + duration)
    
    const gain = audioContext.createGain()
    gain.gain.setValueAtTime(this.sfxVolume, audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
    
    source.connect(filter)
    filter.connect(gain)
    gain.connect(audioContext.destination)
    
    source.start()
  }

  createUltimateSpellSound(audioContext) {
    // Epic magical sound combining multiple elements
    this.createFireSpellSound(audioContext)
    setTimeout(() => this.createWaterSpellSound(audioContext), 200)
    setTimeout(() => this.createEarthSpellSound(audioContext), 400)
    setTimeout(() => this.createAirSpellSound(audioContext), 600)
  }

  // Utility methods
  fadeIn(audio, targetVolume, duration) {
    if (!audio) return
    
    const steps = 20
    const stepDuration = duration / steps
    const volumeStep = targetVolume / steps
    let currentStep = 0
    
    const fadeInterval = setInterval(() => {
      currentStep++
      const newVolume = volumeStep * currentStep
      audio.setVolume(newVolume)
      
      if (currentStep >= steps) {
        clearInterval(fadeInterval)
        audio.setVolume(targetVolume)
      }
    }, stepDuration)
    
    this.fadeTransitions.set(audio, fadeInterval)
  }

  fadeOut(audio, duration, callback) {
    if (!audio) return
    
    const startVolume = audio.getVolume()
    const steps = 20
    const stepDuration = duration / steps
    const volumeStep = startVolume / steps
    let currentStep = 0
    
    const fadeInterval = setInterval(() => {
      currentStep++
      const newVolume = startVolume - (volumeStep * currentStep)
      audio.setVolume(Math.max(0, newVolume))
      
      if (currentStep >= steps) {
        clearInterval(fadeInterval)
        audio.setVolume(0)
        if (callback) callback()
      }
    }, stepDuration)
    
    this.fadeTransitions.set(audio, fadeInterval)
  }

  setAudioVolume(audio, volume) {
    if (audio && audio.setVolume) {
      audio.setVolume(volume)
    } else if (audio && audio.gainNode) {
      audio.gainNode.gain.value = volume
    }
  }

  // Volume controls
  setMasterVolume(volume) {
    this.listener.setMasterVolume(volume)
  }

  setMusicVolume(volume) {
    this.musicVolume = volume
    if (this.currentMusicTrack && this.currentMusicTrack.audio) {
      this.currentMusicTrack.audio.setVolume(volume)
    }
  }

  setSFXVolume(volume) {
    this.sfxVolume = volume
  }

  setAmbientVolume(volume) {
    this.ambientVolume = volume
    Object.values(this.environmentalAudio).forEach(audio => {
      if (audio) {
        this.setAudioVolume(audio, volume)
      }
    })
  }

  // Cleanup
  dispose() {
    // Stop all audio
    this.musicTracks.forEach(track => {
      if (track.audio && track.isPlaying) {
        track.audio.stop()
      }
    })
    
    // Clear transitions
    this.fadeTransitions.forEach((interval, audio) => {
      clearInterval(interval)
    })
    this.fadeTransitions.clear()
    
    // Dispose environmental audio
    Object.values(this.environmentalAudio).forEach(audio => {
      if (audio && audio.disconnect) {
        audio.disconnect()
      }
    })
    
    console.log('Enhanced3DAudio: Disposed')
  }
}

export default Enhanced3DAudio