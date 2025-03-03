let selectedRole = 'Admin'; // Default role selection

document.getElementById('profile-image').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('image-preview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" class="img-thumbnail" style="max-width: 200px">`;
        }
        reader.readAsDataURL(file);
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const headAdminBtn = document.getElementById('btn-head-admin');

    // Immediately disable the button on page load
    headAdminBtn.disabled = true;

    // Check if the status is stored in localStorage
    if (localStorage.getItem('headAdminExists') === 'true') {
        headAdminBtn.textContent = 'Head Admin';
        return; // Exit early if Head Admin exists
    }

    // Fetch to check if a Head Admin already exists
    try {
        const response = await fetch('https://triqride.onrender.com/check-head-admin');
        const data = await response.json();

        // If a Head Admin exists, keep the button disabled and update localStorage
        if (data.headAdminExists) {
            localStorage.setItem('headAdminExists', 'true');
            headAdminBtn.textContent = 'Head Admin';
        } else {
            // If no Head Admin exists, re-enable the button
            headAdminBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error checking Head Admin status:', error);
    }
});

function selectRole(role) {
    selectedRole = role;
    const messageElement = document.getElementById('register-message');
    messageElement.textContent = `Selected: ${role}`;
    messageElement.style.color = 'blue';

    const adminBtn = document.getElementById('btn-admin');
    const headAdminBtn = document.getElementById('btn-head-admin');

    if (role === 'Admin') {
        adminBtn.classList.add('selected');
        headAdminBtn.classList.remove('selected');
    } else {
        headAdminBtn.classList.add('selected');
        adminBtn.classList.remove('selected');
    }

    const warningElement = document.getElementById('head-admin-warning');
    warningElement.style.display = role === 'Head Admin' ? 'block' : 'none';
}

document.getElementById('create-account-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
    }

    // Proceed with account creation
    const username = document.getElementById('register-username').value;
    const fullname = document.getElementById('register-fullname').value;
    const profileImage = document.getElementById('profile-image').files[0];
    const messageElement = document.getElementById('register-message');

    messageElement.style.color = 'blue';
    messageElement.textContent = 'Creating account...';

    try {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('fullname', fullname);
        formData.append('password', password);
        formData.append('role', selectedRole);
        if (profileImage) {
            formData.append('profileImage', profileImage);
        }

        const endpoint = selectedRole === 'Head Admin'
            ? 'https://triqride.onrender.com/create-head-admin'
            : 'https://triqride.onrender.com/register';

        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            messageElement.style.color = 'green';
            if (selectedRole === 'Admin') {
                alert('Admin account created! Please wait for Head Admin approval.');
                messageElement.textContent = 'Account created successfully! Awaiting Head Admin approval.';
            } else {
                alert('Head Admin account created successfully!');
                messageElement.textContent = 'Head Admin account created successfully!';
                localStorage.setItem('headAdminExists', 'true');
            }
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        } else {
            messageElement.style.color = 'red';
            messageElement.textContent = data.message || 'Error creating account';
        }
    } catch (error) {
        console.error('Error:', error);
        messageElement.style.color = 'red';
        messageElement.textContent = 'Error connecting to the server';
    }
});


document.querySelector('.toggle-password-visibility').addEventListener('click', () => {
    const passwordField = document.getElementById('register-password');
    const toggleIcon = document.getElementById('toggleRegisterPasswordIcon');
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

// Toggle visibility for Confirm Password field
document.querySelector('.toggle-password-visibility:last-of-type').addEventListener('click', () => {
    const confirmPasswordField = document.getElementById('confirm-password');
    const toggleIcon = document.getElementById('toggleConfirmPasswordIcon');
    if (confirmPasswordField.type === 'password') {
        confirmPasswordField.type = 'text';
        toggleIcon.classList.remove('bi-eye-slash');
        toggleIcon.classList.add('bi-eye');
    } else {
        confirmPasswordField.type = 'password';
        toggleIcon.classList.remove('bi-eye');
        toggleIcon.classList.add('bi-eye-slash');
    }
});
