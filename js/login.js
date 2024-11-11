document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    try {
        const response = await fetch('https://triqride.onrender.com/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        
        if (response.ok) {
            alert(data.message);  // Show success message as alert

            // Store user information in localStorage
            localStorage.setItem('fullname', data.fullname);
            localStorage.setItem('sessionToken', data.token);
            localStorage.setItem('userRole', data.role);
            
            // Redirect based on role
            if (data.role === 'Head Admin') {
                sessionStorage.setItem('headAdminId', data.userId);
                window.location.href = 'approve.html'; // Head Admin goes to approval page
            } else {
                window.location.href = 'chart.html'; // Regular Admin goes to dashboard
            }
        } else {
            alert(data.message);
            window.location.reload();  // Show error message as alert
        }
    } catch (error) {
        alert('Error connecting to the server');  // Show connection error as alert
    }
});
