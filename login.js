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
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.login__form');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (validateLoginForm(email, password)) {
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;

                    // Store session in localStorage
                    localStorage.setItem("user", JSON.stringify(user));

                    showModal("Login Successful! Redirecting...");

                    // Redirect after modal closes
                    setTimeout(() => {
                        window.location.href = 'home.html';
                    }, 2000);
                })
                .catch((error) => {
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