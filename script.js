// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, orderBy, query, serverTimestamp, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDYUkYeTl53Nxi3eCo_QXt9AFjcdMiPzIU",
    authDomain: "memecoinblog.firebaseapp.com",
    projectId: "memecoinblog",
    storageBucket: "memecoinblog.firebasestorage.app",
    messagingSenderId: "974642913362",
    appId: "1:974642913362:web:7215902873c3a40d4bbf8b",
    measurementId: "G-R1GN8X4G7M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM elements
const form = document.getElementById('post-form');
const postsContainer = document.getElementById('posts');
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const logoutButton = document.getElementById('logout-button');

// Track current user
let currentUser = null;

// Authentication: Signup
signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        alert('Signup successful!');
        signupForm.reset();
    } catch (error) {
        console.error("Error during signup: ", error);
        alert("Signup failed. Please try again.");
    }
});

// Authentication: Login
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        alert('Login successful!');
        loginForm.reset();
    } catch (error) {
        console.error("Error during login: ", error);
        alert("Login failed. Please check your credentials and try again.");
    }
});

// Authentication: Logout
logoutButton.addEventListener('click', async () => {
    try {
        await signOut(auth);
        alert('Logged out successfully!');
    } catch (error) {
        console.error("Error during logout: ", error);
        alert("Logout failed. Please try again.");
    }
});

// Handle authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        form.style.display = 'block';
        logoutButton.style.display = 'block';
        loginForm.style.display = 'none';
        signupForm.style.display = 'none';
        loadPosts();
    } else {
        currentUser = null;
        form.style.display = 'none';
        logoutButton.style.display = 'none';
        loginForm.style.display = 'block';
        signupForm.style.display = 'block';
        postsContainer.innerHTML = '';
    }
});

// Submit a new post
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = document.getElementById('message').value.trim();

    if (!message || message.length > 500) {
        alert("Please enter a valid message (max 500 characters).");
        return;
    }

    try {
        await addDoc(collection(db, "posts"), {
            username: currentUser.email,
            message,
            timestamp: serverTimestamp()
        });
        form.reset();
        loadPosts();
    } catch (error) {
        console.error("Error adding post: ", error);
        alert("Could not post your message. Try again.");
    }
});

// Load all posts
async function loadPosts() {
    postsContainer.innerHTML = '';

    try {
        const postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(postsQuery);

        querySnapshot.forEach((doc) => {
            const { username, message, timestamp } = doc.data();
            const postId = doc.id;
            const time = timestamp?.toDate().toLocaleString() || "Just now";

            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.innerHTML = `
                <p class="username">${username} <span class="time">(${time})</span></p>
                <p>${message}</p>
                ${currentUser && currentUser.email === username ? `<button class="delete-button" data-id="${postId}">Delete</button>` : ''}
            `;

            if (currentUser && currentUser.email === username) {
                postElement.querySelector('.delete-button').addEventListener('click', () => deletePost(postId));
            }

            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error("Error loading posts: ", error);
        alert("Could not load posts. Try again later.");
    }
}

// Delete a post
async function deletePost(postId) {
    try {
        await deleteDoc(doc(db, "posts", postId));
        loadPosts();
    } catch (error) {
        console.error("Error deleting post: ", error);
        alert("Could not delete the post. Try again.");
    }
}

// Load posts when the user logs in
window.onload = () => {
    if (currentUser) {
        loadPosts();
    }
};
