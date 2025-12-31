/**
 * ============================================
 * COUNTDOWN.JS - New Year Countdown Timer
 * ============================================
 * Smooth countdown with digit transitions and page navigation
 */

const CountdownApp = (function () {
    'use strict';

    // ========== Configuration ==========
    const CONFIG = {
        targetDate: new Date('January 1, 2026 00:00:00').getTime(),
        updateInterval: 1000, // Update every second
        transitionDuration: 500,
        celebrationPage: 'celebration.html'
    };

    // ========== DOM Elements ==========
    let elements = {};

    // ========== State ==========
    let state = {
        isComplete: false,
        lastValues: {
            days: '',
            hours: '',
            minutes: '',
            seconds: ''
        },
        animationFrameId: null
    };

    // ========== Initialization ==========
    function init() {
        cacheElements();
        bindEvents();
        startCountdown();

        // Check if we should enable button immediately (for testing or if past midnight)
        checkIfComplete();
    }

    function cacheElements() {
        elements = {
            days: document.getElementById('days'),
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds'),
            ctaButton: document.getElementById('ctaButton'),
            pageOverlay: document.getElementById('pageOverlay')
        };
    }

    function bindEvents() {
        // Button click
        elements.ctaButton.addEventListener('click', handleButtonClick);

        // Keyboard support - Enter key
        document.addEventListener('keydown', handleKeyDown);
    }

    // ========== Countdown Logic ==========
    function startCountdown() {
        updateCountdown();
    }

    function updateCountdown() {
        const now = Date.now();
        const distance = CONFIG.targetDate - now;

        if (distance <= 0) {
            onCountdownComplete();
            return;
        }

        // Calculate time units
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Update display with smooth transitions
        updateDigits('days', padZero(days));
        updateDigits('hours', padZero(hours));
        updateDigits('minutes', padZero(minutes));
        updateDigits('seconds', padZero(seconds));

        // Schedule next update
        setTimeout(updateCountdown, CONFIG.updateInterval);
    }

    function updateDigits(unit, value) {
        const container = elements[unit];
        if (!container) return;

        const digits = container.querySelectorAll('.countdown__digit');
        const chars = value.split('');
        const lastValue = state.lastValues[unit];

        chars.forEach((char, index) => {
            const digit = digits[index];
            if (!digit) return;

            const lastChar = lastValue ? lastValue[index] : '';

            if (char !== lastChar) {
                // Animate the digit change
                digit.textContent = char;

                // Add animation class
                digit.classList.add('changing');

                // Remove animation class after animation completes
                setTimeout(() => {
                    digit.classList.remove('changing');
                }, 400);
            }
        });

        state.lastValues[unit] = value;
    }

    function padZero(num) {
        return num.toString().padStart(2, '0');
    }

    // ========== Countdown Complete ==========
    function checkIfComplete() {
        const now = Date.now();
        if (now >= CONFIG.targetDate) {
            onCountdownComplete();
        }
    }

    function onCountdownComplete() {
        if (state.isComplete) return;
        state.isComplete = true;

        // Set all digits to zero
        updateDigits('days', '00');
        updateDigits('hours', '00');
        updateDigits('minutes', '00');
        updateDigits('seconds', '00');

        // Enable the CTA button with a nice animation
        enableButton();
    }

    function enableButton() {
        const button = elements.ctaButton;
        button.disabled = false;

        // Add a subtle glow animation
        button.style.animation = 'buttonGlow 2s ease-in-out infinite';

        // Focus the button for accessibility
        button.focus();
    }

    // ========== Event Handlers ==========
    function handleButtonClick() {
        if (elements.ctaButton.disabled) return;
        transitionToPage2();
    }

    function handleKeyDown(event) {
        // Enter key triggers the button if enabled
        if (event.key === 'Enter' && !elements.ctaButton.disabled) {
            event.preventDefault();
            transitionToPage2();
        }
    }

    // ========== Page Transition ==========
    function transitionToPage2() {
        const overlay = elements.pageOverlay;

        // Mark that we're transitioning to celebrate
        sessionStorage.setItem('newYearTransition', 'true');

        // Fade to black
        overlay.classList.add('active');

        // Navigate after fade completes
        setTimeout(() => {
            window.location.href = CONFIG.celebrationPage;
        }, CONFIG.transitionDuration);
    }

    // ========== Public API ==========
    return {
        init
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', CountdownApp.init);

// Add button glow animation dynamically
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes buttonGlow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(167, 139, 250, 0.3);
    }
    50% {
      box-shadow: 0 0 40px rgba(167, 139, 250, 0.6), 0 0 60px rgba(167, 139, 250, 0.3);
    }
  }
`;
document.head.appendChild(styleSheet);
