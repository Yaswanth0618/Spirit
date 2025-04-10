// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("WealthifyRegister");

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
    const db = getDatabase(app);

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (validateForm()) {
            const fullName = document.getElementById("fullName").value.trim();
            const email = document.getElementById("emailCreate").value.trim();
            const password = document.getElementById("passwordCreate").value.trim();

            // Create user in Firebase Authentication
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    const userId = user.uid;

                    // Store additional user details in Realtime Database
                    set(ref(db, `users/${userId}`), {
                        fullName: fullName,
                        email: email
                    })
                        .then(() => {
                            showModal("Account Registered! Redirecting to Login...");
                            setTimeout(() => {
                                window.location.href = "index.html"; // Redirect after 2 sec
                            }, 2000);
                        })
                        .catch((error) => {
                            showModal("Error saving user details: " + error.message);
                        });
                })
                .catch((error) => {
                    showModal("Error signing up: " + error.message);
                });
        }
    });

    // Validate form inputs
    function validateForm() {
        var fullName = document.getElementById("fullName").value.trim();
        var email = document.getElementById("emailCreate").value.trim();
        var password = document.getElementById("passwordCreate").value.trim();

        if (fullName === "") {
            showModal("Please enter your full name.");
            return false;
        }
        if (email === "" || !isValidEmail(email)) {
            showModal("Please enter a valid email address.");
            return false;
        }
        if (!isValidPassword(password)) {
            showModal("Password must be at least 6 characters long, contain at least one uppercase letter, and one special character.");
            return false;
        }
        return true;
    }

    // Show the modal with a message
    function showModal(message) {
        document.getElementById("modalMessage").innerText = message;
        document.getElementById("customModal").style.display = "block";
        document.getElementById("modalBackdrop").style.display = "block";
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPassword(password) {
        return /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{6,}$/.test(password);
    }
});