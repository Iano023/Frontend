document.getElementById('create-account-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const fullname = document.getElementById('register-fullname').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch('http://localhost:4500/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, fullname, password })
        });

        const data = await response.json();
        const messageElem = document.getElementById('register-message');

        if (response.ok) {
            messageElem.style.color = 'green';
            messageElem.innerText = 'Account created successfully!';

            // Show alert
            alert('Account created successfully!');

            // Redirect to the login page after alert
            window.location.href = 'index.html'; // Adjust the path if necessary
        } else {
            messageElem.style.color = 'red';
            messageElem.innerText = data.message || 'Error creating account';
        }
    } catch (error) {
        document.getElementById('register-message').innerText = 'Error connecting to the server';
    }
});
