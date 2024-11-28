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
            alert(data.message);
            // Store user information in localStorage
            localStorage.setItem('username', username);
            localStorage.setItem('fullname', data.fullname);
            localStorage.setItem('sessionToken', data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('profileImage', data.profileImage); // Add this line
            localStorage.setItem('userId', data.userId);
            
            if (data.role === 'Head Admin') {
                sessionStorage.setItem('headAdminId', data.userId);
                window.location.href = 'approve.html';
            } else {
                window.location.href = 'chart.html';
            }
        } else {
            alert(data.message);
            window.location.reload();
        }
    } catch (error) {
        alert('Error connecting to the server');
    }
});

document.querySelector('.toggle-password-visibility').addEventListener('click', () => {
    const passwordField = document.getElementById('login-password');
    const toggleIcon = document.getElementById('toggleLoginPasswordIcon');
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
