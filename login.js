// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAh401N1L6B7pH8ptuUJn1RQqIgsmA_wxA",
    authDomain: "fbla-cap.firebaseapp.com",
    databaseURL: "https://fbla-cap-default-rtdb.firebaseio.com",
    projectId: "fbla-cap",
    storageBucket: "fbla-cap.firebasestorage.app",
    messagingSenderId: "1077354575909",
    appId: "1:1077354575909:web:17cf430d6d1506e8a767cc",
    measurementId: "G-GED46SP8LQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get the Firebase Authentication instance
const auth = getAuth(app);

// Wait for the DOM to fully load before executing the script
document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.login__form');

    // Add a submit event listener to the form
    form.addEventListener('submit', function (event) {
        // Prevent the default form submission behavior
        event.preventDefault();

        // Get the trimmed values of email and password input fields
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        // Validate the login form inputs
        if (validateLoginForm(email, password)) {
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Retrieve the signed-in user information
                    const user = userCredential.user;

                    localStorage.setItem("user", JSON.stringify(user));

                    // Show a modal indicating successful login
                    showModal("Login Successful! Redirecting...");

                    setTimeout(() => {
                        window.location.href = 'home.html';
                    }, 2000);
                })
                .catch((error) => {
                    // Show a modal with an error message if login fails
                    showModal("Invalid email or password. Please try again.");
                });
        }
    });

    // Validate login form input
    function validateLoginForm(email, password) {
        if (email === '' || !isValidEmail(email)) {
            showModal('Please enter a valid email address.');
            return false;
        }

        if (password === '') {
            showModal('Please enter your password.');
            return false;
        }

        return true;
    }

    // Show modal with message
    function showModal(message) {
        document.getElementById('modalMessage').innerText = message;
        document.getElementById('customModal').style.display = 'block';
        document.getElementById('modalBackdrop').style.display = 'block';
    }

    // Validate email format
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
});