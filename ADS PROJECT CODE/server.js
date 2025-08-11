const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const authRoutes = require('./auth');
const playlistRoutes = require('./playlists');

const app = express();
const port = 3000;


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files
app.use('/music', express.static('public/music'));
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: true }));

// Home route with improved design
const renderHomePage = (userSession) => {
    return `
        <style>
            body {
                font-family: 'Poppins', sans-serif;
                background-image: url('https://media.istockphoto.com/id/1280101853/photo/getting-busy-on-something-new.jpg?s=612x612&w=0&k=20&c=4PmmQMmTt1IpcYvd6nUHuu3YQZtUijwhQBKyRKgMqVo=');
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                margin: 0;
                padding: 0;
                display: flex;
                flex-direction: column;
                min-height: 100vh;
                color: #fff;
            }
            header {
                background-color: rgba(0, 0, 0, 0.7);
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .logo-container {
                display: flex;
                align-items: center;
            }
            .logo-container img {
                width: 50px;
                height: 50px;
                margin-right: 10px;
                border-radius: 50%; 
                border: 2px solid #fff; 
            }
            header h1 {
                margin: 0;
                font-size: 2.5em;
                color: #fff;
            }
            nav a {
                margin: 0 15px;
                text-decoration: none;
                color: #fff;
                font-weight: bold;
                transition: color 0.3s ease;
            }
            nav a:hover {
                color: #00b4d8;
            }
            .main-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                padding: 15px;
            }
            .main-content h1 {
                font-size: 3.3em;
                color: rgba(255, 255, 255, 0.9);
            }
            .main-content .button-container a {
                background-color: rgba(0, 123, 255, 0.8);
                padding: 15px 30px;
                border-radius: 50px;
                margin: 10px;
                font-size: 1.2em;
                font-weight: bold;
                text-transform: uppercase;
                transition: background-color 0.3s, transform 0.2s;
            }
            .main-content .button-container a:hover {
                background-color: #FFFFFF;
                transform: translateY(-2px);
            }
            footer {
                background-color: rgba(0, 0, 0, 0.8);
                padding: 10px 0;
                text-align: center;
                color: #fff;
            }
            footer p {
                margin: 0;
                font-size: 0.9em;
            }
            @media (max-width: 768px) {
                header h1 {
                    font-size: 2em;
                }
                .main-content h1 {
                    font-size: 3em;
                }
                .main-content .button-container a {
                    padding: 10px 20px;
                    font-size: 1em;
                }
            }
        </style>

        <header>
            <div class="logo-container">
                <img src="https://i.pinimg.com/236x/d8/09/f9/d809f9b56974e1471eda64bb568a490a.jpg" alt="Logo">
                <h1>RhythM!x</h1>
            </div>
            <nav>
                <a href="/signup">Sign Up</a>
                <a href="/login">Log In</a>
            </nav>
        </header>

        <div class="main-content">
            <h1>${userSession}</h1>
            <div class="button-container">
                <a href="/playlists">My Playlists</a>
                <a href="/profile">Profile</a>
            </div>
        </div>

        <footer>
            <p>&copy; 2024 RhythM!x - Your Music Journey</p>
        </footer>
    `;
};

// Serve the homepage
app.get('/', (req, res) => {
    const userSession = req.session.user ? `Welcome, ${req.session.user}!` : "Every song is a destination, every playlist is a journey. Join us to map your musical adventures "
    'Welcome to RhythM!x';
    res.send(renderHomePage(userSession));
});

// Import routes
app.use(authRoutes);
app.use(playlistRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
