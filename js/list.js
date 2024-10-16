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

// Fetch and display all users
let currentPage = 1;
const pageSize = 10;
let fullDriverList = [];

function getUsers() {
    fetch('https://triqride.onrender.com/api/list/', { mode: 'cors' })
        .then(response => response.json())
        .then(data => {
            fullDriverList = data; // Store the full list of users
            displayPaginatedUsers(); // Display the initial page of users

            // Add event listener for the image modal
            document.querySelector('tbody').addEventListener('click', (event) => {
                if (event.target.tagName === 'IMG') {
                    const imgSrc = event.target.src; // Get the image source
                    const modalImage = document.querySelector('#modalImage');
                    modalImage.src = imgSrc; // Set the modal image source

                    const modal = new bootstrap.Modal(document.getElementById('imageModal'));
                    modal.show(); // Show the modal
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

        html += `
            <tr>
                <td><strong>${element.id}.</strong></td>
                <td class="text-align">
                    <img src="${imageSrc}" alt="Image" style="max-width: 100px; height: auto;" />
                </td>
                <td class="text-center">
                    <button class="btn btn-info profile-preview-btn" 
                            data-driver="${element.Driver_name}" 
                            data-franchise="${element.Plate_number}" 
                            data-barangay="${element.Barangay}" 
                            data-image="${imageSrc}">
                        Preview Profile
                    </button>
                </td>
                <td class="text-end">
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
            const driverName = event.target.getAttribute('data-driver');
            const franchiseNumber = event.target.getAttribute('data-franchise');
            const barangay = event.target.getAttribute('data-barangay');
            const imageSrc = event.target.getAttribute('data-image');

            // Set the modal content
            document.getElementById('modalOwnerName').textContent = driverName;
            document.getElementById('modalFranchiseNumber').textContent = franchiseNumber;
            document.getElementById('modalBarangay').textContent = barangay;
            document.getElementById('modalDriverImage').src = imageSrc;

            // Show the modal
            const profileModal = new bootstrap.Modal(document.getElementById('profileModal'));
            profileModal.show();
        });
    });

    // Add event listeners for QR download buttons
    document.querySelectorAll('.download-qr-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const id = event.target.closest('.download-qr-btn').getAttribute('data-id');
            generateQRCode(id);
        });
    });
}

// Pagination controls
function updatePaginationControls() {
    document.getElementById('pageInfo').textContent = `Page ${currentPage}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage * pageSize >= fullDriverList.length;
}

document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayPaginatedUsers();
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPage * pageSize < fullDriverList.length) {
        currentPage++;
        displayPaginatedUsers();
    }
});

// QR code generation (function to be implemented)
function generateQRCode(driverId) {
    // Implement QR code generation logic
}
