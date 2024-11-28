let currentPage = 1;
const pageSize = 10;
let fullDriverList = [];
let originalData = {}; // Store original data
let currentEditingId = null; // Track the currently editing driver ID
let isEditMode = false;

const submit = document.querySelector('#submit');
const imageUpload = document.querySelector("#imageUpload");
const imagePreview = document.querySelector("#imagePreview");



// Function to display admin info
function displayAdminInfo() {
    // Get stored fullname and role from localStorage
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('userRole');
    const profileImage = localStorage.getItem('profileImage');

    // Update the display
    adminName.textContent = username || 'Unknown';
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
    profileImg.onerror = function () {
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

window.addEventListener('load', () => {
    displayAdminInfo();
    getUsers();
});

// Handle image file input change event
imageUpload.addEventListener("change", (event) => {
    const file = event.target.files[0];
    const allowedFileTypes = ['image/jpeg', 'image/png'];

    if (file) {
        if (!allowedFileTypes.includes(file.type)) {
            alert('Please upload a valid image file (JPEG/PNG).');
            imageUpload.value = "";
            imagePreview.src = "";
            imagePreview.style.display = "none";
            return;
        }
        const reader = new FileReader();

        reader.onload = function (e) {
            imagePreview.src = e.target.result; // Set the source to the loaded file
            imagePreview.style.display = "block"; // Show the image preview
        }

        reader.readAsDataURL(file);
    }
});
async function createPlaceholderImage() {
    try {
        // Use a base64 string for a simple placeholder image instead of trying to fetch a file
        const base64Data = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

        // Convert base64 to blob
        const response = await fetch(base64Data);
        const blob = await response.blob();
        return new File([blob], 'placeholder.jpg', { type: 'image/jpeg' });
    } catch (error) {
        console.error('Error creating placeholder image:', error);
        return null;
    }
}

// Handle form submission
document.querySelector('#submit-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const plateNumber = document.querySelector('#plate').value.trim();
    const driverName = document.querySelector('#driver').value.trim();
    const brgy = document.querySelector('#brgy').value.trim();

    // Validate required fields
    if (!plateNumber || !driverName || !brgy) {
        alert('Please fill in all required fields.');
        return;
    }

    // Check if plate number already exists in the driver list
    const isDuplicate = fullDriverList.some(driver => driver.Plate_number === plateNumber);
    if (isDuplicate) {
        alert('This Franchise Number already exists.');
        return;
    }

    const formData = new FormData();
    formData.append('plate', plateNumber);
    formData.append('driver', driverName);
    formData.append('brgy', brgy);

    // Skip image upload and use a flag in the image field
    if (imageUpload.files[0]) {
        formData.append('image', imageUpload.files[0]);
    } else {
        formData.append('image', 'no_image'); // This will be handled as a special case
    }

    try {
        const response = await fetch('https://triqride.onrender.com/api/list', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to add record');
        }

        if (data.msg) {
            alert('Record added successfully!');
            location.reload();
        } else {
            throw new Error('Failed to add record');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Error adding record: ${error.message}`);
    }
});

// Fetch and display all users
function getUsers() {
    fetch('https://triqride.onrender.com/api/list/', { mode: 'cors' })
        .then(response => response.json())
        .then(data => {
            fullDriverList = data;  // Store the full list of drivers
            displayPaginatedUsers();  // Display the paginated list of users
        })
        .catch(error => {
            console.error('Error fetching driver list:', error);
        });
}

function displayPaginatedUsers() {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, fullDriverList.length);
    const paginatedData = fullDriverList.slice(startIndex, endIndex);
    displayUsers(paginatedData);
    updatePaginationControls();
}

function updateStarRating(rating) {
    const stars = document.querySelectorAll('#modalStarRating .star');
    stars.forEach(star => {
        const value = parseInt(star.getAttribute('data-value'));
        if (value <= rating) {
            star.classList.add('selected');
        } else {
            star.classList.remove('selected');
        }
    });
}

// Display user data in a table
function displayUsers(data) {
    let html = "";
    const startIndex = (currentPage - 1) * pageSize;

    data.forEach((element, index) => {
        // Calculate the sequential row number
        const rowNumber = startIndex + index + 1;

        // Check if image exists and create appropriate HTML
        const imageHtml = element.Image
            ? `<img class="clickable-image" src="${element.Image}" alt="Driver Image" style="max-width: 100px; height: auto;" />`
            : `<div class="no-image-placeholder">No Image Available</div>`;

        html += `
            <tr>
                <td><strong>${rowNumber}.</strong></td>
                <td class="text-align">
                    ${imageHtml}
                </td>
                <td class="text-center">${element.Driver_name}</td>
                <td class="text-center">${element.Plate_number}</td>
                <td class="text-center">
                    <button class="btn custom-orange-btn profile-preview-btn" 
                            data-driver="${element.Driver_name}" 
                            data-franchise="${element.Plate_number}" 
                            data-barangay="${element.Barangay}" 
                            data-image="${element.Image || ''}" 
                            data-overall-rating="${element.averageRating ? element.averageRating.toFixed(2) : 'Not available'}">
                        Preview Profile
                    </button>
                </td>
                <td class="text-center">
                    <button class="btn btn-success download-qr-btn" data-id="${element.id}">
                        <i class="fas fa-download"></i> Download QR
                    </button>
                </td>
            </tr>`;
    });
    document.querySelector('tbody').innerHTML = html;

    // Reattach image click event listeners here
    document.querySelectorAll('.clickable-image').forEach(img => {
        img.addEventListener('click', (event) => {
            const imgSrc = event.target.src; // Get the clicked image's source
            const modalImage = document.querySelector('#previewImage'); // Select the image inside the modal
            modalImage.src = imgSrc; // Set the modal image source

            // Create a new bootstrap modal instance and show the modal
            const modal = new bootstrap.Modal(document.getElementById('imageModal'));
            modal.show(); // Show the modal
        });
    });

    // Add event listeners for profile preview buttons
    document.querySelectorAll('.profile-preview-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const franchiseNumber = event.target.getAttribute('data-franchise');

            // Fetch driver and report details
            fetch(`https://triqride.onrender.com/api/driver/${franchiseNumber}`, { mode: 'cors' })
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.data) {
                        const driverData = data.data;
                        currentEditingId = driverData.id; // Store the current driver ID

                        // Store original data
                        originalData = {
                            Driver_name: driverData.Driver_name,
                            Plate_number: driverData.Plate_number,
                            Barangay: driverData.Barangay
                        };

                        // Update basic modal information
                        document.getElementById('modalOwnerName').textContent = driverData.Driver_name;
                        document.getElementById('modalFranchiseNumber').textContent = driverData.Plate_number;
                        document.getElementById('modalBarangay').textContent = driverData.Barangay;

                        // Handle image display in modal
                        const modalImage = document.getElementById('modalDriverImage');
                        // Remove any existing no-image message
                        const existingMessage = document.querySelector('.no-image-message');
                        if (existingMessage) {
                            existingMessage.remove();
                        }

                        if (driverData.Image) {
                            modalImage.src = driverData.Image;
                            modalImage.style.display = 'block';
                        } else {
                            modalImage.style.display = 'none';
                            // Add a message when no image is available
                            modalImage.insertAdjacentHTML('afterend',
                                '<div class="no-image-message">No Image Available</div>');
                        }

                        // Handle ratings
                        const overallRating = driverData.averageRating ? driverData.averageRating.toFixed(2) : 'Not available';
                        const ratingCount = driverData.ratingCount || 0;

                        document.getElementById('modalOverallRating').textContent = overallRating;
                        document.getElementById('modalRatingCount').textContent = ratingCount;

                        // Update star rating visually
                        updateStarRating(Math.round(driverData.averageRating || 0));

                        // Process violations
                        const violationHistory = driverData.ViolationHistory ? driverData.ViolationHistory.split(', ') : [];
                        const validViolations = violationHistory.filter(violation => {
                            const [violationText, violationDateTime] = violation.split(' - ');
                            return violationText && violationDateTime;
                        });

                        // Update violations display
                        document.getElementById('modalTotalViolations').textContent = validViolations.length;

                        // Display violations list
                        const violationsList = document.getElementById('modalViolationsList');
                        violationsList.innerHTML = '';
                        if (validViolations.length > 0) {
                            validViolations.forEach((violation, index) => {
                                const [violationText, violationDateTime, reporterName] = violation.split(' - ');
                                const formattedDateTime = formatTo12HourClock(new Date(violationDateTime));

                                const li = document.createElement('li');
                                li.innerHTML = `${index + 1}. ${violationText} (Date: ${formattedDateTime})<br>
                                               <span style="margin-left: 20px; color: #666;">Reported By: ${reporterName || 'Anonymous'}</span>`;
                                violationsList.appendChild(li);
                            });
                        } else {
                            const li = document.createElement('li');
                            li.textContent = 'No violations reported';
                            violationsList.appendChild(li);
                        }

                        // Show the modal
                        const profileModal = new bootstrap.Modal(document.getElementById('profileModal'));
                        profileModal.show();
                    } else {
                        alert('No data available for the selected driver.');
                    }
                })
                .catch(error => {
                    console.error('Error fetching driver report details:', error);
                    alert('Failed to fetch report details.');
                });
        });
    });

    // Add event listeners for download QR buttons
    document.querySelectorAll('.download-qr-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const id = event.target.closest('.download-qr-btn').getAttribute('data-id');
            generateQRCode(id);
        });
    });
}

