/**
 * ============================================
 * SNOW.JS - Snowfall Animation
 * ============================================
 * Canvas-based falling snow particles
 */

const Snowfall = (function () {
    'use strict';

    // ========== Configuration ==========
    const CONFIG = {
        snowflakeCount: 50,
        minSize: 2,
        maxSize: 5,
        minSpeed: 1,
        maxSpeed: 3,
        wind: 0.5,
        opacity: 0.8
    };

    // ========== State ==========
    let canvas, ctx;
    let snowflakes = [];
    let animationId = null;
    let isRunning = false;

    // ========== Snowflake Class ==========
    class Snowflake {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * (canvas ? canvas.width : window.innerWidth);
            this.y = initial ? Math.random() * (canvas ? canvas.height : window.innerHeight) : -10;
            this.size = Math.random() * (CONFIG.maxSize - CONFIG.minSize) + CONFIG.minSize;
            this.speed = Math.random() * (CONFIG.maxSpeed - CONFIG.minSpeed) + CONFIG.minSpeed;
            this.opacity = Math.random() * 0.4 + 0.4;
            this.wobble = Math.random() * Math.PI * 2;
            this.wobbleSpeed = Math.random() * 0.02 + 0.01;
        }

        update() {
            // Fall down
            this.y += this.speed;

            // Wobble side to side
            this.wobble += this.wobbleSpeed;
            this.x += Math.sin(this.wobble) * 0.5 + CONFIG.wind;

            // Reset if off screen
            if (this.y > canvas.height + 10 || this.x > canvas.width + 10 || this.x < -10) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fill();

            // Add soft glow
            if (this.size > 3) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.size * 2
                );
                gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity * 0.3})`);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.fill();
            }
        }
    }

    // ========== Initialization ==========
    function init() {
        createCanvas();
        createSnowflakes();
        start();
    }

    function createCanvas() {
        canvas = document.getElementById('snowCanvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'snowCanvas';
            canvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 100;
                pointer-events: none;
            `;
            document.body.appendChild(canvas);
        }
        ctx = canvas.getContext('2d');
        resizeCanvas();

        window.addEventListener('resize', resizeCanvas);
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createSnowflakes() {
        snowflakes = [];
        for (let i = 0; i < CONFIG.snowflakeCount; i++) {
            snowflakes.push(new Snowflake());
        }
    }

    // ========== Animation Loop ==========
    function animate() {
        if (!isRunning) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw snowflakes
        for (const flake of snowflakes) {
            flake.update();
            flake.draw();
        }

        animationId = requestAnimationFrame(animate);
    }

    function start() {
        if (isRunning) return;
        isRunning = true;
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
        CONFIG.snowflakeCount = 30;
        CONFIG.maxSpeed = 1;
    }

    // ========== Public API ==========
    return { init, start, stop };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', Snowfall.init);
