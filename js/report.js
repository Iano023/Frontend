// Display the logged-in admin's name
function displayAdminName() {
    const fullname = localStorage.getItem('fullname');
    const adminNameElement = document.getElementById('adminName');

    if (fullname) {
        adminNameElement.textContent = fullname;
    } else {
        adminNameElement.textContent = 'Admin'; // Default fallback
    }
}

// Set the report title (Month-Year format)
function setReportTitle() {
    const reportTitleElement = document.getElementById('report-title');
    const date = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = monthNames[date.getMonth()];
    const currentYear = date.getFullYear();
    
    reportTitleElement.textContent = `${currentMonth} Report - ${currentYear}`;
}

window.addEventListener('load', () => {
    displayAdminName();  
    fetchReports(); // Fetch and display reports when the page loads
    setReportTitle();
});

// Function to toggle sidebar visibility
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const sidebarOptions = document.getElementById('sidebar-options');

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

// Logout function
function logout() {
    window.location.href = 'index.html';
}

// Fetch reports from the backend API and display them in the table
function fetchReports() {
    fetch('https://triqride.onrender.com/api/reports') // Adjust the API URL accordingly
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
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

document.getElementById('searchBar').addEventListener('keyup', function() {
    const searchTerm = this.value.toLowerCase(); // Get the search term and convert to lower case
    const rows = document.querySelectorAll('#driverlistData tr'); // Get all rows in the table body

    rows.forEach(row => {
        const cells = row.getElementsByTagName('td'); // Get all cells in the row
        let match = false;

        // Check the "Franchise Number" column, which is typically the second column (index 1)
        if (cells.length > 1 && cells[1].textContent.toLowerCase().includes(searchTerm)) {
            match = true; // Match found in the Franchise Number column
        }

        // Show or hide the row based on whether a match was found
        if (match) {
            row.style.display = ''; // Show the row
        } else {
            row.style.display = 'none'; // Hide the row
        }
    });
});

// Display fetched reports in the table
function displayReports(reports) {
    const tableBody = document.querySelector('tbody');
    tableBody.innerHTML = ''; // Clear any existing rows

    reports.forEach(report => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${report.Driver_name}</td>  <!-- Driver's name from DB -->
            <td>${report.Plate_number}</td> <!-- Plate number from DB -->
            <td>${report.ratings}</td>       <!-- Ratings from DB -->
            <td>${new Date(report.report_datetime).toLocaleString()}</td>  <!-- Date and Time of report -->
            <td>${report.Violations}</td>     <!-- Violations from DB -->
        `;

        tableBody.appendChild(row);
    });
}    