document.getElementById("editBtn").addEventListener("click", function () {
    toggleEditable(true);


    // Show the "Save Changes" button and "Cancel" button
    document.getElementById("saveChangesBtn").classList.remove("d-none");
    document.getElementById("cancelBtn").classList.remove("d-none");

    // Hide the "Edit" and "Delete" buttons
    document.getElementById("editBtn").classList.add("d-none");
    document.getElementById("deleteBtn").classList.add("d-none");
});

document.getElementById("cancelBtn").addEventListener("click", function () {
    // Restore original values
    document.getElementById("modalOwnerName").textContent = originalData.Driver_name;
    document.getElementById("modalFranchiseNumber").textContent = originalData.Plate_number;
    document.getElementById("modalBarangay").textContent = originalData.Barangay;

    toggleEditable(false);
    document.getElementById("editBtn").classList.remove("d-none");
    document.getElementById("deleteBtn").classList.remove("d-none");
    document.getElementById("saveChangesBtn").classList.add("d-none");
    document.getElementById("cancelBtn").classList.add("d-none");
});

document.getElementById("saveChangesBtn").addEventListener("click", async function () {
    if (!currentEditingId) {
        alert('Error: No driver selected for editing');
        return;
    }

    // Create FormData object to handle file upload
    const formData = new FormData();

    // Add text data
    formData.append('id', currentEditingId);
    formData.append('Driver_name', document.getElementById("modalOwnerName").querySelector('input').value.trim());
    formData.append('Plate_number', document.getElementById("modalFranchiseNumber").querySelector('input').value.trim());
    formData.append('Barangay', document.getElementById("modalBarangay").querySelector('input').value.trim());

    // Add image if one was selected
    const imageInput = document.getElementById('modalImageUpload');
    if (imageInput && imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    }

    try {
        const response = await fetch('https://triqride.onrender.com/api/driver/update', {
            method: 'PUT',
            body: formData // Send as FormData instead of JSON
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            alert('Driver information updated successfully!');
            getUsers(); // Refresh the driver list
            const profileModal = bootstrap.Modal.getInstance(document.getElementById('profileModal'));
            profileModal.hide();
        } else {
            throw new Error(data.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating driver information: ' + error.message);
    }

    toggleEditable(false);
    document.getElementById("editBtn").classList.remove("d-none");
    document.getElementById("deleteBtn").classList.remove("d-none");
    document.getElementById("saveChangesBtn").classList.add("d-none");
    document.getElementById("cancelBtn").classList.add("d-none");
});

// Function to enable or disable input fields
function toggleEditable(isEditable) {
    const modalOwnerName = document.getElementById("modalOwnerName");
    const modalFranchiseNumber = document.getElementById("modalFranchiseNumber");
    const modalBarangay = document.getElementById("modalBarangay");
    const imageContainer = document.querySelector(".image-container");

    if (isEditable) {
        // Store current values
        const ownerValue = modalOwnerName.textContent;
        const franchiseValue = modalFranchiseNumber.textContent;
        const barangayValue = modalBarangay.textContent;

        // Replace spans with input fields
        modalOwnerName.innerHTML = `<input type="text" class="edit-input" value="${ownerValue}">`;
        modalFranchiseNumber.innerHTML = `<input type="text" class="edit-input" value="${franchiseValue}">`;
        modalBarangay.innerHTML = `<input type="text" class="edit-input" value="${barangayValue}">`;

        // Add change photo button after the image
        const changePhotoButton = document.createElement('button');
        changePhotoButton.className = 'btn btn-primary mt-2';
        changePhotoButton.style.width = '100%';
        changePhotoButton.innerHTML = '<i class="fas fa-camera"></i> Change Photo';

        // Create hidden file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'modalImageUpload';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';

        // Add click handler to button
        changePhotoButton.onclick = (e) => {
            e.preventDefault();
            fileInput.click();
        };

        // Add file input change handler
        fileInput.onchange = function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const modalImage = document.getElementById('modalDriverImage');
                    modalImage.src = e.target.result;
                    modalImage.style.display = 'block';

                    // Remove any "No Image Available" message if it exists
                    const noImageMsg = imageContainer.querySelector('.no-image-message');
                    if (noImageMsg) noImageMsg.remove();
                };
                reader.readAsDataURL(file);
            }
        };

        // Add elements to container
        imageContainer.appendChild(fileInput);
        imageContainer.appendChild(changePhotoButton);

    } else {
        // Remove added elements when not in edit mode
        const changePhotoButton = imageContainer.querySelector('.btn');
        const fileInput = imageContainer.querySelector('input[type="file"]');
        if (changePhotoButton) changePhotoButton.remove();
        if (fileInput) fileInput.remove();

        // Restore text content from input values
        if (modalOwnerName.querySelector('input')) {
            modalOwnerName.textContent = modalOwnerName.querySelector('input').value;
        }
        if (modalFranchiseNumber.querySelector('input')) {
            modalFranchiseNumber.textContent = modalFranchiseNumber.querySelector('input').value;
        }
        if (modalBarangay.querySelector('input')) {
            modalBarangay.textContent = modalBarangay.querySelector('input').value;
        }
    }
}

