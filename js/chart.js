function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const sidebarOptions = document.getElementById('sidebar-options');

    sidebar.classList.toggle('expanded');
    mainContent.classList.toggle('shifted');
    sidebarOptions.classList.toggle('hidden');
    sidebarOptions.classList.toggle('open');
}

// Display admin name
function displayAdminInfo() {
    const username = localStorage.getItem('username'); // Get the username
    const fullname = localStorage.getItem('fullname'); // Get the full name
    const role = localStorage.getItem('userRole');
    const profileImage = localStorage.getItem('profileImage');

    // Update the greeting and full name
    const adminFullnameElement = document.getElementById('adminFullname');
    adminFullnameElement.textContent = fullname || ''; // Set the full name or leave empty if not available

    // Update the admin name and role
    adminName.textContent = username || 'Unknown'; // Set the username
    adminRole.textContent = role || 'Unknown Role';

    // Profile image handling
    const profileImg = document.getElementById('adminProfileImage');
    if (profileImage) {
        profileImg.src = profileImage;
    } else {
        profileImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2NjY2NjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjAgMjF2LTJhNCA0IDAgMCAwLTQtNEg4YTQgNCAwIDAgMC00IDR2MiI+PC9wYXRoPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCI+PC9jaXJjbGU+PC9zdmc+';
    }

    profileImg.onerror = function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2NjY2NjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjAgMjF2LTJhNCA0IDAgMCAwLTQtNEg4YTQgNCAwIDAgMC00IDR2MiI+PC9wYXRoPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCI+PC9jaXJjbGU+PC9zdmc+';
        this.onerror = null; // Prevent infinite loop
    };

    // Display the current date in Asia/Manila timezone
    const currentDateElement = document.getElementById('currentDate');
    const currentTimeElement = document.getElementById('currentTime');
    const now = new Date();

    // Convert to Asia/Manila timezone
    const dateOptions = { timeZone: 'Asia/Manila', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    
    const manilaDate = new Intl.DateTimeFormat('en-PH', dateOptions).format(now);
    const manilaTime = new Intl.DateTimeFormat('en-PH', timeOptions).format(now);
    
    currentDateElement.textContent = manilaDate;
    currentTimeElement.textContent = manilaTime;

    // Role-based visibility control
    const adminOnlyElements = document.querySelectorAll('.admin-only');
    if (role !== 'Head Admin') {
        adminOnlyElements.forEach(element => {
            element.style.display = 'none';
        });
    }

    // Update time every second
    setInterval(() => {
        const now = new Date();
        const manilaTime = new Intl.DateTimeFormat('en-PH', timeOptions).format(now);
        currentTimeElement.textContent = manilaTime;
    }, 1000);
}

// Chart configurations
const chartConfigs = {
    reports: {
        type: 'bar',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                title: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Reports'
                    },
                    ticks: {
                        stepSize: 10,
                        precision: 0,
                        maxTicksLimit: 50
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Month'
                    }
                }
            }
        }
    },
    seminars: {
        type: 'bar',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                title: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Attendees'
                    },
                    ticks: {
                        stepSize: 10,
                        precision: 0,
                        maxTicksLimit: 50
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Month'
                    }
                }
            }
        }
    }
};

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    fetchData();
    displayAdminInfo();

    // Uncomment to enable automatic updates every 5 minutes
    setInterval(fetchData, 1 * 60 * 1000);
});


