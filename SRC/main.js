import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Game variables
let bird;
let pipes = [];
let score = 0;
let gameOver = false;
let birdVelocity = 0;
const gravity = 0.5;
const jumpForce = -10;
const pipeSpeed = 3;
const pipeSpawnInterval = 1500;
let lastPipeSpawn = 0;

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load textures
const textureLoader = new THREE.TextureLoader();
const birdTexture = textureLoader.load('src/bird.svg');
const backgroundTexture = textureLoader.load('src/background.svg');
const pipeTexture = textureLoader.load('src/pipe.svg');

// Create background
const backgroundGeometry = new THREE.PlaneGeometry(800, 600);
const backgroundMaterial = new THREE.MeshBasicMaterial({ map: backgroundTexture });
const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
scene.add(background);

// Create bird
const birdGeometry = new THREE.PlaneGeometry(34, 24);
const birdMaterial = new THREE.MeshBasicMaterial({ map: birdTexture });
bird = new THREE.Mesh(birdGeometry, birdMaterial);
bird.position.set(-200, 0, 0);
scene.add(bird);

// Camera position
camera.position.z = 500;

// Game loop
function animate() {
  requestAnimationFrame(animate);

  if (!gameOver) {
    // Bird physics
    birdVelocity += gravity;
    bird.position.y -= birdVelocity;

    // Bird rotation based on velocity
    bird.rotation.z = birdVelocity * 0.02;

    // Spawn pipes
    const currentTime = Date.now();
    if (currentTime - lastPipeSpawn > pipeSpawnInterval) {
      spawnPipe();
      lastPipeSpawn = currentTime;
    }

    // Move pipes
    pipes.forEach((pipe, index) => {
      pipe.position.x -= pipeSpeed;
      
      // Remove pipes that are off screen
      if (pipe.position.x < -400) {
        scene.remove(pipe);
        pipes.splice(index, 1);
        score++;
      }

      // Collision detection
      if (checkCollision(bird, pipe)) {
        gameOver = true;
      }
    });

    // Check if bird hits the ground or ceiling
    if (bird.position.y < -300 || bird.position.y > 300) {
      gameOver = true;
    }
  }

  renderer.render(scene, camera);
}

// Spawn pipe
function spawnPipe() {
  const gap = 200;
  const minHeight = -200;
  const maxHeight = 200;
  const height = Math.random() * (maxHeight - minHeight) + minHeight;

  const pipeGeometry = new THREE.PlaneGeometry(52, 320);
  const pipeMaterial = new THREE.MeshBasicMaterial({ map: pipeTexture });

  const topPipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
  topPipe.position.set(400, height + gap/2 + 160, 0);
  topPipe.rotation.z = Math.PI;

  const bottomPipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
  bottomPipe.position.set(400, height - gap/2 - 160, 0);

  scene.add(topPipe);
  scene.add(bottomPipe);
  pipes.push(topPipe, bottomPipe);
}

// Collision detection
function checkCollision(bird, pipe) {
  const birdBox = new THREE.Box3().setFromObject(bird);
  const pipeBox = new THREE.Box3().setFromObject(pipe);
  return birdBox.intersectsBox(pipeBox);
}

// Handle jump
function jump() {
  if (!gameOver) {
    birdVelocity = jumpForce;
  }
}

// Event listeners
document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    jump();
  }
});

document.addEventListener('click', jump);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate(); 