// Function to reset modal buttons to "Edit" button only
function resetToEditState() {
    // Remove any image upload elements
    const imageUploadContainer = document.querySelector('.image-upload-container');
    if (imageUploadContainer) {
        imageUploadContainer.remove();
    }

    // Restore original values in case they were edited
    document.getElementById("modalOwnerName").textContent = originalData.Driver_name;
    document.getElementById("modalFranchiseNumber").textContent = originalData.Plate_number;
    document.getElementById("modalBarangay").textContent = originalData.Barangay;

    // Disable editing mode
    toggleEditable(false);

    // Show the "Edit" button and hide the "Save" and "Cancel" buttons
    document.getElementById("editBtn").classList.remove("d-none");
    document.getElementById("deleteBtn").classList.remove("d-none");
    document.getElementById("saveChangesBtn").classList.add("d-none");
    document.getElementById("cancelBtn").classList.add("d-none");
}

// Add Esc key listener when the modal is shown
document.getElementById('profileModal').addEventListener('shown.bs.modal', () => {
    function escKeyListener(event) {
        if (event.key === 'Escape') {
            resetToEditState();
        }
    }

    // Attach keydown event listener for Esc key
    document.addEventListener('keydown', escKeyListener);

    // Remove the listener when modal is hidden to avoid multiple listeners
    document.getElementById('profileModal').addEventListener('hidden.bs.modal', () => {
        document.removeEventListener('keydown', escKeyListener);
        resetToEditState();  // Also reset state when modal is closed
    });
});

