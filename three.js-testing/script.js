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

// grid
const gridHelper = new THREE.GridHelper(500, 500);
scene.add(gridHelper);

// ground
const planeGeometry = new THREE.PlaneGeometry(500, 500);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, side: THREE.DoubleSide });
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
const moveSpeed = 0.15;
const turnSpeed = 0.04;
let isGrounded = false;
const cameraOffset = new THREE.Vector3(0, 12, 12);

window.addEventListener('keydown', (event) => {
	keys[event.code] = true;
});

window.addEventListener('keyup', (event) => {
	keys[event.code] = false;
});

function animate() {
	requestAnimationFrame(animate);

	// Car Steering (A/D rotate)
	if (keys['KeyA']) cube.rotation.y += turnSpeed;
	if (keys['KeyD']) cube.rotation.y -= turnSpeed;

	// Car Acceleration (W/S move forward/backward along facing direction)
	if (keys['KeyW']) {
		cube.position.x += Math.sin(cube.rotation.y) * moveSpeed;
		cube.position.z -= Math.cos(cube.rotation.y) * moveSpeed;
	}
	if (keys['KeyS']) {
		cube.position.x -= Math.sin(cube.rotation.y) * moveSpeed;
		cube.position.z += Math.cos(cube.rotation.y) * moveSpeed;
	}

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

	// Camera follow behind cube relative to rotation
	const rotatedOffset = cameraOffset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), cube.rotation.y);
	camera.position.copy(cube.position).add(rotatedOffset);
	controls.target.copy(cube.position);
	controls.update();
	renderer.render(scene, camera);
}

animate();
