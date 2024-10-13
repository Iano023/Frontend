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
    fetchReports(); // Fetch and display reports when the page loads
});

function setReportTitle() {
    const reportTitleElement = document.getElementById('report-title');
    const date = new Date();
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const currentMonth = monthNames[date.getMonth()];
    const currentYear = date.getFullYear();
    
    // Set the title to show the current month and year
    reportTitleElement.textContent = `${currentMonth} Report - ${currentYear}`;
}

// Call the function when the page loads
setReportTitle();

function logout() {
    window.location.href = 'index.html'; 
}

// Toggle sidebar visibility
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const sidebarOptions = document.getElementById('sidebar-options');

    // Toggle the width of the sidebar
    if (sidebar.classList.contains('expanded')) {
        sidebar.classList.remove('expanded');
        mainContent.classList.remove('shifted');
    } else {
        sidebar.classList.add('expanded');
        mainContent.classList.add('shifted');
    }

    // Toggle the dropdown menu
    if (sidebarOptions.classList.contains('open')) {
        sidebarOptions.classList.remove('open');
        sidebarOptions.classList.add('hidden');
    } else {
        sidebarOptions.classList.add('open');
        sidebarOptions.classList.remove('hidden');
    }
}

// Fetch reports from the backend and display them
function fetchReports() {
    fetch('https://triqride.onrender.com/api/reports') // Update this URL to match your endpoint
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            displayReports(data);
        })
        .catch(error => {
            console.error('Error fetching reports:', error);
        });
}

// Display the fetched reports in the table
function displayReports(reports) {
    const tableBody = document.querySelector('tbody');
    tableBody.innerHTML = ''; // Clear the existing rows

    reports.forEach(report => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${report.owner}</td>
            <td>${report.franchiseNumber}</td>
            <td>${report.ratings}</td>
            <td>${new Date(report.report_datetime).toLocaleString()}</td>
            <td>${report.violations}</td>
        `;

        tableBody.appendChild(row);
    });
}
