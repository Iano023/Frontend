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
function displayAdminName() {
    const fullname = localStorage.getItem('fullname');
    const adminNameElement = document.getElementById('adminName');
    adminNameElement.textContent = fullname || 'Admin';
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
                        precision: 0, // This ensures no decimal places
                        stepSize: 1   // Ensures steps of 1
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
                        precision: 0, // This ensures no decimal places
                        stepSize: 1   // Ensures steps of 1
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
    displayAdminName();

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

    // Use all reports for rating calculation
    const avgRating = calculateAverageRating(reportsData);  // Using original reportsData here

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
    document.getElementById('recentSeminars').textContent = seminarsData.length;

    // Update seminars chart
    updateChart('seminarChart', monthlySeminarsData.labels, monthlySeminarsData.data, 'Monthly Attendees');
}

// Update Stats HTML Elements
function updateStats() {
    document.getElementById('totalReports').textContent = data.reports.total || 0;
    document.getElementById('avgRating').textContent = (data.reports.avgRating || 0).toFixed(2);
    document.getElementById('recentReports').textContent = data.reports.recentReports || 0;

    document.getElementById('totalAttendees').textContent = data.seminars.totalAttendees || 0;
    document.getElementById('recentSeminars').textContent = data.seminars.recentSeminars || 0;
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

function logout() {
    localStorage.removeItem('sessionToken');

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




