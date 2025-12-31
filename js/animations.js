const AnimationUtils = (function () {
  'use strict';

  function lerp(start, end, t) {
    return start + (end - start) * t;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function fadeIn(element, duration = 500) {
    return new Promise((resolve) => {
      element.style.opacity = '0';
      element.style.display = 'block';
      element.style.transition = `opacity ${duration}ms ease`;
      element.offsetHeight;
      element.style.opacity = '1';
      setTimeout(() => {
        element.style.transition = '';
        resolve();
      }, duration);
    });
  }

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

  function staggeredReveal(elements, options = {}) {
    const { delay = 100, duration = 600, translateY = 30, staggerDelay = 80 } = options;
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
      const totalDuration = delay + (elementsArray.length * staggerDelay) + duration;
      setTimeout(resolve, totalDuration);
    });
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function requestFrame(callback) {
    return (window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (cb) { return setTimeout(cb, 1000 / 60); })(callback);
  }

  function cancelFrame(id) {
    (window.cancelAnimationFrame || window.webkitCancelAnimationFrame || clearTimeout)(id);
  }

  return { lerp, clamp, fadeIn, fadeOut, staggeredReveal, prefersReducedMotion, requestFrame, cancelFrame };
})();

window.AnimationUtils = AnimationUtils;
