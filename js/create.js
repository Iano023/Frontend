let selectedRole = 'Admin'; // Default role selection

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

    const username = document.getElementById('register-username').value;
    const fullname = document.getElementById('register-fullname').value;
    const password = document.getElementById('register-password').value;
    const messageElement = document.getElementById('register-message');

    messageElement.style.color = 'blue';
    messageElement.textContent = 'Creating account...';

    try {
        const endpoint = selectedRole === 'Head Admin'
            ? 'https://triqride.onrender.com/create-head-admin'
            : 'https://triqride.onrender.com/register';

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                fullname,
                password,
                role: selectedRole
            })
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

                const headAdminBtn = document.getElementById('btn-head-admin');
                headAdminBtn.disabled = true;
                headAdminBtn.textContent = 'Head Admin';
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
