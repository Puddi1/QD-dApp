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