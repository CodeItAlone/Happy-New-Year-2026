const SpaceBackground = (function () {
    'use strict';

    const CONFIG = {
        starCount: 500,
        starSpeed: 0.3,
        starColors: ['#ffffff', '#a78bfa', '#93c5fd', '#fcd34d', '#f0abfc', '#7dd3fc'],
        mouseParallaxStrength: 0.02
    };

    let canvas, ctx;
    let stars = [];
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    let animationId = null;
    let isRunning = false;

    class Star {
        constructor() {
            this.reset();
            this.z = Math.random() * canvas.width;
        }

        reset() {
            this.x = (Math.random() - 0.5) * canvas.width * 2;
            this.y = (Math.random() - 0.5) * canvas.height * 2;
            this.z = canvas.width;
            this.size = Math.random() * 3 + 1;
            this.color = CONFIG.starColors[Math.floor(Math.random() * CONFIG.starColors.length)];
            this.opacity = Math.random() * 0.3 + 0.7;
            this.twinkleSpeed = Math.random() * 0.02 + 0.01;
            this.twinkleOffset = Math.random() * Math.PI * 2;
        }

        update(deltaTime) {
            this.z -= CONFIG.starSpeed * deltaTime * 0.1;
            if (this.z <= 0) this.reset();
            this.currentOpacity = this.opacity * (0.8 + Math.sin(Date.now() * this.twinkleSpeed + this.twinkleOffset) * 0.2);
        }

        draw() {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const scale = canvas.width / this.z;
            const x2d = (this.x * scale) + centerX + (mouseX * CONFIG.mouseParallaxStrength * this.z);
            const y2d = (this.y * scale) + centerY + (mouseY * CONFIG.mouseParallaxStrength * this.z);
            const size = this.size * scale * 0.8;

            if (x2d < -10 || x2d > canvas.width + 10 || y2d < -10 || y2d > canvas.height + 10) return;

            ctx.beginPath();
            ctx.arc(x2d, y2d, Math.max(size, 1), 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.currentOpacity;
            ctx.fill();

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
            canvas.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -2; pointer-events: none;`;
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
        for (let i = 0; i < CONFIG.starCount; i++) stars.push(new Star());
    }

    function bindEvents() {
        window.addEventListener('resize', () => { resizeCanvas(); createStars(); });
        document.addEventListener('mousemove', (e) => {
            targetMouseX = e.clientX - window.innerWidth / 2;
            targetMouseY = e.clientY - window.innerHeight / 2;
        });
    }

    let lastTime = 0;

    function animate(currentTime) {
        if (!isRunning) return;
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

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
        if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) CONFIG.starSpeed = 0;

    return { init, start, stop };
})();

document.addEventListener('DOMContentLoaded', SpaceBackground.init);

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

        earth.style.pointerEvents = 'auto';
        earth.style.cursor = 'grab';
        earth.style.animation = 'none';
        earthImg.style.transition = 'none';

        bindEvents();
        startMomentumLoop();
    }

    function bindEvents() {
        earth.addEventListener('mousedown', onDragStart);
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);
        earth.addEventListener('touchstart', onTouchStart, { passive: false });
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onDragEnd);
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
        velocity = deltaX * 0.5;
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
        if (earthImg) earthImg.style.transform = `rotate(${currentRotation}deg)`;
    }

    function startMomentumLoop() {
        function loop() {
            if (!isDragging && Math.abs(velocity) > 0.1) {
                velocity *= 0.98;
                currentRotation += velocity;
                applyRotation();
            }
            animationId = requestAnimationFrame(loop);
        }
        loop();
    }

    function destroy() {
        if (animationId) cancelAnimationFrame(animationId);
    }

    return { init, destroy };
})();

document.addEventListener('DOMContentLoaded', EarthRotation.init);
