const content = document.querySelector('#content');
const submit = document.querySelector('#submit');
const searchButton = document.querySelector('#searchButton');
const searchInput = document.querySelector('#search');
const imageUpload = document.querySelector("#imageUpload");
const imagePreview = document.querySelector("#imagePreview");

// Handle image file input change event
imageUpload.addEventListener("change", (event) => {
    const file = event.target.files[0];
    const maxSizeMB = 5; 
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
        
        // Read the file as a data URL (Base64)
        reader.readAsDataURL(file);
    } 
});

// Handle form submission
submit.addEventListener("click", () => {
    let plate = document.querySelector("#plate").value;
    let driver = document.querySelector("#driver").value;
    let brgy = document.querySelector("#brgy").value;
    let actions = document.querySelector("#actions").value;

    // Get the uploaded file
    let imageUploadFile = imageUpload.files[0]; // Get the first uploaded file

    
    // Create a FormData object
    let formData = new FormData();
    formData.append("plate", plate);
    formData.append("driver", driver);
    formData.append("brgy", brgy);
    formData.append("actions", actions);

    if (imageUploadFile) {
        formData.append("image", imageUploadFile); // Append the image file
    }

    // Send form data to the server
    fetch("http://localhost:4500/api/list", {
        method: "POST",
        body: formData, // Use FormData object as the body
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        alert("Success!");
        location.reload();
        getUsers(); // Call getUsers to refresh the list after a successful upload
    })
    .catch((error) => {
        console.error('Error:', error);
        alert("Error uploading data.");
    });
});

window.addEventListener('load', () => {
    getUsers(); // Fetch users when the page loads
});

// Fetch and display all users
function getUsers() {
    fetch('http://localhost:4500/api/list/', { mode: 'cors' })
        .then(response => response.json())
        .then(data => {
            displayUsers(data);
        })
        .catch(error => {
            console.log(error);
        });
}

// Display user data in a table
function displayUsers(data) {
    let html = "";  
    data.forEach(element => {
        // Use the correct image URL from Firebase Storage if available, otherwise use a placeholder
        const imageSrc = element.image ? element.image : 'placeholder.jpg';

        html += `
            <tr>
                <td>${element.id}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${imageSrc}" alt="Image" style="max-width: 100px; height: auto;" class="me-2" />
                        <div>
                            <div><strong>Franchise:</strong> ${element.Plate_number}</div>
                            <div><strong>Owner:</strong> ${element.Driver_name}</div>
                            <div><strong>Barangay:</strong> ${element.Barangay}</div>
                            <div><strong>Violations:</strong> ${element.Violations}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <button class="btn btn-danger" onclick="deleteMember(${element.id})">
                        <i class="fas fa-trash"></i> Clear
                    </button>
                    <button class="btn btn-primary notify-btn" data-id="${element.id}">
                        <i class="fas fa-bell"></i> Notify
                    </button>
                    <button class="btn btn-success download-qr-btn" data-id="${element.id}">
                        <i class="fas fa-download"></i> Download QR
                    </button>
                </td>
            </tr>`;
    });
    document.querySelector('tbody').innerHTML = html;

    // Add event listeners for notify and download QR code buttons
    document.querySelectorAll('.notify-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const id = event.target.closest('.notify-btn').getAttribute('data-id');
            sendNotification(id);
        });
    });

    document.querySelectorAll('.download-qr-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const id = event.target.closest('.download-qr-btn').getAttribute('data-id');
            generateQRCode(id);
        });
    });
}

searchButton.addEventListener('click', () => {
    const query = searchInput.value.toLowerCase();
    if (query) {
        fetch('http://localhost:4500/api/list/', { mode: 'cors' })
            .then(response => response.json())
            .then(data => {
                let filteredData = data.filter(member =>
                    member.Plate_number.toLowerCase().includes(query) ||
                    member.Driver_name.toLowerCase().includes(query) ||
                    member.Barangay.toLowerCase().includes(query) ||
                    member.Violations.toLowerCase().includes(query)
                );
                displayUsers(filteredData);
            })
            .catch(error => {
                console.log(error);
            });
    } else {
        getUsers(); // Reload all users if search query is empty
    }
});
   

// Function to send notification
function sendNotification(id) {
    fetch(`http://localhost:4500/api/list/${id}`)
        .then(response => response.json())
        .then(user => {
            if (!user || !user.fcm_token) {
                alert("User doesn't have a registered FCM token.");
                return;
            }

            // Prepare the notification data
            const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = now.toLocaleDateString('en-US', options);

            const notificationData = {
                id: user.id,
                title: 'Report Notice',
                body: `Report Submitted to Municipal Office Plate Number: ${user.Plate_Number}.`,
                serverTime: formattedTime,
                serverDate: formattedDate
            };

            return fetch("http://localhost:4500/sendnotification", {
                method: "POST",
                body: JSON.stringify(notificationData),
                headers: {
                    "Content-Type": "application/json",
                },
            });
        })
        .then(response => response.json())
        .then(data => {
            if (data.msg) {
                alert(data.msg);
            } else {
                alert("Failed to send notification.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Error sending notification.");
        });
}

// Function to generate and display the QR code
function generateQRCode(id) {
    fetch(`http://localhost:4500/api/qr/${id}`)
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

// Delete a member
function deleteMember(id) {
    if (confirm("Are you sure you want to delete this member?")) {
        let formData = { id };

        fetch(`http://localhost:4500/api/list/`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(() => {
            alert('Member deleted successfully.');
            getUsers(); // Refresh the list after deletion
        })
        .catch((error) => {
            console.error('Error:', error);
            alert("Error deleting member.");
        });
    }
}
