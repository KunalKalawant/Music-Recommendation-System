const express = require('express');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const session = require('express-session');
const router = express.Router();


// Queue Implementation for login history
class Queue {
    constructor() {
        this.items = [];
    }

    enqueue(element) {
        this.items.push(element); // Add element to the queue
    }

    dequeue() {
        if (this.isEmpty()) return "Queue is empty";
        return this.items.shift(); // Remove element from 
    }

    isEmpty() {
        return this.items.length === 0;
    }

    peek() {
        if (this.isEmpty()) return "Queue is empty";
        return this.items[0]; 
    }

    printQueue() {
        return this.items.join(', ');
    }
}

// Binary Search Tree Node Definition
class BSTNode {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.loginHistory = new Queue();
        this.left = null;
        this.right = null;
    }
}

// Binary Search Tree Definition for managing users
class BST {
    constructor() {
        this.root = null;
    }

    insert(username, password) {
        const newNode = new BSTNode(username, password);
        if (!this.root) {
            this.root = newNode;
        } else {
            this._insertNode(this.root, newNode);
        }
    }

    _insertNode(node, newNode) {
        if (newNode.username < node.username) {
            if (!node.left) {
                node.left = newNode;
            } else {
                this._insertNode(node.left, newNode);
            }
        } else {
            if (!node.right) {
                node.right = newNode;
            } else {
                this._insertNode(node.right, newNode);
            }
        }
    }

    search(username) {
        return this._searchNode(this.root, username);
    }

    _searchNode(node, username) {
        if (!node) return null; 
        if (username === node.username) return node;
        if (username < node.username) return this._searchNode(node.left, username);
        return this._searchNode(node.right, username);
    }
}

const users = new BST(); 

// Configure express-session
router.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// Serve static files
router.use(express.static('public')); 

const styles = `
<style>
    body {
        font-family: 'Montserrat', sans-serif;
        background-color: #121212;
        color: #ffffff;
        margin: 0;
        padding: 20px;
    }
    h2 {
        color: #1DB954;
        font-weight: bold;
    }
    form {
        background: #282828;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        margin-bottom: 20px;
        transition: all 0.3s ease-in-out;
    }
    form:hover {
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
    }
    input {
        width: 100%;
        padding: 15px;
        margin: 10px 0;
        border: 1px solid #333;
        border-radius: 4px;
        background-color: #3e3e3e;
        color: #fff;
        font-size: 14px;
    }
    input:focus {
        outline: none;
        border-color: #1DB954;
    }
    button {
        background-color: #1DB954;
        color: white;
        border: none;
        padding: 15px;
        border-radius: 50px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        transition: background-color 0.3s ease;
        width: 100%;
    }
    button:hover {
        background-color: #1aa34a;
    }
    p {
        margin: 0;
        font-size: 14px;
    }
    a {
        color: #1DB954;
        text-decoration: none;
    }
    a:hover {
        text-decoration: underline;
    }
    .profile-card {
        background-color: #282828;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        text-align: center;
    }
    .profile-card h2 {
        margin-bottom: 20px;
    }
    .profile-card p {
        font-size: 16px;
        color: #b3b3b3;
    }
    .profile-card a {
        display: inline-block;
        margin-top: 20px;
        padding: 10px 20px;
        background-color: #1DB954;
        border-radius: 50px;
        color: white;
        text-decoration: none;
        font-weight: bold;
        transition: background-color 0.3s ease;
    }
    .profile-card a:hover {
        background-color: #1aa34a;
    }
</style>
`;

// Sign Up Route
router.get('/signup', (req, res) => {
    res.send(`
        ${styles}
        <h2>Sign Up</h2>
        <form action="/signup" method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Sign Up</button>
        </form>
        <p>Already have an account? <a href="/login">Log In</a></p>
    `);
});

// Handle Sign Up
router.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); 
    users.insert(username, hashedPassword); 
    req.session.user = username; 
    res.redirect('/profile'); 
});

// Login Route
router.get('/login', (req, res) => {
    res.send(`
        ${styles}
        <h2>Log In</h2>
        <form action="/login" method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Log In</button>
        </form>
        <p>Don't have an account? <a href="/signup">Sign Up</a></p>
    `);
});

// Handle Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const userNode = users.search(username);

    if (userNode && await bcrypt.compare(password, userNode.password)) {
        req.session.user = username; 
        userNode.loginHistory.enqueue(new Date().toISOString()); 
        return res.redirect('/profile'); // Redirect to profile
    }
    
    res.send('Invalid username or password!'); 
});

// Handle Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/profile'); 
        }
        res.redirect('/'); 
    });
});

// Profile Route
router.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); 
    }

    const styles = `
    <style>
        body {
            font-family: 'Montserrat', sans-serif;
            background-color: #121212;
            color: #ffffff;
            margin: 0;
            padding: 20px;
        }
        h2 {
            color: #1DB954;
            font-weight: bold;
        }
        .profile-card {
            background-color: #282828;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 400px;
            margin: auto;
            transition: all 0.3s ease-in-out;
        }
        .profile-card:hover {
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
        }
        .profile-image {
            border-radius: 50%;
            width: 100px;
            height: 100px;
            margin: 20px auto;
            border: 3px solid #1DB954;
            object-fit: cover; 
        }
        p {
            margin: 10px 0;
            font-size: 16px;
        }
        a {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #1DB954;
            border-radius: 50px;
            color: white;
            text-decoration: none;
            font-weight: bold;
            transition: background-color 0.3s ease;
        }
        a:hover {
            background-color: #1aa34a;
        }
    </style>
    `;

    // Render Profile Page
    const userNode = users.search(req.session.user);
    const loginHistory = userNode.loginHistory.printQueue() || 'No login history';

    res.send(`
        ${styles}
        <div class="profile-card">
            <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" alt="Profile Photo" class="profile-image" /> <!-- Placeholder Image -->
            <h2>Profile</h2>
            <p><strong>Username:</strong> ${req.session.user}</p>
            <p><strong>Login History:</strong> ${loginHistory}</p>
            <a href="/logout">Log Out</a>
            <br>
            <a href="/" style="margin-top: 20px;">
                Back to Home
            </a>
        </div>
    `);
});

// Profile Route
router.get('/profile', (req, res) => {
    // Check if user is authenticated
    if (!req.session.user) {
        return res.redirect('/login'); 
    }

    const userNode = users.search(req.session.user);
    const loginHistory = userNode.loginHistory.printQueue() || 'No login history(new account)';
    const userProfile = userProfiles[req.session.user];

    res.send(`
        ${styles}
        <div class="profile-card">
            <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" alt="Profile Photo" class="profile-image" /> <!-- Placeholder Image -->
            <h2>Profile</h2>
            <p><strong>Username:</strong> ${req.session.user}</p>
            <p><strong>Email:</strong> ${userProfile.email || 'Not provided'}</p>
            <p><strong>Login History:</strong> ${loginHistory}</p>
            <a href="/logout">Log Out</a>
            <br>
            <a href="/update-profile">Update Profile</a> <!-- Link to update profile -->
            <br>
            <a href="/" style="margin-top: 20px;">
                Back to Home
            </a>
        </div>
    `);
});

// Export Router
module.exports = router;