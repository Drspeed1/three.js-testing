import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Geometry and material
const geometry = new THREE.BoxGeometry(1, 1, 2);
const material = new THREE.MeshStandardMaterial({ color: 'red', wireframe: false });

const scene = new THREE.Scene();

// Light
const ambientLight = new THREE.AmbientLight(0xffffff, 5);
scene.add(ambientLight);

// ground texture
const textureCanvas = document.createElement('canvas');
textureCanvas.width = 256;
textureCanvas.height = 256;
const ctx = textureCanvas.getContext('2d');

// Base light grey tile
ctx.fillStyle = '#666666';
ctx.fillRect(0, 0, 256, 256);

// Darker grid lines to form a grid pattern
ctx.strokeStyle = '#333333';
ctx.lineWidth = 8;
ctx.strokeRect(0, 0, 256, 256);

const floorTexture = new THREE.CanvasTexture(textureCanvas);
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(50, 50);

// ground
const planeGeometry = new THREE.PlaneGeometry(500, 500);
const planeMaterial = new THREE.MeshStandardMaterial({
	map: floorTexture,
	side: THREE.DoubleSide
});
const ground = new THREE.Mesh(planeGeometry, planeMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// cube
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 5, 0);

const edges = new THREE.EdgesGeometry(geometry);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
const wireframe = new THREE.LineSegments(edges, lineMaterial);
cube.add(wireframe);

scene.add(cube);

// render
const renderer = new THREE.WebGLRenderer({
	canvas: canvas
});

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

function randomStar() {
	const geometry = new THREE.SphereGeometry(0.25, 24, 24);
	const material = new THREE.MeshStandardMaterial({ color: 'white' });
	const star = new THREE.Mesh(geometry, material);

	const x = THREE.MathUtils.randFloatSpread(300);
	const y = THREE.MathUtils.randFloat(1, 150); // Above floor level (y > 0)
	const z = THREE.MathUtils.randFloatSpread(300);
	star.position.set(x, y, z);
	scene.add(star);
}

Array(200).fill().forEach(randomStar);

// Movement and Physics
const keys = {};
let velocityY = 0;
const gravity = -0.015;
const jumpForce = 0.35;

// Car speed and friction parameters
let speed = 0;
const maxForwardSpeed = 0.25;
const maxReverseSpeed = -0.12;
const acceleration = 0.008;
const reverseAcceleration = 0.005;
const friction = 0.96;
const turnSpeed = 0.035;

let isGrounded = false;
const cameraOffset = new THREE.Vector3(0, 12, 12);
let isUserInteractingWithCamera = false;

// Track manual camera rotation via OrbitControls
controls.addEventListener('start', () => {
	isUserInteractingWithCamera = true;
});

window.addEventListener('keydown', (event) => {
	keys[event.code] = true;
});

window.addEventListener('keyup', (event) => {
	keys[event.code] = false;
});

function animate() {
	requestAnimationFrame(animate);

	const isMoving = keys['KeyW'] || keys['KeyS'] || keys['KeyA'] || keys['KeyD'] || Math.abs(speed) > 0.01;

	// If user presses movement keys, return camera control to auto-follow
	if (keys['KeyW'] || keys['KeyS'] || keys['KeyA'] || keys['KeyD']) {
		isUserInteractingWithCamera = false;
	}

	// Acceleration & Deceleration (Coasting friction & Reverse)
	if (keys['KeyW']) {
		speed += acceleration;
	} else if (keys['KeyS']) {
		speed -= reverseAcceleration;
	} else {
		speed *= friction;
	}
	speed = THREE.MathUtils.clamp(speed, maxReverseSpeed, maxForwardSpeed);

	// Steering (A/D rotate) - turns relative to car movement direction
	if (speed !== 0) {
		const direction = speed > 0 ? 1 : -1;
		if (keys['KeyA']) cube.rotation.y += turnSpeed * direction;
		if (keys['KeyD']) cube.rotation.y -= turnSpeed * direction;
	}

	// Move car forward along facing direction
	cube.position.x -= Math.sin(cube.rotation.y) * speed;
	cube.position.z -= Math.cos(cube.rotation.y) * speed;

	// Jump
	if (keys['Space'] && isGrounded) {
		velocityY = jumpForce;
		isGrounded = false;
	}

	// Gravity & Vertical Physics
	velocityY += gravity;
	cube.position.y += velocityY;

	// Ground collision (cube height is 1, so center is at y = 0.5 when on ground)
	if (cube.position.y <= 0.5) {
		cube.position.y = 0.5;
		velocityY = 0;
		isGrounded = true;
	}

	// Smooth Camera Follow using Lerp (Linear Interpolation)
	if (!isUserInteractingWithCamera) {
		const rotatedOffset = cameraOffset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), cube.rotation.y);
		const idealCameraPos = cube.position.clone().add(rotatedOffset);
		camera.position.lerp(idealCameraPos, 0.08);
	} else {
		// Keep camera locked onto the car position while preserving user's manual orbit angle
		const targetDelta = cube.position.clone().sub(controls.target);
		camera.position.add(targetDelta);
	}

	controls.target.lerp(cube.position, 0.1);
	controls.update();
	renderer.render(scene, camera);
}

animate();
