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

function animate() {
	requestAnimationFrame(animate);
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	controls.update();
	renderer.render(scene, camera);
}

animate();
