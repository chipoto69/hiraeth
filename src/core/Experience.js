import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

import { SceneManager } from './SceneManager.js';
import { CameraController } from './CameraController.js';
import { MovementController } from './MovementController.js';
import { AudioManager } from './AudioManager.js';
import { BreathMechanic } from './BreathMechanic.js';
import { StageManager } from '../stages/StageManager.js';
import { VignetteShader } from '../shaders/VignetteShader.js';
import { FilmGrainShader } from '../shaders/FilmGrainShader.js';
import { Debug } from './Debug.js';

export class Experience {
  constructor(container) {
    this.container = container;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.time = 0;
    this.isStarted = false;
    this.isLoaded = false;
    
    this.init();
  }
  
  async init() {
    this.setupRenderer();
    this.setupScene();
    this.setupCamera();
    this.setupPostProcessing();
    this.setupControllers();
    this.setupEventListeners();
    
    await this.load();
    
    this.animate();
  }
  
  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x1a1a1a, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    this.container.appendChild(this.renderer.domElement);
  }
  
  setupScene() {
    this.sceneManager = new SceneManager();
    this.scene = this.sceneManager.scene;
  }
  
  setupCamera() {
    this.cameraController = new CameraController(this.width / this.height);
    this.camera = this.cameraController.camera;
  }
  
  setupPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.width, this.height),
      0.3,
      0.4,
      0.85
    );
    this.composer.addPass(this.bloomPass);
    
    this.vignettePass = new ShaderPass(VignetteShader);
    this.vignettePass.uniforms.darkness.value = 1.2;
    this.vignettePass.uniforms.offset.value = 1.0;
    this.composer.addPass(this.vignettePass);
    
    this.filmGrainPass = new ShaderPass(FilmGrainShader);
    this.filmGrainPass.uniforms.intensity.value = 0.08;
    this.composer.addPass(this.filmGrainPass);
  }
  
  setupControllers() {
    this.audioManager = new AudioManager();
    
    this.movementController = new MovementController(this.cameraController, {
      baseSpeed: 0.015,
      resistanceMultiplier: 0.2,
      smoothing: 0.08
    });
    
    this.breathMechanic = new BreathMechanic({
      onBreathStart: () => this.onBreathStart(),
      onBreathComplete: () => this.onBreathComplete(),
      onBreathProgress: (progress) => this.onBreathProgress(progress)
    });
    
    this.stageManager = new StageManager(this);
    
    this.debug = new Debug(this);
    this.isMuted = false;
  }
  
  setupEventListeners() {
    window.addEventListener('resize', () => this.onResize());
    
    const startPrompt = document.getElementById('start-prompt');
    const startHandler = () => {
      if (!this.isStarted && this.isLoaded) {
        this.start();
        document.removeEventListener('click', startHandler);
      }
    };
    document.addEventListener('click', startHandler);
  }
  
  async load() {
    const loadingBarFill = document.querySelector('.loading-bar-fill');
    
    await this.stageManager.preload((progress) => {
      if (loadingBarFill) {
        loadingBarFill.style.width = `${progress * 100}%`;
      }
    });
    
    await this.audioManager.load();
    
    if (loadingBarFill) {
      loadingBarFill.style.width = '100%';
    }
    
    this.isLoaded = true;
    this.showStartPrompt();
  }
  
  showStartPrompt() {
    const loadingScreen = document.getElementById('loading-screen');
    const startPrompt = document.getElementById('start-prompt');
    
    loadingScreen.classList.add('fade-out');
    
    setTimeout(() => {
      startPrompt.classList.add('visible');
    }, 1500);
  }
  
  start() {
    this.isStarted = true;
    
    const startPrompt = document.getElementById('start-prompt');
    startPrompt.classList.remove('visible');
    
    const instructions = document.getElementById('instructions');
    instructions.classList.add('visible');
    
    setTimeout(() => {
      instructions.classList.remove('visible');
    }, 4000);
    
    this.audioManager.startAmbient();
    this.stageManager.start();
    this.movementController.enable();
  }
  
  onBreathStart() {
    this.movementController.setResistance(0);
    this.audioManager.fadeAmbient(0.3);
  }
  
  onBreathComplete() {
    this.movementController.clearResistance();
    this.audioManager.fadeAmbient(1.0);
    this.stageManager.onBreathComplete();
  }
  
  onBreathProgress(progress) {
    this.vignettePass.uniforms.darkness.value = 1.2 - (progress * 0.8);
    this.bloomPass.strength = 0.3 + (progress * 0.5);
  }
  
  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(this.width, this.height);
    this.composer.setSize(this.width, this.height);
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    const delta = Math.min(0.05, this.time ? (performance.now() * 0.001) - this.time : 0.016);
    this.time = performance.now() * 0.001;
    
    if (this.isStarted) {
      this.movementController.update(delta);
      this.stageManager.update(delta, this.cameraController.position.z);
      this.breathMechanic.update(delta);
    }
    
    this.sceneManager.update(delta, this.time);
    
    this.filmGrainPass.uniforms.time.value = this.time;
    
    this.debug.update();
    
    this.composer.render();
  }
  
  getProgress() {
    return this.stageManager.getProgress();
  }
  
  setEmotionalWeight(weight) {
    this.movementController.setResistance(weight);
    
    if (weight > 0.7) {
      this.breathMechanic.enable();
    } else {
      this.breathMechanic.disable();
    }
  }
}
