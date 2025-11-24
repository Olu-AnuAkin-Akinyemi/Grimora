import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class SigilViewer {
    constructor(containerId, modelPath, metadata = {}) {
        this.container = document.getElementById(containerId);
        this.modelPath = modelPath;
        this.metadata = metadata; // { title, subtitle, paths }
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.model = null;
        this.animationId = null;
        this.tooltipTimeout = null;

        if (this.container) {
            this.init();
            this.setupTooltipEvents();
        } else {
            console.error(`SigilViewer: Container ${containerId} not found`);
        }
    }

    init() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        // Scene
        this.scene = new THREE.Scene();
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        this.camera.position.z = 5;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(2, 2, 5);
        this.scene.add(dirLight);

        // Load Model
        const loader = new GLTFLoader();
        loader.load(
            this.modelPath,
            (gltf) => {
                this.model = gltf.scene;
                
                // Center model
                const box = new THREE.Box3().setFromObject(this.model);
                const center = box.getCenter(new THREE.Vector3());
                this.model.position.sub(center);
                
                this.scene.add(this.model);
                this.animate();
            },
            undefined,
            (error) => {
                console.error(`Error loading model ${this.modelPath}:`, error);
            }
        );

        // Handle resize
        window.addEventListener('resize', () => this.onResize());
    }

    setupTooltipEvents() {
        this.container.addEventListener('mouseenter', (e) => this.showTooltip(e));
        this.container.addEventListener('mousemove', (e) => this.updateTooltipPosition(e));
        this.container.addEventListener('mouseleave', () => this.hideTooltip());
    }

    showTooltip(event) {
        if (!this.metadata.title) return;

        const tooltip = document.getElementById('hall-tooltip');
        if (!tooltip) return;

        // Update content
        tooltip.querySelector('.tooltip-title').textContent = this.metadata.title;
        tooltip.querySelector('.tooltip-subtitle').textContent = this.metadata.subtitle || '';
        
        const pathsContainer = tooltip.querySelector('.tooltip-paths');
        pathsContainer.innerHTML = '';
        if (this.metadata.paths) {
            this.metadata.paths.forEach(path => {
                const tag = document.createElement('span');
                tag.className = 'path-tag';
                tag.textContent = path;
                pathsContainer.appendChild(tag);
            });
        }

        tooltip.classList.remove('hidden');
        this.updateTooltipPosition(event);
    }

    updateTooltipPosition(event) {
        const tooltip = document.getElementById('hall-tooltip');
        if (!tooltip || tooltip.classList.contains('hidden')) return;

        const tooltipWidth = tooltip.offsetWidth;
        const tooltipHeight = tooltip.offsetHeight;
        const padding = 10;

        let left = event.clientX - (tooltipWidth / 2);
        let top = event.clientY + 20;

        // Bounds checking
        const maxLeft = window.innerWidth - tooltipWidth - padding;
        const maxTop = window.innerHeight - tooltipHeight - padding;

        left = Math.max(padding, Math.min(left, maxLeft));
        top = Math.max(padding, Math.min(top, maxTop));

        tooltip.style.position = 'fixed';
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.style.zIndex = '9999';
    }

    hideTooltip() {
        const tooltip = document.getElementById('hall-tooltip');
        if (tooltip) {
            tooltip.classList.add('hidden');
        }
    }

    onResize() {
        if (!this.container || !this.camera || !this.renderer) return;
        
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        if (this.model) {
            this.model.rotation.y += 0.01;
            this.model.rotation.x += 0.005;
        }

        this.renderer.render(this.scene, this.camera);
    }
}
