let currentPage = 1;         
const pageSize = 14;          
let fullReportList = [];

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

// Fetch all reports from the reportlist table
function fetchReports(searchTerm = '') {
    const url = new URL('https://triqride.onrender.com/api/reports');

    // Append search query to the URL if a search term is provided
    if (searchTerm) {
        url.searchParams.append('search', searchTerm);
    }
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            displayReports(data);
            fullReportList = data;
            displayPaginatedReports();

        })
        .catch(error => {
            console.error('Error fetching reports:', error);
        });
}

// Display paginated reports
function displayPaginatedReports() {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, fullReportList.length);
    const paginatedData = fullReportList.slice(startIndex, endIndex);
    displayReports(paginatedData);
    updatePaginationControls();
}

// Display fetched reports in the table
function displayReports(reports) {
    const tableBody = document.querySelector('tbody');
    tableBody.innerHTML = ''; // Clear any existing rows

    reports.forEach(report => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td><strong>${report.id}.</strong></td>
            <td>${report.Driver_name}</td>  <!-- Driver's name from DB -->
            <td>${report.Plate_number}</td> <!-- Plate number from DB -->
            <td>${report.ratings}</td>       <!-- Ratings from DB -->
            <td>${new Date(report.report_datetime).toLocaleString()}</td>  <!-- Date and Time of report -->
            <td>${report.Violations}</td>     <!-- Violations from DB -->
        `;

        tableBody.appendChild(row);
    });
}    

// Update the pagination controls
function updatePaginationControls() {
    const pageInfo = document.getElementById('pageInfo');
    pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(fullReportList.length / pageSize)}`;

    // Disable/enable pagination buttons based on current page
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === Math.ceil(fullReportList.length / pageSize);
}

// Event listener for pagination buttons
document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayPaginatedReports();
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPage < Math.ceil(fullReportList.length / pageSize)) {
        currentPage++;
        displayPaginatedReports();
    }
});


// Event listener for the search bar using 'keyup'
document.getElementById('searchBar').addEventListener('keyup', function() {
    const searchTerm = this.value.toLowerCase(); // Get the search term from the input field

    // Make the API call to search for reports using the search term
    fetch(`https://triqride.onrender.com/api/reports?search=${encodeURIComponent(searchTerm)}`, { mode: 'cors' })
        .then(response => response.json())
        .then(data => {
            displayReports(data); // Display the results in the table
            fullReportList = data;  // Store search results in fullReportList
            currentPage = 1;  // Reset to first page for search results
            displayPaginatedReports();  // Display the search results
            
        })
        .catch(error => {
            console.error('Error fetching reports:', error);
        });
});

// Call functions when the page loads
window.addEventListener('load', () => {
    displayAdminName();  
    fetchReports(); // Fetch and display all reports when the page loads
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
