// Elements
const approvalTableBody = document.getElementById("approval-table-body");
const successMessage = document.getElementById("success-message");
const errorMessage = document.getElementById("error-message");
const adminName = document.getElementById("adminName");
const adminRole = document.getElementById("adminRole");

// Assuming `headAdminId` is stored in sessionStorage after login
const headAdminId = sessionStorage.getItem('headAdminId');

function displayAdminInfo() {
    const fullname = localStorage.getItem('fullname');
    const role = localStorage.getItem('userRole');
    adminName.textContent = fullname || 'Unknown';
    adminRole.textContent = role || 'Unknown Role';
}

// Fetch pending admins
async function fetchPendingAdmins() {
    try {
        approvalTableBody.innerHTML = '<tr><td colspan="4"><div class="spinner-border text-primary"></div></td></tr>';

        const response = await fetch('https://triqride.onrender.com/pending-admins');
        const admins = await response.json();

        if (admins.length === 0) {
            approvalTableBody.innerHTML = '<tr><td colspan="4" class="text-muted">No pending approvals</td></tr>';
        } else {
            approvalTableBody.innerHTML = '';
            admins.forEach((admin, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>${index + 1}.</strong></td>
                    <td>${admin.fullname}</td>
                    <td>${admin.username}</td>
                    <td>
                        <button class="btn btn-success btn-sm" onclick="approveAdmin(${admin.id})">Approve</button>
                        <button class="btn btn-danger btn-sm" onclick="denyAdmin(${admin.id})">Deny</button>
                    </td>
                `;
                approvalTableBody.appendChild(row);
            });
        }
    } catch (err) {
        console.error("Error fetching pending admins:", err);
        showError("Failed to load pending admins.");
    }
}

// Approve admin
async function approveAdmin(adminId) {
    const headAdminId = sessionStorage.getItem('headAdminId');
    console.log("Head Admin ID:", headAdminId);
    try {
        const response = await fetch(`https://triqride.onrender.com/approve-admin/${adminId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'headAdminId': headAdminId // Pass as a header
            }
        });

        const result = await response.json();
        if (response.ok) {
            showSuccess(result.message);
            fetchPendingAdmins();
        } else {
            showError(result.message);
        }
    } catch (err) {
        showError("Error approving admin.");
        console.error("Approve Error:", err);
    }
}

// Deny admin
async function denyAdmin(adminId) {
    const headAdminId = sessionStorage.getItem('headAdminId');
    console.log("Head Admin ID:", headAdminId);
    try {
        const response = await fetch(`https://triqride.onrender.com/deny-admin/${adminId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'headAdminId': headAdminId // Pass as a header
            }
        });

        const result = await response.json();
        if (response.ok) {
            showSuccess(result.message);
            fetchPendingAdmins();
        } else {
            showError(result.message);
        }
    } catch (err) {
        showError("Error denying admin.");
        console.error("Deny Error:", err);
    }
}

// Show success message
function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    setTimeout(() => { successMessage.style.display = 'none'; }, 3000);
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => { errorMessage.style.display = 'none'; }, 3000);
}

// Load data on page load
window.addEventListener('load', () => {
    displayAdminInfo();
    fetchPendingAdmins();
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