// Fetch Data from API and Update Dashboard
async function fetchData() {
    try {
        // Fetch reports data
        const reportsResponse = await fetch('https://triqride.onrender.com/api/reports');
        const reportsData = await reportsResponse.json();

        // Fetch seminars data
        const seminarsResponse = await fetch('https://triqride.onrender.com/api/seminar-attendance');
        const seminarsData = await seminarsResponse.json();

        // Process the fetched data to update the dashboard
        updateDashboard(reportsData, seminarsData);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Update Dashboard with New Data
function updateDashboard(reportsData, seminarsData) {
    // Filter reports with violations for counting purposes only
    const reportsWithViolations = reportsData.filter(report => {
        return report.Violations && report.Violations.trim() !== '';
    });
    console.log('Raw API response:', reportsData);
    console.log('Filtered reports:', reportsWithViolations);

    // Use all reports for rating calculation
    const avgRating = calculateAverageRating(reportsData);

    // Use filtered reports for violation-related counts
    const totalReports = reportsWithViolations.length;
    const recentReports = reportsWithViolations.filter(report => isRecent(report.report_datetime)).length;
    const monthlyReportsData = aggregateMonthlyData(reportsWithViolations, 'report_datetime');

    // Update reports stats in the HTML
    document.getElementById('totalReports').textContent = totalReports;
    document.getElementById('avgRating').textContent = avgRating.toFixed(1);
    document.getElementById('recentReports').textContent = recentReports;

    // Update reports chart
    updateChart('reportsChart', monthlyReportsData.labels, monthlyReportsData.data, 'Monthly Reports');

    // Process seminar attendance data
    const totalAttendees = seminarsData.reduce((sum, record) => sum + record.attendees, 0);
    const monthlySeminarsData = {
        labels: seminarsData.map(record => record.month),
        data: seminarsData.map(record => record.attendees)
    };

    // Update seminars stats in the HTML
    document.getElementById('totalAttendees').textContent = totalAttendees;

    // Update seminars chart
    updateChart('seminarChart', monthlySeminarsData.labels, monthlySeminarsData.data, 'Monthly Attendees');
}

// Update Stats HTML Elements
function updateStats() {
    document.getElementById('totalReports').textContent = data.reports.total || 0;
    document.getElementById('avgRating').textContent = (data.reports.avgRating || 0).toFixed(2);
    document.getElementById('recentReports').textContent = data.reports.recentReports || 0;
    document.getElementById('totalAttendees').textContent = data.seminars.totalAttendees || 0;
}

// Calculate Average Rating from Reports Data
function calculateAverageRating(reports) {
    const totalRatings = reports.reduce((sum, report) => sum + parseFloat(report.ratings || 0), 0);
    return reports.length ? totalRatings / reports.length : 0;
}

// Check if a Report is Recent (e.g., last 30 days)
function isRecent(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60); // Difference in hours
    return diffHours <= 24; // 24 hours = 1 day
}

// Aggregate Monthly Data (labels and data arrays)
function aggregateMonthlyData(data, dateField) {
    const monthlyData = {};
    data.forEach(item => {
        const month = new Date(item[dateField]).getMonth();
        monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    console.log('Aggregated data:', monthlyData);
    return {
        labels: Object.keys(monthlyData).map(month => new Date(0, month).toLocaleString('en', { month: 'short' })),
        data: Object.values(monthlyData)
    };
}

// Update Chart with New Data
function updateChart(chartId, labels, data, label) {
    const chartElement = document.getElementById(chartId);
    const chartInstance = Chart.getChart(chartElement);

    // Round the data to whole numbers
    const roundedData = data.map(value => Math.round(value));

    if (chartInstance) {
        chartInstance.data.labels = labels;
        chartInstance.data.datasets[0].data = roundedData;
        chartInstance.update();
    } else {
        new Chart(chartElement, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: roundedData,
                    backgroundColor: chartId === 'reportsChart' ? '#FF5349' : '#4BB543'
                }]
            },
            options: chartConfigs[chartId === 'reportsChart' ? 'reports' : 'seminars'].options
        });
    }
}

// Tab Switching Functionality
function initializeTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });
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
                resetPasswordFields();
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

function resetPasswordFields() {
    const passwordField = document.getElementById("editPassword");
    const confirmPasswordField = document.getElementById("confirmPassword");
    const togglePasswordIcon = document.getElementById("togglePasswordIcon");
    const toggleConfirmPasswordIcon = document.getElementById("toggleConfirmPasswordIcon");

    // Clear the password fields
    passwordField.value = "";
    confirmPasswordField.value = "";

    // Reset visibility to obscure
    passwordField.type = "password";
    confirmPasswordField.type = "password";

    // Reset toggle icons
    togglePasswordIcon.classList.remove("bi-eye");
    togglePasswordIcon.classList.add("bi-eye-slash");

    toggleConfirmPasswordIcon.classList.remove("bi-eye");
    toggleConfirmPasswordIcon.classList.add("bi-eye-slash");
}

document.getElementById('editProfileModal').addEventListener('hidden.bs.modal', () => {
    resetPasswordFields();
});


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