function formatTo12HourClock(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-indexed
    const year = date.getFullYear();

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for midnight
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes; // Add leading zero to minutes if needed

    return `${month}/${day}/${year} ${formattedHours}:${formattedMinutes} ${ampm}`; // Return full date and time
}

function updatePaginationControls() {
    const pageInfo = document.getElementById('pageInfo');
    pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(fullDriverList.length / pageSize)}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === Math.ceil(fullDriverList.length / pageSize);
}

document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayPaginatedUsers();
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPage < Math.ceil(fullDriverList.length / pageSize)) {
        currentPage++;
        displayPaginatedUsers();
    }
});

// Function to generate and download the QR code
function generateQRCode(id) {
    fetch(`https://triqride.onrender.com/api/qr/${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.qrCode) {
                const link = document.createElement('a');
                link.href = data.qrCode; // Use the QR code URL
                link.download = `qr_code_${id}.png`; // Set the download filename
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                alert("QR code downloaded successfully!");
            } else {
                alert("Failed to generate QR code.");
            }
        })
        .catch(error => {
            console.error('Error fetching QR code:', error);
            alert("Error generating QR code.");
        });
}

document.getElementById('searchBar').addEventListener('keyup', function () {
    const searchTerm = this.value;
    fetch(`https://triqride.onrender.com/api/drivers?search=${encodeURIComponent(searchTerm)}`, { mode: 'cors' })
        .then(response => response.json())
        .then(data => {
            fullDriverList = data;  // Update the full list with search results
            currentPage = 1;  // Reset to first page for search results
            displayPaginatedUsers();  // Display the search results
        })
        .catch(error => {
            console.error('Error fetching search results:', error);
        });
});

