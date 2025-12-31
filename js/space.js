/**
 * ============================================
 * SPACE.JS - Animated Space Background
 * ============================================
 * Canvas-based moving starfield with floating planets
 */

const SpaceBackground = (function () {
    'use strict';

    // ========== Configuration ==========
    const CONFIG = {
        starCount: 500,
        starSpeed: 0.3,
        starColors: ['#ffffff', '#a78bfa', '#93c5fd', '#fcd34d', '#f0abfc', '#7dd3fc'],
        mouseParallaxStrength: 0.02
    };

    // ========== State ==========
    let canvas, ctx;
    let stars = [];
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    let animationId = null;
    let isRunning = false;

    // ========== Star Class ==========
    class Star {
        constructor() {
            this.reset();
            // Start at random position
            this.z = Math.random() * canvas.width;
        }

        reset() {
            this.x = (Math.random() - 0.5) * canvas.width * 2;
            this.y = (Math.random() - 0.5) * canvas.height * 2;
            this.z = canvas.width;
            // Larger stars (increased from 0.5-2.5 to 1-4)
            this.size = Math.random() * 3 + 1;
            this.color = CONFIG.starColors[Math.floor(Math.random() * CONFIG.starColors.length)];
            // Higher opacity (0.7-1.0 instead of 0.5-1.0)
            this.opacity = Math.random() * 0.3 + 0.7;
            this.twinkleSpeed = Math.random() * 0.02 + 0.01;
            this.twinkleOffset = Math.random() * Math.PI * 2;
        }

        update(deltaTime) {
            // Move towards viewer (z decreases)
            this.z -= CONFIG.starSpeed * deltaTime * 0.1;

            // Reset if too close
            if (this.z <= 0) {
                this.reset();
            }

            // Twinkle effect (reduced dimming range)
            this.currentOpacity = this.opacity * (0.8 + Math.sin(Date.now() * this.twinkleSpeed + this.twinkleOffset) * 0.2);
        }

        draw() {
            // Project 3D to 2D
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            const scale = canvas.width / this.z;
            const x2d = (this.x * scale) + centerX + (mouseX * CONFIG.mouseParallaxStrength * this.z);
            const y2d = (this.y * scale) + centerY + (mouseY * CONFIG.mouseParallaxStrength * this.z);

            // Size based on depth (increased multiplier)
            const size = this.size * scale * 0.8;

            // Skip if off screen
            if (x2d < -10 || x2d > canvas.width + 10 || y2d < -10 || y2d > canvas.height + 10) {
                return;
            }

            // Draw star with glow (always add glow now)
            ctx.beginPath();
            ctx.arc(x2d, y2d, Math.max(size, 1), 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.currentOpacity;
            ctx.fill();

            // Add glow for all visible stars
            if (size > 0.8) {
                ctx.beginPath();
                ctx.arc(x2d, y2d, size * 2.5, 0, Math.PI * 2);
                const gradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, size * 2.5);
                gradient.addColorStop(0, this.color);
                gradient.addColorStop(0.4, this.color);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.globalAlpha = this.currentOpacity * 0.5;
                ctx.fill();
            }

            ctx.globalAlpha = 1;
        }
    }

    // ========== Initialization ==========
    function init() {
        createCanvas();
        createStars();
        bindEvents();
        start();
    }

    function createCanvas() {
        canvas = document.getElementById('spaceCanvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'spaceCanvas';
            canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -2;
        pointer-events: none;
      `;
            document.body.insertBefore(canvas, document.body.firstChild);
        }
        ctx = canvas.getContext('2d');
        resizeCanvas();
    }

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
    }

    function createStars() {
        stars = [];
        for (let i = 0; i < CONFIG.starCount; i++) {
            stars.push(new Star());
        }
    }

    function bindEvents() {
        window.addEventListener('resize', () => {
            resizeCanvas();
            createStars();
        });

        document.addEventListener('mousemove', (e) => {
            targetMouseX = e.clientX - window.innerWidth / 2;
            targetMouseY = e.clientY - window.innerHeight / 2;
        });
    }

    // ========== Animation Loop ==========
    let lastTime = 0;

    function animate(currentTime) {
        if (!isRunning) return;

        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // Smooth mouse interpolation
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw stars
        for (const star of stars) {
            star.update(deltaTime);
            star.draw();
        }

        animationId = requestAnimationFrame(animate);
    }

    function start() {
        if (isRunning) return;
        isRunning = true;
        lastTime = performance.now();
        animationId = requestAnimationFrame(animate);
    }

    function stop() {
        isRunning = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        CONFIG.starSpeed = 0;
    }

    // ========== Public API ==========
    return {
        init,
        start,
        stop
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', SpaceBackground.init);

/**
 * ============================================
 * EARTH ROTATION - Interactive Drag to Spin
 * ============================================
 */
const EarthRotation = (function () {
    'use strict';

    let earth = null;
    let earthImg = null;
    let isDragging = false;
    let startX = 0;
    let currentRotation = 0;
    let velocity = 0;
    let animationId = null;

    function init() {
        earth = document.querySelector('.planet--earth');
        if (!earth) return;

        earthImg = earth.querySelector('img');
        if (!earthImg) return;

        // Make Earth interactive
        earth.style.pointerEvents = 'auto';
        earth.style.cursor = 'grab';

        // Remove auto-spin animation
        earth.style.animation = 'none';
        earthImg.style.transition = 'none';

        bindEvents();
        startMomentumLoop();
    }

    function bindEvents() {
        // Mouse events
        earth.addEventListener('mousedown', onDragStart);
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);

        // Touch events
        earth.addEventListener('touchstart', onTouchStart, { passive: false });
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onDragEnd);

        // Prevent context menu on long press
        earth.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    function onDragStart(e) {
        isDragging = true;
        startX = e.clientX;
        velocity = 0;
        earth.style.cursor = 'grabbing';
        e.preventDefault();
    }

    function onTouchStart(e) {
        if (e.touches.length === 1) {
            isDragging = true;
            startX = e.touches[0].clientX;
            velocity = 0;
            e.preventDefault();
        }
    }

    function onDragMove(e) {
        if (!isDragging) return;

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        if (clientX === undefined) return;

        const deltaX = clientX - startX;
        velocity = deltaX * 0.5; // Sensitivity
        currentRotation += deltaX * 0.5;
        startX = clientX;

        applyRotation();
    }

    function onTouchMove(e) {
        if (!isDragging || e.touches.length !== 1) return;
        e.preventDefault();

        const clientX = e.touches[0].clientX;
        const deltaX = clientX - startX;
        velocity = deltaX * 0.5;
        currentRotation += deltaX * 0.5;
        startX = clientX;

        applyRotation();
    }

    function onDragEnd() {
        if (!isDragging) return;
        isDragging = false;
        if (earth) earth.style.cursor = 'grab';
    }

    function applyRotation() {
        if (earthImg) {
            earthImg.style.transform = `rotate(${currentRotation}deg)`;
        }
    }

    function startMomentumLoop() {
        function loop() {
            if (!isDragging && Math.abs(velocity) > 0.1) {
                // Apply momentum (friction)
                velocity *= 0.98;
                currentRotation += velocity;
                applyRotation();
            }
            animationId = requestAnimationFrame(loop);
        }
        loop();
    }

    function destroy() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    }

    return { init, destroy };
})();

// Initialize Earth rotation
document.addEventListener('DOMContentLoaded', EarthRotation.init);
