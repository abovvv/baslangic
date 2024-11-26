// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDYUkYeTl53Nxi3eCo_QXt9AFjcdMiPzIU",
    authDomain: "memecoinblog.firebaseapp.com",
    projectId: "memecoinblog",
    storageBucket: "memecoinblog.firebasestorage.app",
    messagingSenderId: "974642913362",
    appId: "1:974642913362:web:7215902873c3a40d4bbf8b",
    measurementId: "G-R1GN8X4G7M"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// DOM Elements
const loginSection = document.getElementById('login-section');
const signupSection = document.getElementById('signup-section');
const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');
const postSection = document.getElementById('post-section');
const postsContainer = document.getElementById('posts');
const searchBar = document.getElementById('search-bar');
const searchButton = document.getElementById('search-button');

// Toggle Login and Signup Forms
loginButton.addEventListener('click', () => {
    loginSection.classList.remove('hidden');
});

signupButton.addEventListener('click', () => {
    signupSection.classList.remove('hidden');
});

document.querySelectorAll('.close-button').forEach(button => {
    button.addEventListener('click', () => {
        loginSection.classList.add('hidden');
        signupSection.classList.add('hidden');
    });
});

// Signup Functionality
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await addDoc(collection(db, "users"), {
            uid: user.uid,
            username: username,
            email: email
        });
        alert("Signup successful!");
        signupSection.classList.add('hidden');
    } catch (error) {
        console.error("Error signing up: ", error.message);
    }
});

// Login Functionality
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = document.getElementById('login-username-email').value;
    const password = document.getElementById('login-password').value;

    try {
        // Check if login is via email or username
        let email = identifier;
        if (!identifier.includes("@")) {
            const q = query(collection(db, "users"), where("username", "==", identifier));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) throw new Error("Username not found");
            email = querySnapshot.docs[0].data().email;
        }
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login successful!");
        loginSection.classList.add('hidden');
    } catch (error) {
        console.error("Error logging in: ", error.message);
    }
});

// Post Functionality
document.getElementById('post-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = document.getElementById('message').value;

    try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not logged in");

        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const username = querySnapshot.docs[0].data().username;

        await addDoc(collection(db, "posts"), {
            username: username,
            message: message,
            timestamp: new Date()
        });
        alert("Post added!");
        loadPosts();
        document.getElementById('message').value = "";
    } catch (error) {
        console.error("Error adding post: ", error.message);
    }
});

// Load Posts
async function loadPosts() {
    postsContainer.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "posts"));
    querySnapshot.forEach(doc => {
        const post = doc.data();
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <p class="username">${post.username}</p>
            <p>${post.message}</p>
        `;
        postsContainer.appendChild(postElement);
    });
}

// Search Posts
searchButton.addEventListener('click', async () => {
    const searchTerm = searchBar.value.toLowerCase();
    postsContainer.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "posts"));
    querySnapshot.forEach(doc => {
        const post = doc.data();
        if (post.message.toLowerCase().includes(searchTerm) || post.username.toLowerCase().includes(searchTerm)) {
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.innerHTML = `
                <p class="username">${post.username}</p>
                <p>${post.message}</p>
            `;
            postsContainer.appendChild(postElement);
        }
    });
});

// Handle Authentication State
onAuthStateChanged(auth, (user) => {
    if (user) {
        postSection.classList.remove('hidden');
        loadPosts();
        loginButton.style.display = "none";
        signupButton.style.display = "none";
    } else {
        postSection.classList.add('hidden');
        loginButton.style.display = "inline";
        signupButton.style.display = "inline";
    }
});
