/**
 * ============================================
 * ANIMATIONS.JS - Shared Animation Utilities
 * ============================================
 * Promise-based animation helpers for smooth transitions
 */

const AnimationUtils = (function() {
  'use strict';

  /**
   * Linear interpolation for smooth value transitions
   * @param {number} start - Starting value
   * @param {number} end - Ending value
   * @param {number} t - Progress (0 to 1)
   * @returns {number} Interpolated value
   */
  function lerp(start, end, t) {
    return start + (end - start) * t;
  }

  /**
   * Clamp a value between min and max
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Clamped value
   */
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Promise-based fade in animation
   * @param {HTMLElement} element - Element to fade in
   * @param {number} duration - Duration in milliseconds
   * @returns {Promise} Resolves when animation completes
   */
  function fadeIn(element, duration = 500) {
    return new Promise((resolve) => {
      element.style.opacity = '0';
      element.style.display = 'block';
      element.style.transition = `opacity ${duration}ms ease`;
      
      // Force reflow
      element.offsetHeight;
      
      element.style.opacity = '1';
      
      setTimeout(() => {
        element.style.transition = '';
        resolve();
      }, duration);
    });
  }

  /**
   * Promise-based fade out animation
   * @param {HTMLElement} element - Element to fade out
   * @param {number} duration - Duration in milliseconds
   * @returns {Promise} Resolves when animation completes
   */
  function fadeOut(element, duration = 500) {
    return new Promise((resolve) => {
      element.style.transition = `opacity ${duration}ms ease`;
      element.style.opacity = '0';
      
      setTimeout(() => {
        element.style.display = 'none';
        element.style.transition = '';
        resolve();
      }, duration);
    });
  }

  /**
   * Staggered reveal animation for multiple elements
   * @param {NodeList|Array} elements - Elements to animate
   * @param {Object} options - Animation options
   * @returns {Promise} Resolves when all animations complete
   */
  function staggeredReveal(elements, options = {}) {
    const {
      delay = 100,
      duration = 600,
      translateY = 30,
      staggerDelay = 80
    } = options;

    const elementsArray = Array.from(elements);
    
    return new Promise((resolve) => {
      elementsArray.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = `translateY(${translateY}px)`;
        
        setTimeout(() => {
          el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, delay + (index * staggerDelay));
      });

      // Resolve after all animations complete
      const totalDuration = delay + (elementsArray.length * staggerDelay) + duration;
      setTimeout(resolve, totalDuration);
    });
  }

  /**
   * Check if user prefers reduced motion
   * @returns {boolean} True if user prefers reduced motion
   */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Request animation frame with fallback
   * @param {Function} callback - Animation callback
   * @returns {number} Animation frame ID
   */
  function requestFrame(callback) {
    return (window.requestAnimationFrame || 
            window.webkitRequestAnimationFrame || 
            function(cb) { return setTimeout(cb, 1000 / 60); })(callback);
  }

  /**
   * Cancel animation frame with fallback
   * @param {number} id - Animation frame ID
   */
  function cancelFrame(id) {
    (window.cancelAnimationFrame || 
     window.webkitCancelAnimationFrame || 
     clearTimeout)(id);
  }

  // Public API
  return {
    lerp,
    clamp,
    fadeIn,
    fadeOut,
    staggeredReveal,
    prefersReducedMotion,
    requestFrame,
    cancelFrame
  };
})();

// Make available globally
window.AnimationUtils = AnimationUtils;
