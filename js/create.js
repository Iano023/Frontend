let selectedRole = 'Admin'; // Default role selection

document.addEventListener('DOMContentLoaded', async () => {
    // Check if Head Admin already exists
    try {
        const response = await fetch('https://triqride.onrender.com/check-head-admin');
        const data = await response.json();
        
        // Disable the Head Admin button if one already exists
        if (data.headAdminExists) {
            const headAdminBtn = document.getElementById('btn-head-admin');
            headAdminBtn.disabled = true;
            headAdminBtn.textContent = 'Head Admin ';
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

document.getElementById('create-account-form').addEventListener('submit', async function(e) {
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
            }

            // Redirect after a delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        } else {
            messageElement.style.color = 'red';
            messageElement.textContent = data.message || 'Error creating account';
            // Don't redirect if there's an error
        }
    } catch (error) {
        console.error('Error:', error);
        messageElement.style.color = 'red';
        messageElement.textContent = 'Error connecting to the server';
    }
});
