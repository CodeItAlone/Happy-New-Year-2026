const CelebrationApp = (function () {
    'use strict';

    const CONFIG = {
        message: `As the clock strikes midnight, we stand at the threshold of infinite possibilities.

The past year taught us resilience. It showed us that even in darkness, we find our brightest lights — in the connections we cherish, the dreams we nurture, and the courage to begin again.

2026 is not just a new year. It's a blank canvas waiting for your story.

May this year bring you moments that take your breath away, challenges that make you stronger, and the wisdom to know that every ending is simply a new beginning in disguise.

Here's to the journey ahead. ✨`,
        typingSpeed: 35,
        initialDelay: 800,
        mouseParallaxStrength: 15
    };

    let elements = {};

    let state = {
        mouseX: 0, mouseY: 0,
        targetX: 0, targetY: 0,
        typingComplete: false,
        animationFrameId: null
    };

    function init() {
        cacheElements();
        bindEvents();
        setTimeout(revealPage, 100);
        setTimeout(startTyping, CONFIG.initialDelay + 500);
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
        document.addEventListener('mousemove', handleMouseMove);
        elements.restartButton.addEventListener('click', handleRestart);
        document.addEventListener('keydown', handleKeyDown);
    }

    function revealPage() {
        const overlay = elements.pageOverlay;
        overlay.style.transition = 'opacity 0.8s ease';
        overlay.style.opacity = '0';
        setTimeout(() => { overlay.classList.remove('active'); }, 800);
    }

    function startTyping() {
        const message = CONFIG.message;
        const content = elements.messageContent;
        const cursor = elements.cursor;

        let charIndex = 0;
        let textNode = document.createTextNode('');
        content.insertBefore(textNode, cursor);

        function typeNextChar() {
            if (charIndex < message.length) {
                const char = message[charIndex];
                textNode.textContent += char;
                charIndex++;

                let delay = CONFIG.typingSpeed;
                if (['.', '!', '?'].includes(char)) delay = CONFIG.typingSpeed * 8;
                else if ([',', ';', ':'].includes(char)) delay = CONFIG.typingSpeed * 4;
                else if (char === '\n') delay = CONFIG.typingSpeed * 6;

                setTimeout(typeNextChar, delay);
            } else {
                onTypingComplete();
            }
        }

        if (AnimationUtils.prefersReducedMotion()) {
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

    function handleMouseMove(event) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        state.targetX = (event.clientX - centerX) / centerX;
        state.targetY = (event.clientY - centerY) / centerY;
    }

    function initMouseParallax() {
        if (AnimationUtils.prefersReducedMotion()) return;

        function animate() {
            state.mouseX = AnimationUtils.lerp(state.mouseX, state.targetX, 0.05);
            state.mouseY = AnimationUtils.lerp(state.mouseY, state.targetY, 0.05);

            const strength = CONFIG.mouseParallaxStrength;

            if (elements.orb1) elements.orb1.style.transform = `translate(${state.mouseX * strength * 2}px, ${state.mouseY * strength * 2}px)`;
            if (elements.orb2) elements.orb2.style.transform = `translate(${state.mouseX * strength * -1.5}px, ${state.mouseY * strength * -1.5}px)`;
            if (elements.orb3) elements.orb3.style.transform = `translate(${state.mouseX * strength}px, ${state.mouseY * strength}px)`;

            state.animationFrameId = AnimationUtils.requestFrame(animate);
        }
        animate();
    }

    function handleRestart() {
        const overlay = elements.pageOverlay;
        overlay.style.transition = 'opacity 0.5s ease';
        overlay.style.opacity = '1';
        overlay.classList.add('active');
        setTimeout(() => { window.location.href = 'index.html'; }, 500);
    }

    function handleKeyDown(event) {
        if (event.key === 'Escape') handleRestart();
        if ((event.key === ' ' || event.key === 'Enter') && !state.typingComplete) skipTyping();
    }

    function skipTyping() {
        const content = elements.messageContent;
        const textNodes = Array.from(content.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);

        if (textNodes.length > 0) textNodes[0].textContent = CONFIG.message;
        else {
            const textNode = document.createTextNode(CONFIG.message);
            content.insertBefore(textNode, elements.cursor);
        }
        onTypingComplete();
    }

    function destroy() {
        if (state.animationFrameId) AnimationUtils.cancelFrame(state.animationFrameId);
        document.removeEventListener('mousemove', handleMouseMove);
    }

    return { init, destroy };
})();

document.addEventListener('DOMContentLoaded', CelebrationApp.init);
window.addEventListener('beforeunload', CelebrationApp.destroy);
