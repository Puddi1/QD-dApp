// JavaScript for toggling the sidebar menu
let toggleButton = document.getElementById("toggle-button");
let sidebar = document.getElementById('sidebar');
let centerBar = document.getElementById('center-bar');
let sidebarVisible = false;

toggleButton.addEventListener('click', () => {
    if (!sidebarVisible) {
        sidebar.classList.add('visible');
        centerBar.classList.add('visible');
        toggleButton.classList.add('visible');
        sidebarVisible = true;
    } else {
        sidebar.classList.remove('visible');
        centerBar.classList.remove('visible');
        toggleButton.classList.remove('visible');
        sidebarVisible = false;
    }
});

// Reduce the background opacity if bacdrop filter isn't present
if (!window.CSS.supports('backdrop-filter', 'blur(10px)')) {
    sidebar.style.backgroundImage = "linear-gradient(rgb(75, 0, 0, 0.9), rgba(50, 0, 0, 0.5))";
}