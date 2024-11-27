let currentPage = 1;         
const pageSize = 15;          
let fullReportList = [];
let selectedMonth = '';  // Global variable to store the currently selected month


function formatDate(dateTimeString) {
    // Parse the date string assuming it's in Asia/Manila timezone
    const date = moment(dateTimeString).tz('Asia/Manila');
    
    return date.format('MMMM D, YYYY [at] h:mm:ss A');
}

// Display the logged-in admin's name
function displayAdminInfo() {
    // Get stored fullname and role from localStorage
    const fullname = localStorage.getItem('fullname');
    const role = localStorage.getItem('userRole');
    const profileImage = localStorage.getItem('profileImage');

    // Update the display
    adminName.textContent = fullname || 'Unknown';
    adminRole.textContent = role || 'Unknown Role';

    // Check role and control sidebar visibility
    const adminOnlyElements = document.querySelectorAll('.admin-only');
    const profileImg = document.getElementById('adminProfileImage');
    
    if (profileImage) {
        profileImg.src = profileImage; // Firebase Storage URL is already complete
    } else {
        // Set a default profile image using a data URI
        profileImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2NjY2NjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjAgMjF2LTJhNCA0IDAgMCAwLTQtNEg4YTQgNCAwIDAgMC00IDR2MiI+PC9wYXRoPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCI+PC9jaXJjbGU+PC9zdmc+';
    }
    
    // Add error handler for image loading
    profileImg.onerror = function() {
        // Fallback to embedded SVG data URI if the Firebase image fails to load
        this.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2NjY2NjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjAgMjF2LTJhNCA0IDAgMCAwLTQtNEg4YTQgNCAwIDAgMC00IDR2MiI+PC9wYXRoPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCI+PC9jaXJjbGU+PC9zdmc+';
        this.onerror = null; // Prevent infinite loop
    };

    // Hide admin-only elements if the user is not a Head Admin
    if (role !== 'Head Admin') {
        adminOnlyElements.forEach(element => {
            element.style.display = 'none';
        });
    }
}

// Set the report title (Month-Year format)
function setReportTitle(month = '') {
    const reportTitleElement = document.getElementById('report-title');
    const date = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    if (month) {
        reportTitleElement.textContent = `${monthNames[parseInt(month) - 1]} Report - ${date.getFullYear()} `;
    } else {
        const currentMonth = monthNames[date.getMonth()];
        const currentYear = date.getFullYear();
        reportTitleElement.textContent = `${currentMonth} Report - ${currentYear}`;
    }
}

// Toggle the month dropdown visibility when clicking the report title
document.getElementById('report-title').addEventListener('click', function () {
    const monthDropdown = document.getElementById('monthDropdown');
    
    // Toggle the display of the month dropdown
    if (monthDropdown.style.display === 'none' || monthDropdown.style.display === '') {
        monthDropdown.style.display = 'block';
    } else {
        monthDropdown.style.display = 'none';
    }
});

// Add event listeners for the month list items
document.querySelectorAll('#monthList li').forEach(function (item) {
    item.addEventListener('click', function () {
        selectedMonth = this.getAttribute('data-month');  // Update the selected month
        currentPage = 1;

        // Fetch reports for the selected month with an empty search term initially
        fetchReports('', selectedMonth);

        // Update the report title based on the selected month
        setReportTitle(selectedMonth);

        // Hide the dropdown after selection
        document.getElementById('monthDropdown').style.display = 'none';
    });
});

