// Import the Firebase functions you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, orderBy, query, serverTimestamp, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Firebase configuration (use your Firebase project details)
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

// DOM elements
const form = document.getElementById('post-form');
const postsContainer = document.getElementById('posts');

// Submit a new post
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get username and message values
    const username = document.getElementById('username').value.trim();
    const message = document.getElementById('message').value.trim();

    // Input validation
    if (!username || !message || message.length > 500) {
        alert("Please enter a valid username and message (max 500 characters).");
        return;
    }

    try {
        // Add the post to Firestore
        await addDoc(collection(db, "posts"), {
            username,
            message,
            timestamp: serverTimestamp()
        });

        // Clear the form
        form.reset();

        // Reload posts after adding a new one
        loadPosts();
    } catch (error) {
        console.error("Error adding post: ", error);
        alert("Could not post your message. Try again.");
    }
});

// Load all posts from Firestore
async function loadPosts() {
    // Clear previous posts
    postsContainer.innerHTML = '';

    try {
        // Query posts ordered by timestamp (most recent first)
        const postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(postsQuery);

        querySnapshot.forEach((doc) => {
            const { username, message, timestamp } = doc.data();
            const postId = doc.id;

            // Format timestamp (optional)
            const time = timestamp?.toDate().toLocaleString() || "Just now";

            // Create a new post element
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.innerHTML = `
                <p class="username">${username} <span class="time">(${time})</span></p>
                <p>${message}</p>
                <button class="delete-button" data-id="${postId}">Delete</button>
            `;

            // Attach delete functionality
            postElement.querySelector('.delete-button').addEventListener('click', () => deletePost(postId));

            // Add the post element to the container
            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error("Error loading posts: ", error);
        alert("Could not load posts. Try again later.");
    }
}

// Delete a post from Firestore
async function deletePost(postId) {
    try {
        await deleteDoc(doc(db, "posts", postId));
        loadPosts(); // Refresh posts after deletion
    } catch (error) {
        console.error("Error deleting post: ", error);
        alert("Could not delete the post. Try again.");
    }
}

// Load posts on page load
window.onload = loadPosts;
