let currentPage = 1;
const pageSize = 10;
let fullDriverList = [];
let originalData = {}; // Store original data
let currentEditingId = null; // Track the currently editing driver ID
let isEditMode = false;

const submit = document.querySelector('#submit');
const imageUpload = document.querySelector("#imageUpload");
const imagePreview = document.querySelector("#imagePreview");

// Display the logged-in user's fullname
function displayAdminName() {
    const fullname = localStorage.getItem('fullname'); // Retrieve fullname from localStorage
    const adminNameElement = document.getElementById('adminName');

    if (fullname) {
        adminNameElement.textContent = fullname; // Display fullname
    } else {
        adminNameElement.textContent = 'Admin'; 
    }
}

window.addEventListener('load', () => {
    displayAdminName();
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

// Handle form submission
document.querySelector('#submit-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const plateNumber = document.querySelector('#plate').value.trim();

    // Check if plate number already exists in the driver list
    const isDuplicate = fullDriverList.some(driver => driver.Plate_number === plateNumber);

    if (isDuplicate) {
        alert('This Franchise Number already exists.');
        location.reload();
        return; // Prevent form submission
    }

    const formData = new FormData();
    formData.append('plate', plateNumber);
    formData.append('driver', document.querySelector('#driver').value.trim());
    formData.append('brgy', document.querySelector('#brgy').value.trim());
    formData.append('image', imageUpload.files[0]); // Use imageUpload directly

    fetch('https://triqride.onrender.com/api/list', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.msg) {
            alert('Record added successfully!');
            location.reload();
        } else {
            alert('Failed to add record.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error adding record.');
    });
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
    data.forEach(element => {
        const imageSrc = element.Image ? element.Image : 'placeholder.jpg'; // Default image
        const overallRating = element.averageRating ? element.averageRating.toFixed(2) : 'Not available'; // Use the averageRating from the backend

        html += `
            <tr>
                <td><strong>${element.id}.</strong></td>
                <td class="text-align">
                    <img class="clickable-image" src="${imageSrc}" alt="Image" style="max-width: 100px; height: auto;" />
                </td>
                <td class="text-center">${element.Driver_name}</td>
                <td class="text-center">${element.Plate_number}</td>
                <td class="text-center">
                    <button class="btn custom-orange-btn profile-preview-btn" 
                            data-driver="${element.Driver_name}" 
                            data-franchise="${element.Plate_number}" 
                            data-barangay="${element.Barangay}" 
                            data-image="${imageSrc}" 
                            data-overall-rating="${overallRating}">
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

                        // Update modal with driver details
                        document.getElementById('modalOwnerName').textContent = driverData.Driver_name;
                        document.getElementById('modalFranchiseNumber').textContent = driverData.Plate_number;
                        document.getElementById('modalBarangay').textContent = driverData.Barangay;
                        document.getElementById('modalDriverImage').src = driverData.Image ? driverData.Image : 'placeholder.jpg';

                        // Handle ratings
                        document.getElementById('modalOverallRating').textContent = driverData.averageRating
                            ? driverData.averageRating.toFixed(2)
                            : 'Not available';
                        

                        const overallRating = driverData.averageRating ? driverData.averageRating.toFixed(2) : 'Not available';
                        const ratingCount = driverData.ratingCount || 0; // Default to 0 if undefined
    
                        // Set overall rating and rating count
                        document.getElementById('modalOverallRating').textContent = overallRating;
                        document.getElementById('modalRatingCount').textContent = ratingCount;
    
                        // Update star rating visually
                        updateStarRating(Math.round(driverData.averageRating || 0));

                        // Process valid violations only
                        const violationHistory = driverData.ViolationHistory ? driverData.ViolationHistory.split(', ') : [];
                        const validViolations = violationHistory.filter(violation => {
                            const [violationText, violationDateTime] = violation.split(' - ');
                            return violationText && violationDateTime; // Only count if both text and date exist
                        });

                        // Display the count of valid violations
                        document.getElementById('modalTotalViolations').textContent = validViolations.length;

                        // Display each valid violation in the list
                        const violationsList = document.getElementById('modalViolationsList');
                        violationsList.innerHTML = ''; // Clear the list first
                        if (validViolations.length > 0) {
                            violationsList.innerHTML = ''; // Clear the list
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

                        // Show the modal with the updated data
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

    // Show the "Save Changes" button and hide the "Edit" button
    document.getElementById("editBtn").classList.add("d-none");
    document.getElementById("saveChangesBtn").classList.remove("d-none");
    document.getElementById("cancelBtn").classList.remove("d-none");
});

document.getElementById("cancelBtn").addEventListener("click", function () {
    // Restore original values
    document.getElementById("modalOwnerName").textContent = originalData.Driver_name;
    document.getElementById("modalFranchiseNumber").textContent = originalData.Plate_number;
    document.getElementById("modalBarangay").textContent = originalData.Barangay;

    toggleEditable(false);
    document.getElementById("editBtn").classList.remove("d-none");
    document.getElementById("saveChangesBtn").classList.add("d-none");
    document.getElementById("cancelBtn").classList.add("d-none");
});

document.getElementById("saveChangesBtn").addEventListener("click", function () {
    if (!currentEditingId) {
        alert('Error: No driver selected for editing');
        return;
    }

    const updatedData = {
        id: currentEditingId, 
        Driver_name: document.getElementById("modalOwnerName").querySelector('input').value.trim(),
        Plate_number: document.getElementById("modalFranchiseNumber").querySelector('input').value.trim(),
        Barangay: document.getElementById("modalBarangay").querySelector('input').value.trim()
    };

    console.log('Sending update request with data:', updatedData);

    fetch(`https://triqride.onrender.com/api/driver/update`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Response from server:', data);
        if (data.success) {
            alert('Driver information updated successfully!');
            getUsers(); // Refresh the driver list
            const profileModal = bootstrap.Modal.getInstance(document.getElementById('profileModal'));
            profileModal.hide();
        } else {
            throw new Error(data.message || 'Unknown error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error updating driver information: ' + error.message);
    });

    toggleEditable(false);
    document.getElementById("editBtn").classList.remove("d-none");
    document.getElementById("saveChangesBtn").classList.add("d-none");
    document.getElementById("cancelBtn").classList.add("d-none");
});

// Function to enable or disable input fields
function toggleEditable(isEditable) {
    const modalOwnerName = document.getElementById("modalOwnerName");
    const modalFranchiseNumber = document.getElementById("modalFranchiseNumber");
    const modalBarangay = document.getElementById("modalBarangay");
    
    if (isEditable) {
        // Store current values
        const ownerValue = modalOwnerName.textContent;
        const franchiseValue = modalFranchiseNumber.textContent;
        const barangayValue = modalBarangay.textContent;
        
        // Replace spans with input fields
        modalOwnerName.innerHTML = `<input type="text" class="edit-input" value="${ownerValue}">`;
        modalFranchiseNumber.innerHTML = `<input type="text" class="edit-input" value="${franchiseValue}">`;
        modalBarangay.innerHTML = `<input type="text" class="edit-input" value="${barangayValue}">`;
    } else {
        // If we're disabling editing, just ensure we're showing text content
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

function resetToEditState() {
    // Restore original values in case they were edited
    document.getElementById("modalOwnerName").textContent = originalData.Driver_name;
    document.getElementById("modalFranchiseNumber").textContent = originalData.Plate_number;
    document.getElementById("modalBarangay").textContent = originalData.Barangay;

    // Disable editing mode
    toggleEditable(false);

    // Show the "Edit" button and hide the "Save" and "Cancel" buttons
    document.getElementById("editBtn").classList.remove("d-none");
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
