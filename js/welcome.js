(function () {
    'use strict';

    const welcomeScreen = document.getElementById('welcomeScreen');
    const mainContent = document.getElementById('mainContent');

    if (!welcomeScreen || !mainContent) return;

    setTimeout(() => {
        welcomeScreen.classList.add('fade-out');
        setTimeout(() => {
            mainContent.style.opacity = '1';
            mainContent.style.transition = 'opacity 0.8s ease';
        }, 300);
        setTimeout(() => { welcomeScreen.remove(); }, 1000);
    }, 2500);
})();
