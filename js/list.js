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

        reader.onload = function(e) {
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
            displayUsers(data);
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

document.getElementById('searchBar').addEventListener('input', function() {
    const searchTerm = this.value;  // Get the value from the search bar
    fetchReports(searchTerm);  // Fetch reports based on search term
});

// Display user data in a table
function displayUsers(data) {
    let html = "";
    data.forEach(element => {
        const imageSrc = element.Image ? element.Image : 'placeholder.jpg'; // Default image

        html += `
            <tr>
                <td><strong>${element.id}.</strong></td>
                <td><img src="${imageSrc}" alt="Image" style="max-width: 100px; height: auto;" /></td>
                <td>${element.Driver_name}</td>
                <td>${element.Plate_number}</td>
                <td>${element.Barangay}</td>
                <td>
                    <button class="btn btn-success download-qr-btn" data-id="${element.id}">
                        <i class="fas fa-download"></i> Download QR
                    </button>
                </td>
            </tr>`;
    });
    document.querySelector('tbody').innerHTML = html;

    // Add event listeners for QR code download buttons
    document.querySelectorAll('.download-qr-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const id = event.target.closest('.download-qr-btn').getAttribute('data-id');
            generateQRCode(id);
        });
    });
}

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

document.getElementById('searchBar').addEventListener('keyup', function() {
    const searchTerm = this.value.toLowerCase(); // Get the search term and convert to lower case
    const rows = document.querySelectorAll('#driverlistData tr'); // Get all rows in the table body

    rows.forEach(row => {
        const cells = row.getElementsByTagName('td'); // Get all cells in the row
        let match = false;

        // Check the "Franchise Number" column, which is typically the second column (index 1)
        if (cells.length > 1 && cells[1].textContent.toLowerCase().includes(searchTerm)) {
            match = true; // Match found in the Franchise Number column
        }

        // Show or hide the row based on whether a match was found
        if (match) {
            row.style.display = ''; // Show the row
        } else {
            row.style.display = 'none'; // Hide the row
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
