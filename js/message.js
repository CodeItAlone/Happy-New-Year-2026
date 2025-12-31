/**
 * ============================================
 * MESSAGE.JS - Message to the Future
 * ============================================
 * Typing animation, mouse reactivity, and page entrance effects
 */

const CelebrationApp = (function () {
    'use strict';

    // ========== Configuration ==========
    const CONFIG = {
        message: `As the clock strikes midnight, we stand at the threshold of infinite possibilities.

The past year taught us resilience. It showed us that even in darkness, we find our brightest lights — in the connections we cherish, the dreams we nurture, and the courage to begin again.

2026 is not just a new year. It's a blank canvas waiting for your story.

May this year bring you moments that take your breath away, challenges that make you stronger, and the wisdom to know that every ending is simply a new beginning in disguise.

Here's to the journey ahead. ✨`,
        typingSpeed: 35,          // ms per character
        initialDelay: 800,        // Delay before typing starts
        mouseParallaxStrength: 15 // Pixels of movement
    };

    // ========== DOM Elements ==========
    let elements = {};

    // ========== State ==========
    let state = {
        mouseX: 0,
        mouseY: 0,
        targetX: 0,
        targetY: 0,
        typingComplete: false,
        animationFrameId: null
    };

    // ========== Initialization ==========
    function init() {
        cacheElements();
        bindEvents();

        // Entrance animation
        setTimeout(revealPage, 100);

        // Start typing after entrance
        setTimeout(startTyping, CONFIG.initialDelay + 500);

        // Initialize mouse parallax
        initMouseParallax();
    }

    function cacheElements() {
        elements = {
            pageOverlay: document.getElementById('pageOverlay'),
            messageContent: document.getElementById('messageContent'),
            cursor: document.getElementById('cursor'),
            messageContainer: document.getElementById('messageContainer'),
            restartButton: document.getElementById('restartButton'),
            orb1: document.getElementById('orb1'),
            orb2: document.getElementById('orb2'),
            orb3: document.getElementById('orb3')
        };
    }

    function bindEvents() {
        // Mouse movement for parallax
        document.addEventListener('mousemove', handleMouseMove);

        // Restart button
        elements.restartButton.addEventListener('click', handleRestart);

        // Keyboard support
        document.addEventListener('keydown', handleKeyDown);
    }

    // ========== Page Entrance ==========
    function revealPage() {
        const overlay = elements.pageOverlay;

        // Fade out the overlay
        overlay.style.transition = 'opacity 0.8s ease';
        overlay.style.opacity = '0';

        setTimeout(() => {
            overlay.classList.remove('active');
        }, 800);
    }

    // ========== Typing Animation ==========
    function startTyping() {
        const message = CONFIG.message;
        const content = elements.messageContent;
        const cursor = elements.cursor;

        let charIndex = 0;
        let textNode = document.createTextNode('');

        // Insert text node before cursor
        content.insertBefore(textNode, cursor);

        function typeNextChar() {
            if (charIndex < message.length) {
                const char = message[charIndex];
                textNode.textContent += char;
                charIndex++;

                // Variable speed for natural feel
                let delay = CONFIG.typingSpeed;

                // Pause longer at punctuation
                if (['.', '!', '?'].includes(char)) {
                    delay = CONFIG.typingSpeed * 8;
                } else if ([',', ';', ':'].includes(char)) {
                    delay = CONFIG.typingSpeed * 4;
                } else if (char === '\n') {
                    delay = CONFIG.typingSpeed * 6;
                }

                setTimeout(typeNextChar, delay);
            } else {
                onTypingComplete();
            }
        }

        // Check for reduced motion
        if (AnimationUtils.prefersReducedMotion()) {
            // Show full message immediately
            textNode.textContent = message;
            onTypingComplete();
        } else {
            typeNextChar();
        }
    }

    function onTypingComplete() {
        state.typingComplete = true;
        elements.messageContainer.classList.add('message--complete');
    }

    // ========== Mouse Parallax ==========
    function handleMouseMove(event) {
        // Calculate mouse position relative to center
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        state.targetX = (event.clientX - centerX) / centerX;
        state.targetY = (event.clientY - centerY) / centerY;
    }

    function initMouseParallax() {
        // Check for reduced motion
        if (AnimationUtils.prefersReducedMotion()) {
            return;
        }

        function animate() {
            // Smooth interpolation
            state.mouseX = AnimationUtils.lerp(state.mouseX, state.targetX, 0.05);
            state.mouseY = AnimationUtils.lerp(state.mouseY, state.targetY, 0.05);

            const strength = CONFIG.mouseParallaxStrength;

            // Apply parallax to orbs with different intensities
            if (elements.orb1) {
                elements.orb1.style.transform = `translate(${state.mouseX * strength * 2}px, ${state.mouseY * strength * 2}px)`;
            }
            if (elements.orb2) {
                elements.orb2.style.transform = `translate(${state.mouseX * strength * -1.5}px, ${state.mouseY * strength * -1.5}px)`;
            }
            if (elements.orb3) {
                elements.orb3.style.transform = `translate(${state.mouseX * strength}px, ${state.mouseY * strength}px)`;
            }

            state.animationFrameId = AnimationUtils.requestFrame(animate);
        }

        animate();
    }

    // ========== Event Handlers ==========
    function handleRestart() {
        const overlay = elements.pageOverlay;

        // Fade out
        overlay.style.transition = 'opacity 0.5s ease';
        overlay.style.opacity = '1';
        overlay.classList.add('active');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }

    function handleKeyDown(event) {
        // Escape to go back
        if (event.key === 'Escape') {
            handleRestart();
        }

        // Space or Enter to skip typing (if not complete)
        if ((event.key === ' ' || event.key === 'Enter') && !state.typingComplete) {
            skipTyping();
        }
    }

    function skipTyping() {
        // Find the text node and set full message
        const content = elements.messageContent;
        const textNodes = Array.from(content.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);

        if (textNodes.length > 0) {
            textNodes[0].textContent = CONFIG.message;
        } else {
            const textNode = document.createTextNode(CONFIG.message);
            content.insertBefore(textNode, elements.cursor);
        }

        onTypingComplete();
    }

    // ========== Cleanup ==========
    function destroy() {
        if (state.animationFrameId) {
            AnimationUtils.cancelFrame(state.animationFrameId);
        }
        document.removeEventListener('mousemove', handleMouseMove);
    }

    // ========== Public API ==========
    return {
        init,
        destroy
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', CelebrationApp.init);

// Cleanup on page unload
window.addEventListener('beforeunload', CelebrationApp.destroy);