document.getElementById("confirmDeleteBtn").addEventListener("click", async function () {
    if (!currentEditingId) {
        alert('Error: No driver selected for deletion');
        return;
    }

    try {
        const response = await fetch('https://triqride.onrender.com/api/remove', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: currentEditingId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.msg === 'Successfully deleted!') {
            // Close both modals
            const deleteConfirmModal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
            const profileModal = bootstrap.Modal.getInstance(document.getElementById('profileModal'));
            deleteConfirmModal.hide();
            profileModal.hide();

            // Refresh the driver list
            getUsers();

            // Show success message
            alert('Driver profile deleted successfully!');
        } else {
            throw new Error(data.error || 'Unknown error');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting driver profile: ' + error.message);
    }
});

document.getElementById("deleteBtn").addEventListener("click", function () {
    // Show the confirmation modal
    const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    deleteConfirmModal.show();
});

document.addEventListener("DOMContentLoaded", function () {
    const profileModal = document.getElementById("profileModal"); // Reference to the Driver Profile modal
    const deleteModal = document.getElementById("deleteConfirmModal"); // Reference to the Delete Confirmation modal
    const profileModalContent = profileModal.querySelector(".modal-content"); // Target modal's content

    // When the delete confirmation modal is shown
    deleteModal.addEventListener("show.bs.modal", function () {
        // Add a dimmed overlay to the profile modal
        const dimmedOverlay = document.createElement("div");
        dimmedOverlay.classList.add("dimmed-overlay");
        profileModalContent.appendChild(dimmedOverlay);
    });

    // When the delete confirmation modal is hidden
    deleteModal.addEventListener("hide.bs.modal", function () {
        // Remove the dimmed overlay
        const dimmedOverlay = profileModalContent.querySelector(".dimmed-overlay");
        if (dimmedOverlay) {
            dimmedOverlay.remove();
        }
    });
});



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
