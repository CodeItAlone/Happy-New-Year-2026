/**
 * ============================================
 * EARTH3D.JS - Interactive 3D Earth Globe
 * ============================================
 * Uses Three.js for WebGL rendering with drag-to-rotate
 */

const Earth3D = (function () {
    'use strict';

    // ========== State ==========
    let container, scene, camera, renderer, earth, atmosphere;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationVelocity = { x: 0, y: 0 };
    let currentRotation = { x: 0, y: 0 };
    let animationId = null;

    // ========== Configuration ==========
    const CONFIG = {
        earthSize: 200,
        rotationDamping: 0.95,
        dragSensitivity: 0.005,
        minVelocity: 0.0001
    };

    // ========== Initialization ==========
    async function init() {
        container = document.getElementById('earth3d-container');
        if (!container) {
            console.warn('Earth3D: Container not found');
            return;
        }

        // Wait for Three.js to load
        if (typeof THREE === 'undefined') {
            console.warn('Earth3D: Three.js not loaded');
            return;
        }

        setupScene();
        await createEarth();
        createAtmosphere();
        bindEvents();
        animate();
    }

    function setupScene() {
        // Scene
        scene = new THREE.Scene();

        // Camera
        const aspectRatio = container.clientWidth / container.clientHeight;
        camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000);
        camera.position.z = 500;

        // Renderer
        renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        sunLight.position.set(5, 3, 5);
        scene.add(sunLight);

        // Subtle blue rim light
        const rimLight = new THREE.DirectionalLight(0x3b82f6, 0.3);
        rimLight.position.set(-5, 0, -5);
        scene.add(rimLight);
    }

    async function createEarth() {
        const textureLoader = new THREE.TextureLoader();

        // Create Earth with texture
        const geometry = new THREE.SphereGeometry(CONFIG.earthSize, 64, 64);

        // Load texture
        const texture = await new Promise((resolve) => {
            textureLoader.load(
                'assets/earth-texture.png',
                (tex) => {
                    tex.colorSpace = THREE.SRGBColorSpace;
                    resolve(tex);
                },
                undefined,
                (err) => {
                    console.warn('Could not load Earth texture, using fallback');
                    resolve(createFallbackTexture());
                }
            );
        });

        const material = new THREE.MeshPhongMaterial({
            map: texture,
            bumpScale: 0.5,
            specular: new THREE.Color(0x333333),
            shininess: 5
        });

        earth = new THREE.Mesh(geometry, material);
        scene.add(earth);
    }

    function createFallbackTexture() {
        // Create a simple procedural Earth texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Ocean blue
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(0, 0, 512, 256);

        // Simple land masses
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.ellipse(256, 100, 80, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(150, 150, 60, 50, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(380, 140, 50, 40, -0.2, 0, Math.PI * 2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }

    function createAtmosphere() {
        // Atmosphere glow
        const atmosphereGeometry = new THREE.SphereGeometry(CONFIG.earthSize * 1.05, 64, 64);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
                }
            `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });

        atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        scene.add(atmosphere);
    }

    function bindEvents() {
        const canvas = renderer.domElement;

        // Mouse events
        canvas.addEventListener('mousedown', onDragStart);
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);

        // Touch events
        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onDragEnd);

        // Resize
        window.addEventListener('resize', onResize);

        // Cursor style
        canvas.style.cursor = 'grab';
    }

    function onDragStart(e) {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
        rotationVelocity = { x: 0, y: 0 };
        renderer.domElement.style.cursor = 'grabbing';
        e.preventDefault();
    }

    function onTouchStart(e) {
        if (e.touches.length === 1) {
            isDragging = true;
            previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            rotationVelocity = { x: 0, y: 0 };
            e.preventDefault();
        }
    }

    function onDragMove(e) {
        if (!isDragging) return;

        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        rotationVelocity.x = deltaY * CONFIG.dragSensitivity;
        rotationVelocity.y = deltaX * CONFIG.dragSensitivity;

        previousMousePosition = { x: e.clientX, y: e.clientY };
    }

    function onTouchMove(e) {
        if (!isDragging || e.touches.length !== 1) return;
        e.preventDefault();

        const touch = e.touches[0];
        const deltaX = touch.clientX - previousMousePosition.x;
        const deltaY = touch.clientY - previousMousePosition.y;

        rotationVelocity.x = deltaY * CONFIG.dragSensitivity;
        rotationVelocity.y = deltaX * CONFIG.dragSensitivity;

        previousMousePosition = { x: touch.clientX, y: touch.clientY };
    }

    function onDragEnd() {
        isDragging = false;
        if (renderer) {
            renderer.domElement.style.cursor = 'grab';
        }
    }

    function onResize() {
        if (!container || !camera || !renderer) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    // ========== Animation Loop ==========
    function animate() {
        animationId = requestAnimationFrame(animate);

        if (!earth) return;

        // Apply rotation velocity
        earth.rotation.x += rotationVelocity.x;
        earth.rotation.y += rotationVelocity.y;

        // Apply damping when not dragging
        if (!isDragging) {
            rotationVelocity.x *= CONFIG.rotationDamping;
            rotationVelocity.y *= CONFIG.rotationDamping;

            // Stop rotation when velocity is very small
            if (Math.abs(rotationVelocity.x) < CONFIG.minVelocity) rotationVelocity.x = 0;
            if (Math.abs(rotationVelocity.y) < CONFIG.minVelocity) rotationVelocity.y = 0;
        }

        // Sync atmosphere rotation
        if (atmosphere) {
            atmosphere.rotation.copy(earth.rotation);
        }

        renderer.render(scene, camera);
    }

    function destroy() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        if (renderer) {
            renderer.dispose();
        }
    }

    // ========== Public API ==========
    return { init, destroy };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Give Three.js time to load
    setTimeout(Earth3D.init, 100);
});
