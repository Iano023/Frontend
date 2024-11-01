let currentPage = 1; // Initialize to page 1
const pageSize = 10; // Number of rows per page
let fullSeminarList = []; // Store all seminar data

document.addEventListener('DOMContentLoaded', () => {
    displayAdminName();
    fetchSeminarData(); // Fetch seminar data when the page loads

    // Add search functionality
    const searchBar = document.getElementById('searchBar');
    searchBar.addEventListener('input', function () {
        const searchTerm = searchBar.value.trim();
        fetchSeminarData(searchTerm); // Fetch filtered data based on search term
    });
});

function displayAdminName() {
    const fullname = localStorage.getItem('fullname'); // Retrieve fullname from localStorage
    const adminNameElement = document.getElementById('adminName');

    if (fullname) {
        adminNameElement.textContent = fullname; // Display fullname
    } else {
        adminNameElement.textContent = 'Admin'; // Default fallback
    }
}

function fetchSeminarData(searchTerm = '') {
    let url = 'https://triqride.onrender.com/api/seminar';

    // If there's a search term, append it to the URL
    if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`;
    }

    fetch(url)  // Fetch seminar data from the backend
        .then(response => response.json())  // Parse the JSON response
        .then(data => {
            console.log(data); // Log the fetched data for debugging

            fullSeminarList = data;  // Store all the seminar data (filtered if search is applied)
            displayPaginatedSeminars();  // Display paginated data
        })
        .catch(error => {
            console.error('Error fetching seminar data:', error);  // Handle fetch errors
        });
}

// Function to display paginated seminar data
function displayPaginatedSeminars() {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, fullSeminarList.length);
    const paginatedData = fullSeminarList.slice(startIndex, endIndex);
    displaySeminars(paginatedData);
    updatePaginationControls();
}

// Function to display the seminar data in the table
function displaySeminars(data) {
    const tableBody = document.querySelector('tbody');
    tableBody.innerHTML = '';

    data.forEach((driver, index) => {
        const rowNumber = index + 1;

        // Assuming driver.Plate_number is available
        const buttonControls = `
    <button class="btn btn-success check-button" data-plate-number="${driver.Plate_number || 'N/A'}">
        <i class="fas fa-check"></i>
    </button>
    <button class="btn btn-danger x-button" data-plate-number="${driver.Plate_number || 'N/A'}">
        <i class="fas fa-times"></i>
    </button>`;

const row = document.createElement('tr');
row.innerHTML = `
    <td><strong>${rowNumber}.</strong></td>
    <td class="text-align">${driver.Driver_name}</td>
    <td class="text-align">${driver.Plate_number}</td>  
    <td class="text-align">
        ${buttonControls}
    </td>
`;
        tableBody.appendChild(row);
    });

    attachButtonListeners();  // Attach listeners after rendering
}

function attachButtonListeners() {
    // Event listener for check buttons (attended)
    const checkButtons = document.querySelectorAll('.check-button');
    checkButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const plateNumber = event.target.closest('button').getAttribute('data-plate-number');
            if (plateNumber) {
                notifySeminarAttendance(plateNumber, true);  // Send attendance notification
            } else {
                console.error('Missing plate number on check button');
            }
        });
    });

    // Event listener for X buttons (did not attend)
    const xButtons = document.querySelectorAll('.x-button');
    xButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const plateNumber = event.target.closest('button').getAttribute('data-plate-number');
            if (plateNumber) {
                notifySeminarAttendance(plateNumber, false);  // Send absence notification
            } else {
                console.error('Missing plate number on X button');
            }
        });
    });
}

function notifySeminarAttendance(plateNumber, attended) {
    console.log('Sending Notification for Plate Number:', plateNumber);

    fetch('https://triqride.onrender.com/api/notify-attendance', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            plateNumber: plateNumber,
            attended: attended
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Notification response:', data);
        if (data.success) {
            alert('Notification sent successfully!');

            // If attended, mark attendance and refresh the list
            if (attended) {
                markDriverAttendance(plateNumber);
            }
        } else {
            alert('Failed to send notification: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error sending notification:', error);
        alert('Error sending notification');
    });
}

function markDriverAttendance(plateNumber) {
    fetch('https://triqride.onrender.com/api/reset-violations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plateNumber: plateNumber }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Attendance mark response:', data);
        if (data.success) {
            alert('Attendance recorded for driver with plate number ' + plateNumber);
            fetchSeminarData();  // Refresh the list to remove attended driver
        } else {
            alert('Failed to record attendance: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error marking attendance:', error);
        alert('Error recording attendance');
    });
}

// Function to update pagination controls
function updatePaginationControls() {
    const pageInfo = document.getElementById('pageInfo');
    pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(fullSeminarList.length / pageSize)}`;

    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === Math.ceil(fullSeminarList.length / pageSize);
}

// Handle previous page button
document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayPaginatedSeminars();
    }
});

// Handle next page button
document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPage < Math.ceil(fullSeminarList.length / pageSize)) {
        currentPage++;
        displayPaginatedSeminars();
    }
});

// Sidebar toggle function (if you want to retain this from the original code)
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

window.addEventListener('load', () => {
    const sessionToken = localStorage.getItem('sessionToken');

    // Redirect to login page if no token is found
    if (!sessionToken) {
        window.location.href = 'index.html';
    } else {
        // Reload the page from the server to avoid showing a cached page after logout
        if (performance.navigation.type === performance.navigation.TYPE_BACK_FORWARD) {
            window.location.reload();
        }
    }
});
