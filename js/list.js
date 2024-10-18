let currentPage = 1;
const pageSize = 10;
let fullDriverList = [];

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
        adminNameElement.textContent = 'Admin'; // Default fallback
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

    const formData = new FormData();
    formData.append('plate', document.querySelector('#plate').value);
    formData.append('driver', document.querySelector('#driver').value);
    formData.append('brgy', document.querySelector('#brgy').value);
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
            fullDriverList = data;  // Store the full list of users
            displayPaginatedUsers();  // Display the initial page of users

            // Add event listener for the image modal
            document.querySelector('tbody').addEventListener('click', (event) => {
                if (event.target.tagName === 'IMG') {
                    const imgSrc = event.target.src;  // Get the image source
                    const modalImage = document.querySelector('#modalImage');
                    modalImage.src = imgSrc;  // Set the modal image source

                    const modal = new bootstrap.Modal(document.getElementById('imageModal'));
                    modal.show();  // Show the modal
                }
            });
        })
        .catch(error => {
            console.log(error);
        });
}

function displayPaginatedUsers() {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, fullDriverList.length);
    const paginatedData = fullDriverList.slice(startIndex, endIndex);
    displayUsers(paginatedData);
    updatePaginationControls();
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
                    <img src="${imageSrc}" alt="Image" style="max-width: 100px; height: auto;" />
                </td>
                <td class="text-center">${element.Plate_number}</td>
                <td class="text-center">
                    <button class="btn btn-info profile-preview-btn" 
                            data-driver="${element.Driver_name}" 
                            data-franchise="${element.Plate_number}" 
                            data-barangay="${element.Barangay}" 
                            data-image="${imageSrc}" 
                            data-overall-rating="${overallRating}"> <!-- Pass overall rating here -->
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

    // Add event listeners for profile preview buttons
    document.querySelectorAll('.profile-preview-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const franchiseNumber = event.target.getAttribute('data-franchise');
    
            // Fetch driver and report details
            fetch(`https://triqride.onrender.com/api/driver/${franchiseNumber}`, { mode: 'cors' })
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.data) {
                        const driverData = data.data; // Use the object directly
    
                        // Update modal with driver details
                        document.getElementById('modalOwnerName').textContent = driverData.Driver_name;
                        document.getElementById('modalFranchiseNumber').textContent = driverData.Plate_number;
                        document.getElementById('modalBarangay').textContent = driverData.Barangay;
                        document.getElementById('modalDriverImage').src = driverData.Image ? driverData.Image : 'placeholder.jpg';
    
                        // Handle ratings
                        document.getElementById('modalOverallRating').textContent = driverData.averageRating
                            ? driverData.averageRating.toFixed(2)
                            : 'Not available';
    
                        // Handle violations and report details
                        const violationsList = document.getElementById('modalViolationsList');
                        violationsList.innerHTML = ''; // Clear the list first
    
                        if (driverData.ViolationHistory) {
                            const violations = driverData.ViolationHistory.split(', '); // Split the concatenated string into an array
                            violations.forEach(violation => {
                                const li = document.createElement('li');
                                li.textContent = violation;
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
