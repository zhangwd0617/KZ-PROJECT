window.addEventListener('DOMContentLoaded', () => {
    UI.init();
    window.G = new Game();
    G.setState('TITLE');
});
