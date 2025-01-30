// Login Form Handling
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email && password) {
        alert(`Logged in as ${email}`);
        // Add logic for successful login
    } else {
        alert('Please fill out all fields.');
    }
});

// Registration Form Handling
document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('emailReg').value;
    const password = document.getElementById('passwordReg').value;

    if (name && email && password) {
        alert(`Account created for ${name}`);
        // Add logic for saving the new account
    } else {
        alert('Please fill out all fields.');
    }
});
