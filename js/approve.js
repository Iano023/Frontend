const approvalTableBody = document.getElementById("approval-table-body");
const successMessage = document.getElementById("success-message");
const errorMessage = document.getElementById("error-message");
const adminName = document.getElementById("adminName");
const adminRole = document.getElementById("adminRole");

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
}

// Fetch pending admins
async function fetchPendingAdmins() {
    try {
        approvalTableBody.innerHTML = '<tr><td colspan="5"><div class="spinner-border text-primary"></div></td></tr>';

        const response = await fetch('https://triqride.onrender.com/pending-admins');
        const admins = await response.json();

        if (admins.length === 0) {
            approvalTableBody.innerHTML = '<tr><td colspan="5" class="text-muted">No pending approvals</td></tr>';
        } else {
            approvalTableBody.innerHTML = '';
            admins.forEach((admin, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>${index + 1}.</strong></td>
                    <td>
                        ${admin.profile_image ? 
                            `<img src="${admin.profile_image}" 
                                class="img-thumbnail admin-thumbnail" 
                                style="width: 100px; height: 100px; object-fit: cover;"
                                onclick="showImagePreview('${admin.profile_image}', '${admin.fullname}', '${admin.username}')"
                                alt="${admin.fullname}'s profile"
                            >` : 
                            'No image'}
                    </td>
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

// Add these new functions for image preview
function showImagePreview(imageSrc, fullname, username) {
    const modal = document.getElementById('imagePreviewModal');
    const previewImage = document.getElementById('previewImage');
    const previewName = document.getElementById('previewName');
    const previewUsername = document.getElementById('previewUsername');

    previewImage.src = imageSrc;
    previewName.textContent = `Full name: ${fullname}`;
    previewUsername.textContent = `Username: ${username}`;
    modal.style.display = 'block';

    // Add event listener for closing preview
    document.querySelector('.close-preview').onclick = () => {
        modal.style.display = 'none';
    };

    // Close preview when clicking outside the image
    modal.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // Close preview with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            modal.style.display = 'none';
        }
    });
}

// Approve admin
async function approveAdmin(adminId) {
    const headAdminId = sessionStorage.getItem('headAdminId');
    try {
        const response = await fetch(`https://triqride.onrender.com/approve-admin/${adminId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'headAdminId': headAdminId
            }
        });

        const result = await response.json();
        if (response.ok) {
            showSuccess(result.message);
            fetchPendingAdmins();
        } else {
            showError(result.message || 'Failed to approve admin');
        }
    } catch (err) {
        console.error("Approve Error:", err);
        showError("Error approving admin.");
    }
}

// Deny admin
async function denyAdmin(adminId) {
    const headAdminId = sessionStorage.getItem('headAdminId');
    try {
        const response = await fetch(`https://triqride.onrender.com/deny-admin/${adminId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'headAdminId': headAdminId
            }
        });

        const result = await response.json();
        if (response.ok) {
            showSuccess(result.message);
            fetchPendingAdmins();
        } else {
            showError(result.message || 'Failed to deny admin');
        }
    } catch (err) {
        console.error("Deny Error:", err);
        showError("Error denying admin.");
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

// Toggle sidebar function
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const sidebarOptions = document.getElementById('sidebar-options');

    sidebar.classList.toggle('expanded');
    mainContent.classList.toggle('shifted');
    sidebarOptions.classList.toggle('open');
    sidebarOptions.classList.toggle('hidden');
}

// Session check and page load
window.addEventListener('load', () => {
    const sessionToken = localStorage.getItem('sessionToken');
    
    if (!sessionToken) {
        window.location.replace('index.html');
    } else {
        window.history.pushState(null, '', window.location.href);
        window.onpopstate = function () {
            if (!localStorage.getItem('sessionToken')) {
                window.location.replace('index.html');
            }
        };
        
        displayAdminInfo();
        fetchPendingAdmins();
    }
});
