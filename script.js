// Select form and posts section
const form = document.getElementById('post-form');
const postsSection = document.getElementById('posts');

// Handle form submission
form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent page refresh

    // Get username and message values
    const username = document.getElementById('username').value.trim();
    const message = document.getElementById('message').value.trim();

    // Validate inputs
    if (!username || !message) {
        alert('Both fields are required!');
        return;
    }
    if (message.length > 500) {
        alert('Message cannot exceed 500 characters!');
        return;
    }

    // Create a new post element
    const post = document.createElement('div');
    post.classList.add('post');
    post.innerHTML = `
        <p class="username">${username}</p>
        <p>${message}</p>
    `;

    // Add the post to the posts section
    postsSection.appendChild(post);

    // Clear the form
    form.reset();
});
// Load posts from localStorage on page load
window.addEventListener('load', () => {
    const savedPosts = JSON.parse(localStorage.getItem('forumPosts')) || [];
    savedPosts.forEach(postData => {
        addPost(postData.username, postData.message);
    });
});

// Save posts to localStorage
function savePosts() {
    const posts = Array.from(document.querySelectorAll('.post')).map(post => ({
        username: post.querySelector('.username').textContent,
        message: post.querySelector('p:last-child').textContent
    }));
    localStorage.setItem('forumPosts', JSON.stringify(posts));
}

// Add a post to the DOM and save
function addPost(username, message) {
    const post = document.createElement('div');
    post.classList.add('post');
    post.innerHTML = `
        <p class="username">${username}</p>
        <p>${message}</p>
    `;
    postsSection.appendChild(post);
    savePosts();
}

// Handle form submission
form.addEventListener('submit', function (event) {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!username || !message || message.length > 500) return;

    addPost(username, message);
    form.reset();
});
