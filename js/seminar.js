function displayAdminName() {
    const fullname = localStorage.getItem('fullname'); // Retrieve fullname from localStorage
    const adminNameElement = document.getElementById('adminName');

    if (fullname) {
        adminNameElement.textContent = fullname; // Display fullname
    } else {
        adminNameElement.textContent = 'Admin'; // Default fallback
    }
}

window.addEventListener('load', () => {
    displayAdminName();  
    
});


function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const sidebarOptions = document.getElementById('sidebar-options');

    // Toggle the 'expanded' class on the sidebar
    if (sidebar.classList.contains('expanded')) {
        sidebar.classList.remove('expanded');
        mainContent.classList.remove('shifted');
    } else {
        sidebar.classList.add('expanded');
        mainContent.classList.add('shifted');
    }

     if (sidebarOptions.classList.contains('open')) {
        sidebarOptions.classList.remove('open');
        sidebarOptions.classList.add('hidden');
    } else {
        sidebarOptions.classList.add('open');
        sidebarOptions.classList.remove('hidden');
    }
}
