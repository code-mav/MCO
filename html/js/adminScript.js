// Function to get stored users (admins and regular users) from localStorage
function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

// Function to save users to localStorage
function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

// Function to update UI dynamically after login
function updateUI() {
    const loggedInAdmin = JSON.parse(localStorage.getItem("loggedInAdmin"));

    if (loggedInAdmin) {
        document.getElementById("adminProfile").style.display = "flex"; // Show profile section
        document.getElementById("adminName").textContent = `Hello, ${loggedInAdmin.name}`;
        document.getElementById("logoutBtn").style.display = "block";

        // Hide login form and show admin panels
        document.querySelector('a[href="#login"]').style.display = "none";
        document.querySelector('a[href="#registerAdmin"]').style.display = "none";
        
        document.getElementById("login").style.display = "none";
        document.getElementById("registerAdmin").style.display = "none";
        document.getElementById("manageReservations").style.display = "block";
        document.getElementById("reservationCheck").style.display = "block";
        document.getElementById("manageUsers").style.display = "block";
    } else {
        document.getElementById("adminProfile").style.display = "none"; // Hide profile section
        document.getElementById("logoutBtn").style.display = "none";

        document.querySelector('a[href="#login"]').style.display = "block";
        document.querySelector('a[href="#registerAdmin"]').style.display = "block";

        document.getElementById("login").style.display = "block"; // Show login form
        document.getElementById("registerAdmin").style.display = "block"; // Show register form
        document.getElementById("manageReservations").style.display = "none";
        document.getElementById("reservationCheck").style.display = "none";
        document.getElementById("manageUsers").style.display = "none";
        
    }

    loadUsers();
    loadReservations();
}

// Admin Login
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    let admins = getUsers(); // Assuming admins are saved in users list

    // Check for admin login (can be modified to check admin-specific credentials)
    let admin = admins.find(admin => admin.email === email && admin.password === password);

    if (admin) {
        localStorage.setItem("loggedInAdmin", JSON.stringify(admin)); // Set logged-in admin
        updateUI();
    } else {
        alert("Invalid credentials. Please try again.");
    }
});

// Admin Logout
document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("loggedInAdmin");
    alert("You have logged out.");
    location.reload();
});

// Admin Registration
document.getElementById("registerAdminForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("registerAdminName").value;
    const email = document.getElementById("registerAdminEmail").value;
    const password = document.getElementById("registerAdminPassword").value;

    const admins = getUsers();

    // Check if email already exists
    if (admins.some(admin => admin.email === email)) {
        alert("An admin with this email already exists.");
        return;
    }

    // Create new admin and save
    const newAdmin = { name, email, password, role: "admin" };
    admins.push(newAdmin);
    saveUsers(admins);

    alert("Admin registered successfully. Please log in.");
    document.getElementById("registerAdminForm").reset();
    window.location.hash = "#login";  // Switch to login page
});

// Load data on page load
document.addEventListener("DOMContentLoaded", updateUI);

// Function to update the UI with users
function loadUsers() {
    const users = getUsers();
    let userList = document.getElementById("userList");
    userList.innerHTML = "";

    if (users.length === 0) {
        userList.innerHTML = "<li class='list-group-item'>No users registered yet.</li>";
        return;
    }

    users.forEach((user, index) => {
        let li = document.createElement("li");
        li.classList.add("list-group-item");
        li.innerHTML = `
            ${user.name} (${user.email}) 
            <button class="btn btn-danger btn-sm float-end" onclick="removeUser(${index})">Remove</button>
        `;
        userList.appendChild(li);
    });
}

// Function to delete a user
function removeUser(index) {
    let users = getUsers();

    if (window.confirm("Are you sure you want to remove this user?")) {
        users.splice(index, 1);
        saveUsers(users);
        loadUsers();
    }

}

// Call this function when the page loads to display users
document.addEventListener("DOMContentLoaded", loadUsers);

// Function to get stored reservations from localStorage
function getReservations() {
    return JSON.parse(localStorage.getItem("reservations")) || [];
}

// Function to save reservations
function saveReservations(reservations) {
    localStorage.setItem("reservations", JSON.stringify(reservations));
}

// Function to load reservations
function loadReservations() {
    const reservations = getReservations();
    const tableBody = document.getElementById("reservationsTable").getElementsByTagName("tbody")[0];
    tableBody.innerHTML = ""; // Clear existing table rows

    reservations.forEach((reservation) => {
        const row = tableBody.insertRow();

        const nameCell = row.insertCell(0);
        const emailCell = row.insertCell(1);
        const roomCell = row.insertCell(2);
        const timeCell = row.insertCell(3);
        const actionsCell = row.insertCell(4);

        nameCell.textContent = reservation.name;
        emailCell.textContent = reservation.email;
        roomCell.textContent = reservation.room;
        timeCell.textContent = reservation.time;

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.classList.add("btn", "btn-warning", "btn-sm");
        editButton.addEventListener("click", () => editReservation(reservation));

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.classList.add("btn", "btn-danger", "btn-sm");
        removeButton.addEventListener("click", () => removeReservation(reservation.id));

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(removeButton);
    });
}

