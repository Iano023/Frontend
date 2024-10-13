document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('https://triqride.onrender.com/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        const messageElem = document.getElementById('login-message');
        if (response.ok) {
            messageElem.style.color = 'green';
            messageElem.innerText = data.message; // 'Login successful'

            // Store the full name in localStorage
            localStorage.setItem('fullname', data.fullname);

            // Redirect the user to the dashboard page
            window.location.href = 'report.html';
        } else {
            messageElem.style.color = 'red';
            messageElem.innerText = data.message; // 'Invalid username or password'
        }
    } catch (error) {
        document.getElementById('login-message').innerText = 'Error connecting to the server';
    }
});