// Fetch all reports from the reportlist table
function fetchReports(searchTerm = '', month = '') {
    const url = new URL('https://triqride.onrender.com/api/reports');

    // Append search query and month filter to the URL if provided
    if (searchTerm) {
        url.searchParams.append('search', searchTerm);
    }
    if (month) {
        url.searchParams.append('month', month);  // Assuming your API accepts a 'month' parameter
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
            fullReportList = data; // Store fetched data for pagination
            displayPaginatedReports(); // Display the paginated reports
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
    tableBody.innerHTML = '';

    const startIndex = (currentPage - 1) * pageSize;

    reports.forEach((report, index) => {
        const row = document.createElement('tr');
        const rowNumber = startIndex + index + 1;
        
        // Format the date using the updated formatDate function
        const formattedDate = formatDate(report.report_datetime);

        row.innerHTML = `
            <td><strong>${rowNumber}.</strong></td>
            <td>${report.Driver_name}</td>
            <td>${report.Plate_number}</td>
            <td>${report.ratings}</td>
            <td>${formattedDate}</td>
            <td>${report.Violations}</td>
            <td>${report.reporter_name}</td>
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
    const searchTerm = this.value.toLowerCase();  // Get the search term from the input field

    // Make the API call to search for reports using the search term and selected month
    fetchReports(searchTerm, selectedMonth);  // Pass both the search term and the month
});

// Call functions when the page loads
window.addEventListener('load', () => {
    displayAdminInfo();  
    fetchReports(); 
    setReportTitle();
});

function exportToExcel() {
    if (fullReportList.length === 0) {
        alert("No data to export");
        return;
    }

    // Prepare data for Excel export
    const dataForExcel = fullReportList.map((report, index) => ({
        'Row Number': index + 1,
        'Owner Name': report.Driver_name,
        'Franchise Number': report.Plate_number,
        'Ratings': report.ratings,
        'Date and Time': report.report_datetime,
        'Report': report.Violations,
        'Reporter':report.reporter_name,
    }));

    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataForExcel);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Report List");

    // Get the selected month and current year
    const monthNames = [
        "January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December"
    ];
    const month = selectedMonth ? monthNames[parseInt(selectedMonth) - 1] : monthNames[new Date().getMonth()];
    const year = new Date().getFullYear();

    // Generate the filename with "Report List for Month Year" format
    const fileName = `Report List for ${month} ${year}.xlsx`;

    // Export to Excel file
    XLSX.writeFile(wb, fileName);
}

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

function loadAdminProfile(userId) {
    // Fetch user profile data from the server
    fetch(`https://triqride.onrender.com/api/getProfile/${userId}`)
        .then((response) => {
            if (!response.ok) {
                return response.json().then((data) => {
                    throw new Error(data.message || "Failed to fetch profile.");
                });
            }
            return response.json();
        })
        .then((data) => {
            // Populate the modal fields with the fetched data
            document.getElementById("editUsername").value = data.username || "";
            document.getElementById("editFullname").value = data.fullname || "";
            document.getElementById("editPassword").value = ""; // Leave password field blank
        })
        .catch((error) => {
            console.error("Error loading profile:", error.message);
        });
}
// Submit updated profile
function saveProfileChanges(userId) {
    const username = document.getElementById("editUsername").value;
    const fullname = document.getElementById("editFullname").value;
    const password = document.getElementById("editPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Basic validation
    if (!username || !fullname || !password || !confirmPassword) {
        alert("All fields are required.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    // Update profile via PUT request
    fetch(`https://triqride.onrender.com/api/editProfile/${userId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, fullname, password }),
    })
        .then((response) => {
            if (response.ok) {
                // Update the fullname in localStorage
                localStorage.setItem("fullname", fullname);

                // Update the display
                displayAdminInfo();

                // Close the modal
                const editProfileModal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
                editProfileModal.hide();

                alert("Profile updated successfully.");
            } else {
                return response.json().then((data) => {
                    alert(data.message || "Failed to update profile.");
                });
            }
        })
        .catch((error) => {
            console.error("Error updating profile:", error);
        });
}


document.querySelector('[data-bs-target="#editProfileModal"]').addEventListener("click", () => {
    const userId = sessionStorage.getItem('headAdminId') || localStorage.getItem('userId'); // Retrieve the user ID from storage
    if (userId) {
        loadAdminProfile(userId);
    } else {
        console.error("User ID not found in storage");
    }
});

// Add event listener for save button
document.getElementById("saveProfileChangesButton").addEventListener("click", () => {
    const userId = sessionStorage.getItem('headAdminId') || localStorage.getItem('userId'); // Retrieve the user ID from storage
    if (userId) {
        saveProfileChanges(userId);
    } else {
        console.error("User ID not found in storage");
    }
});

document.querySelector('.toggle-password-visibility').addEventListener('click', () => {
    const passwordField = document.getElementById('editPassword');
    const toggleIcon = document.getElementById('togglePasswordIcon');
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleIcon.classList.remove('bi-eye-slash');
        toggleIcon.classList.add('bi-eye');
    } else {
        passwordField.type = 'password';
        toggleIcon.classList.remove('bi-eye');
        toggleIcon.classList.add('bi-eye-slash');
    }
});

document.querySelector('.toggle-confirm-password-visibility').addEventListener('click', () => {
    const confirmPasswordField = document.getElementById('confirmPassword');
    const toggleConfirmIcon = document.getElementById('toggleConfirmPasswordIcon');
    if (confirmPasswordField.type === 'password') {
        confirmPasswordField.type = 'text';
        toggleConfirmIcon.classList.remove('bi-eye-slash');
        toggleConfirmIcon.classList.add('bi-eye');
    } else {
        confirmPasswordField.type = 'password';
        toggleConfirmIcon.classList.remove('bi-eye');
        toggleConfirmIcon.classList.add('bi-eye-slash');
    }
});

function logout() {
    localStorage.removeItem('sessionToken');
    sessionStorage.removeItem('headAdminId');
    localStorage.removeItem('userId');

    // Clear browser cache to prevent back navigation to cached pages
    if ('caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
        });
    }

    // Redirect to login page and prevent back button from returning to protected pages
    window.location.replace('index.html');
}

window.addEventListener('load', () => {
    const sessionToken = localStorage.getItem('sessionToken');

    if (!sessionToken) {
        // Redirect to login if no token is found
        window.location.replace('index.html');
    } else {
        // Prevent back navigation to this page if logged out
        window.history.pushState(null, '', window.location.href);
        window.onpopstate = function () {
            if (!localStorage.getItem('sessionToken')) {
                window.location.replace('index.html');
            }
        };
    }
});
