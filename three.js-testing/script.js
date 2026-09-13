import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Geometry and material
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 'blue', wireframe: false });

const scene = new THREE.Scene();

// Light
const ambientLight = new THREE.AmbientLight(0xffffff, 5);
scene.add(ambientLight);

// grid
const gridHelper = new THREE.GridHelper(50, 50);
scene.add(gridHelper);

// ground
const planeGeometry = new THREE.PlaneGeometry(50, 50);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, side: THREE.DoubleSide });
const ground = new THREE.Mesh(planeGeometry, planeMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// cube
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 5, 0);
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

	const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
	star.position.set(x, y, z);
	scene.add(star);
}

Array(200).fill().forEach(randomStar);

// Movement and Physics
const keys = {};
let velocityY = 0;
const gravity = -0.015;
const jumpForce = 0.35;
const moveSpeed = 0.15;
let isGrounded = false;
const cameraOffset = new THREE.Vector3(0, 5, 10);

window.addEventListener('keydown', (event) => {
	keys[event.code] = true;
});

window.addEventListener('keyup', (event) => {
	keys[event.code] = false;
});

function animate() {
	requestAnimationFrame(animate);

	// WASD Movement
	if (keys['KeyW']) cube.position.z -= moveSpeed;
	if (keys['KeyS']) cube.position.z += moveSpeed;
	if (keys['KeyA']) cube.position.x -= moveSpeed;
	if (keys['KeyD']) cube.position.x += moveSpeed;

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

	// Camera follow behind cube
	camera.position.copy(cube.position).add(cameraOffset);
	controls.target.copy(cube.position);
	controls.update();
	renderer.render(scene, camera);
}

animate();
