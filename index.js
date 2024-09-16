const content = document.querySelector('#content');
const submit = document.querySelector('#submit');
const searchButton = document.querySelector('#searchButton');
const searchInput = document.querySelector('#search');

// Handle form submission
submit.addEventListener("click", () => {
    let plate = document.querySelector("#plate").value;
    let driver = document.querySelector("#driver").value;
    let brgy = document.querySelector("#brgy").value;
    let actions = document.querySelector("#actions").value;

    let formData = { plate, driver, brgy, actions };
    fetch("https://triqride.onrender.com/api/list", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
            "Content-Type": "application/json",
        },
    }).catch((error) => console.log(error));
    alert("Success!");
    location.reload();
});

window.addEventListener('load', () => {
    getUsers();
});

// Fetch and display all users
function getUsers() {
    fetch('https://triqride.onrender.com/api/list/', { mode: 'cors' })
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
        html += `
            <tr>
                <td>${element.id}</td>
                <td>${element.Plate_Number}</td>
                <td>${element.Driver_name}</td>
                <td>${element.Barangay}</td>
                <td>${element.Violations}</td> 
                <td>
                    <button class="btn btn-danger" onclick="deleteMember(${element.id})">
                        <i class="fas fa-trash"></i> Clear
                    </button>
                    <button class="btn btn-primary notify-btn" data-id="${element.id}">
                        <i class="fas fa-bell"></i> Notify
                    </button>
                </td>
            </tr>`;
    });
    document.querySelector('tbody').innerHTML = html;

    // Add event listeners to all notify buttons
    document.querySelectorAll('.notify-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const id = event.target.closest('.notify-btn').getAttribute('data-id');
            sendNotification(id);
        });
    });
}

// Delete a member
function deleteMember(id) {
    let formData = { id };

    fetch(`https://triqride.onrender.com/api/list/`, {
        method: "DELETE",
        body: JSON.stringify(formData),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => response.text())
        .then(response => console.log(response))
        .catch(error => console.log(error));

    alert("Successfully Deleted!");
    location.reload();
}

// Search functionality
searchButton.addEventListener('click', () => {
    const query = searchInput.value.toLowerCase();
    if (query) {
        fetch('https://triqride.onrender.com/api/list/', { mode: 'cors' })
            .then(response => response.json())
            .then(data => {
                let filteredData = data.filter(member =>
                    member.Plate_Number.toLowerCase().includes(query) || 
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
    fetch(`https://triqride.onrender.com/api/list/${id}`)
        .then(response => response.json())
        .then(user => {
            if (!user || !user.fcm_token) {
                alert("User doesn't have a registered FCM token.");
                return;
            }

            // Prepare the notification data
            const now = new Date();
            
            // Format serverTime to 12-hour format with AM/PM
            let hours = now.getHours();
            const minutes = now.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;

            // Format serverDate to "December 30, 2024" format
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = now.toLocaleDateString('en-US', options);

            const notificationData = {
                id: user.id,
                title: 'Report Notice',
                body: `Report Submitted to Municipal Office Plate Number ${user.Plate_Number}.`,
                serverTime: formattedTime,
                serverDate: formattedDate
            };

            // Send the notification request to the server
            return fetch("https://triqride.onrender.com/sendnotification", {
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
