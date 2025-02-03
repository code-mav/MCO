// Function to get stored users from localStorage
function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

// Function to save users to localStorage
function saveUser(user) {
    let users = getUsers();
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
}

// Function to get reservations from localStorage
function getReservations() {
    return JSON.parse(localStorage.getItem("reservations")) || [];
}

// Function to save reservations to localStorage
function saveReservations(reservations) {
    localStorage.setItem("reservations", JSON.stringify(reservations));
}

// Function to update UI dynamically after login
function updateUI() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (loggedInUser) {
        document.getElementById("userProfile").style.display = "flex"; // Show profile section
        document.getElementById("userName").textContent = `Hello, ${loggedInUser.name}`;

        // Hide login & register links
        document.querySelector('a[href="#login"]').style.display = "none";
        document.querySelector('a[href="#register"]').style.display = "none";

        // Hide login & register forms
        document.getElementById("login").style.display = "none";
        document.getElementById("register").style.display = "none";

        // Show reservation section
        document.getElementById("roomReservation").style.display = "block";
    } else {
        document.getElementById("userProfile").style.display = "none"; // Hide profile section

        // Show login & register links
        document.querySelector('a[href="#login"]').style.display = "block";
        document.querySelector('a[href="#register"]').style.display = "block";

        // Show login & register forms
        document.getElementById("login").style.display = "block";
        document.getElementById("register").style.display = "block";

        // Hide reservation section
        document.getElementById("roomReservation").style.display = "none";
    }

    loadUserReservations();
    loadGlobalReservations();
}

// Registration Form Handling
document.getElementById("registerForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("emailReg").value;
    const password = document.getElementById("passwordReg").value;

    if (name && email && password) {
        let users = getUsers();

        // Check if email already exists
        if (users.some(user => user.email === email)) {
            alert("This email is already registered. Please use a different email.");
            return;
        }

        let newUser = { name, email, password };
        saveUser(newUser);

        alert(`Account successfully created for ${name}! You can now log in.`);
        document.getElementById("registerForm").reset();
    } else {
        alert("Please fill out all fields.");
    }
});

// Login Form Handling
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    let users = getUsers();
    let user = users.find(user => user.email === email && user.password === password);

    if (user) {
        alert(`Welcome back, ${user.name}!`);
        localStorage.setItem("loggedInUser", JSON.stringify(user)); // Store logged-in user
        
        updateUI(); // Update navbar & UI instantly
    } else {
        alert("Invalid email or password. Please try again.");
    }
});

// Logout Functionality
document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("loggedInUser"); // Remove session
    alert("You have been logged out.");

    updateUI(); // Update UI without refresh
});

// Reservation Form Handling
document.getElementById("reservationForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const room = document.getElementById("roomSelect").value;
    const time = document.getElementById("reservationTime").value;
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser) {
        alert("You must be logged in to reserve a room.");
        return;
    }

    let reservations = getReservations();

    // Check if the selected room & time is already reserved
    if (reservations.some(res => res.room === room && res.time === time)) {
        alert("This room is already booked at the selected time.");
        return;
    }

    let newReservation = { id: Date.now(), name: loggedInUser.name, email: loggedInUser.email, room, time };
    reservations.push(newReservation);
    saveReservations(reservations);

    alert("Room successfully reserved!");
    updateUI(); // Refresh UI to ensure login works
});

// Load user reservations
function loadUserReservations() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) return;

    let reservations = getReservations().filter(res => res.email === loggedInUser.email);
    let userReservationsList = document.getElementById("userReservations");
    userReservationsList.innerHTML = "";

    reservations.forEach(res => {
        let li = document.createElement("li");
        li.classList.add("list-group-item");
        li.innerHTML = `
            ${res.room} - ${res.time}
            <button class="btn btn-warning btn-sm float-end" onclick="editReservation(${res.id})">Edit</button>
            <button class="btn btn-danger btn-sm float-end me-2" onclick="deleteReservation(${res.id})">Delete</button>
        `;
        userReservationsList.appendChild(li);
    });
}

// Edit a reservation
function editReservation(id) {
    let reservations = getReservations();
    let reservation = reservations.find(res => res.id === id);

    if (reservation) {
        document.getElementById("roomSelect").value = reservation.room;
        document.getElementById("reservationTime").value = reservation.time;
        
        deleteReservation(id); // Remove old entry before saving the edited one
    }
}

// Delete a reservation
function deleteReservation(id) {
    let reservations = getReservations().filter(res => res.id !== id);
    saveReservations(reservations);

    updateUI(); // Refresh UI after deletion
}

// Load global reservations for public dashboard
function loadGlobalReservations() {
    let reservations = getReservations();
    let allReservationsList = document.getElementById("allReservations");
    allReservationsList.innerHTML = "";

    reservations.forEach(res => {
        let li = document.createElement("li");
        li.classList.add("list-group-item");
        li.textContent = `${res.name} reserved ${res.room} at ${res.time}`;
        allReservationsList.appendChild(li);
    });
}

// Check login status on page load
document.addEventListener("DOMContentLoaded", updateUI);
