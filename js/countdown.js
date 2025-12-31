const CountdownApp = (function () {
    'use strict';

    const CONFIG = {
        targetDate: new Date('January 1, 2026 00:00:00').getTime(),
        updateInterval: 1000,
        transitionDuration: 500,
        celebrationPage: 'celebration.html'
    };

    let elements = {};

    let state = {
        isComplete: false,
        lastValues: { days: '', hours: '', minutes: '', seconds: '' },
        animationFrameId: null
    };

    function init() {
        cacheElements();
        bindEvents();
        startCountdown();
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
        elements.ctaButton.addEventListener('click', handleButtonClick);
        document.addEventListener('keydown', handleKeyDown);
    }

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

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        updateDigits('days', padZero(days));
        updateDigits('hours', padZero(hours));
        updateDigits('minutes', padZero(minutes));
        updateDigits('seconds', padZero(seconds));

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
                digit.textContent = char;
                digit.classList.add('changing');
                setTimeout(() => { digit.classList.remove('changing'); }, 400);
            }
        });

        state.lastValues[unit] = value;
    }

    function padZero(num) {
        return num.toString().padStart(2, '0');
    }

    function checkIfComplete() {
        if (Date.now() >= CONFIG.targetDate) {
            onCountdownComplete();
        }
    }

    function onCountdownComplete() {
        if (state.isComplete) return;
        state.isComplete = true;

        updateDigits('days', '00');
        updateDigits('hours', '00');
        updateDigits('minutes', '00');
        updateDigits('seconds', '00');

        enableButton();
    }

    function enableButton() {
        const button = elements.ctaButton;
        button.disabled = false;
        button.style.animation = 'buttonGlow 2s ease-in-out infinite';
        button.focus();
    }

    function handleButtonClick() {
        if (elements.ctaButton.disabled) return;
        transitionToPage2();
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter' && !elements.ctaButton.disabled) {
            event.preventDefault();
            transitionToPage2();
        }
    }

    function transitionToPage2() {
        const overlay = elements.pageOverlay;
        sessionStorage.setItem('newYearTransition', 'true');
        overlay.classList.add('active');
        setTimeout(() => { window.location.href = CONFIG.celebrationPage; }, CONFIG.transitionDuration);
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', CountdownApp.init);

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes buttonGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(167, 139, 250, 0.3); }
    50% { box-shadow: 0 0 40px rgba(167, 139, 250, 0.6), 0 0 60px rgba(167, 139, 250, 0.3); }
  }
`;
document.head.appendChild(styleSheet);