// Function to edit a reservation
function editReservation(reservation) {
    // Show the edit reservation form
    document.getElementById("editReservationSection").style.display = "block";

    // Pre-fill the form with the current reservation data
    document.getElementById("roomSelectEdit").value = reservation.room;
    document.getElementById("reservationTimeEdit").value = reservation.time;

    // Save the reservation ID in the form for later use
    document.getElementById("editReservationForm").dataset.reservationId = reservation.id;
}

// Handle saving the edited reservation
document.getElementById("editReservationForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const room = document.getElementById("roomSelectEdit").value;
    const time = document.getElementById("reservationTimeEdit").value.trim();
    const reservationId = document.getElementById("editReservationForm").dataset.reservationId;

    // Validate time format (HH:MM)
    const timeRegex = /^([0-9]{2}):([0-9]{2})$/;
    if (!timeRegex.test(time)) {
        alert("Invalid time format. Please use HH:MM (e.g., 07:00).");
        return;
    }

    const [hour, minutes] = time.split(":").map(Number);

    // Ensure the time is between 7 AM and 6 PM
    if (hour < 7 || hour > 18 || (hour === 18 && minutes > 0)) {
        alert("Reservations can only be made between 7 AM and 6 PM.");
        return;
    }

    // Get existing reservations
    let reservations = getReservations();

    // Find the reservation to edit and update it
    const reservationIndex = reservations.findIndex(res => res.id === reservationId);
    if (reservationIndex !== -1) {
        reservations[reservationIndex].room = room;
        reservations[reservationIndex].time = time;

        // Save the updated reservations back to localStorage
        saveReservations(reservations);

        alert(`Reservation for ${room} successfully updated to ${time}.`);

        // Refresh the reservation table
        loadReservations();

        // Hide the edit form
        document.getElementById("editReservationSection").style.display = "none";
    }
});

// Handle canceling the edit
document.getElementById("cancelEditBtn").addEventListener("click", function () {
    document.getElementById("editReservationSection").style.display = "none";
});

// Function to remove a reservation
function removeReservation(reservationId) {
    let reservations = getReservations();
    reservations = reservations.filter(res => res.id !== reservationId);
    saveReservations(reservations);

    // Refresh the reservation table
    loadReservations();
}

// Call this function when the page loads to display reservations
document.addEventListener("DOMContentLoaded", loadReservations);

// Function to check room availability
function checkRoomAvailability(room, time) {
    let reservations = getReservations();
    // Check if the selected room and time already have a reservation
    return reservations.some(res => res.room === room && res.time === time);
}

// Handle checking availability
document.getElementById("checkAvailabilityForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const room = document.getElementById("roomSelectCheck").value;
    const time = document.getElementById("reservationTimeCheck").value.trim();

    // Validate time format (HH:MM)
    const timeRegex = /^([0-9]{2}):([0-9]{2})$/;
    if (!timeRegex.test(time)) {
        alert("Invalid time format. Please use HH:MM (e.g., 07:00).");
        return;
    }

    const [hour, minutes] = time.split(":").map(Number);

    // Ensure the time is between 7 AM and 6 PM
    if (hour < 7 || hour > 18 || (hour === 18 && minutes > 0)) {
        alert("Reservations can only be made between 7 AM and 6 PM.");
        return;
    }

    // Check if room is available
    const isAvailable = !checkRoomAvailability(room, time);

    const availabilityResult = document.getElementById("availabilityResult");
    const confirmReservationSection = document.getElementById("confirmReservationSection");

    if (isAvailable) {
        availabilityResult.innerHTML = `<div class="alert alert-success">The room is available at ${time}. You can now confirm the reservation.</div>`;
        confirmReservationSection.style.display = "block"; // Show the confirm button
    } else {
        availabilityResult.innerHTML = `<div class="alert alert-danger">The room is already reserved at ${time}. Please choose a different time.</div>`;
        confirmReservationSection.style.display = "none"; // Hide the confirm button
    }
});

// Handle confirming reservation
document.getElementById("confirmReservationBtn").addEventListener("click", function () {
    const room = document.getElementById("roomSelectCheck").value;
    const time = document.getElementById("reservationTimeCheck").value.trim();
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser) {
        alert("You must be logged in to make a reservation.");
        return;
    }

    // Create a new reservation object
    const newReservation = {
        id: Date.now(),
        name: loggedInUser.name,
        email: loggedInUser.email,
        room: room,
        time: time
    };

    // Save the reservation
    let reservations = getReservations();
    reservations.push(newReservation);
    saveReservations(reservations);

    alert(`${room} successfully reserved for ${loggedInUser.name} at ${time}!`);

    // Refresh the reservations list
    loadReservations();

    // Clear the form and hide the confirmation section
    document.getElementById("checkAvailabilityForm").reset();
    document.getElementById("availabilityResult").innerHTML = "";
    document.getElementById("confirmReservationSection").style.display = "none";
});
