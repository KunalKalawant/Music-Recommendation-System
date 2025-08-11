const express = require('express');
const router = express.Router();

let playlists = {
    user1: {
        'Chill Vibes': [
            { title: 'Song 1 - Chill', file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrDEh-mqUkyH_phMeLRehqsD4nPqLFtMjdeA&s' },
            { title: 'Song 2 - Relax', file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', image: 'https://example.com/image2.jpg' },
            { title: 'Song 3 - Peaceful', file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', image: 'https://example.com/image3.jpg' }
        ],
        'Workout Mix': [
            { title: 'Song 4 - Pumped Up', file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', image: 'https://example.com/image4.jpg' },
            { title: 'Song 5 - Energetic', file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', image: 'https://example.com/image5.jpg' }
        ]
    },
    user2: {
        'Party Hits': [
            { title: 'Song 6 - Dance', file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', image: 'https://example.com/image1.jpg' },
            { title: 'Song 7 - Celebrate', file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', image: 'https://example.com/image1.jpg' }
        ],
        'Favorites': [
            { title: 'Song 8 - Classic', file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', image: 'https://example.com/image1.jpg' },
            { title: 'Song 9 - Iconic', file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', image: 'https://example.com/image1.jpg' },
            { title: 'Song 10 - Timeless', file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', image: 'https://example.com/image1.jpg' }
        ],
        'New Hits': [
            { title: 'Song 11 - Trendy', file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', image: 'https://example.com/image1.jpg' },
            { title: 'Song 12 - Fresh', file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', image: 'https://example.com/image1.jpg' }
        ]
    }
}



// Authentication Middleware
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
};

// Graph Creation for BFS Recommendation
const createGraph = (playlists) => {
    const graph = {};

    for (const user in playlists) {
        for (const playlist in playlists[user]) {
            const songs = playlists[user][playlist];
            for (const song of songs) {
                if (!graph[song.title]) {
                    graph[song.title] = new Set();
                }
                for (const otherSong of songs) {
                    if (song.title !== otherSong.title) {
                        graph[song.title].add(otherSong.title);
                    }
                }
            }
        }
    }

    return graph;
};

// BFS Recommendation Algorithm
const bfsRecommend = (graph, startSong) => {
    const visited = new Set();
    const recommendations = [];

    const queue = [startSong];
    visited.add(startSong);

    while (queue.length > 0) {
        const song = queue.shift();

        for (const neighbor of graph[song] || []) {
            if (!visited.has(neighbor)) {
                recommendations.push(neighbor);
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }

    return recommendations;
};

// Playlist Page
router.get('/playlists', isAuthenticated, (req, res) => {
    const user = req.session.user;
    const userPlaylists = playlists[user] || {};

    const searchQuery = req.query.search ? req.query.search : '';

    const graph = createGraph(playlists);

    const filteredPlaylists = bfsSearch(playlists, searchQuery);

    let recommendations = [];
    if (searchQuery) {
        const songs = Object.values(filteredPlaylists).flat();
        if (songs.length > 0) {
            recommendations = bfsRecommend(graph, songs[0].title);
        }
    }

    res.send(`
        <style>
    body {
        font-family: 'Arial', sans-serif;
        background-image: url('https://static7.depositphotos.com/1025323/771/i/450/depositphotos_7710594-stock-photo-colors-of-music.jpg'); /* Full background image */
        background-size: cover; /* Ensure the image covers the entire background */
        background-position: center;
        background-repeat: no-repeat;
        color: #fff;
        margin: 0;
        padding: 20px;
    }

    h2 {
        text-align: center;
        color: #e62e00; 
    }

    .form-container, .playlist {
        background-color: rgba(24, 24, 24, 0.9);
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        margin: 20px auto;
        padding: 20px;
        max-width: 600px;
    }

    .form-container h3 {
        text-align: center;
        color: #e62e00; 
    }

    input[type="text"], input[type="submit"], button, select {
        padding: 10px;
        margin: 5px 0;
        border: none;
        border-radius: 4px;
        width: calc(100% - 22px);
        background-color: #282828; 
        color: #fff;
    }

    button {
        background-color: #e62e00; 
        color: white;
        border: none;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    button:hover {
        background-color: #cc2900; 
    }

    .playlist h3 {
        margin: 10px 0;
        color: #fff;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    ul li {
        background-color: #282828; 
        margin: 5px 0;
        padding: 10px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    ul li img {
        width: 100px;  
        height: 100px;
        margin-right: 10px;
        border-radius: 10%;  
    }

    ul li span {
        display: flex;
        align-items: center;
    }

    ul li:hover {
        background-color: #333; 
    }

    audio {
        margin-top: 10px;
        width: 100%;
    }

    select {
        background-color: #121212; 
        color: white;
        margin-left: 10px;
    }

    .recommendations h3 {
        margin-top: 20px;
        color: #e62e00; 
    }

    .recommendations ul li {
        background-color: #282828;
        margin: 5px 0;
        padding: 10px;
        border-radius: 4px;
    }

    .search-container {
        margin-bottom: 20px;
    }

    .search-container input {
        border: 1px solid #e62e00; 
    }
</style>

        <h2>Playlists</h2>
        
        <!-- Search Form -->
        <div>
            <form action="/playlists" method="GET">
                <input type="text" name="search" placeholder="Search Playlists or Songs" value="${searchQuery}">
                <button type="submit">Search</button>
            </form>
        </div>
        
        <!-- Recommendations Section -->
        <div class="recommendations">
            <h3>Recommendations</h3>
            <ul>
                ${recommendations.length > 0 ? recommendations.map(song => `<li>${song}</li>`).join('') : '<li>No recommendations yet.</li>'}
            </ul>
        </div>
        
        <!-- Create Playlist Form -->
        <div class="form-container">
            <h3>Create Playlist</h3>
            <form action="/playlists" method="POST">
                <input type="text" name="name" placeholder="Playlist Name" required>
                <button type="submit">Create Playlist</button>
            </form>
        </div>
        
        <!-- Playlist List -->
        <div>
            ${Object.entries(filteredPlaylists).map(([playlistName, songs]) => `
                <div class="playlist">
                    <h3>${playlistName}</h3>
                    <ul>
    ${songs.map(song => `
        <li>
            <span>
                <img src="${song.image}" alt="${song.title} Image" style="width: 30px; height: 30px; margin-right: 10px; border-radius: 50%;">
                ${song.title}
            </span>
            <audio controls>
                <source src="${song.file}" type="audio/mpeg">
                Your browser does not support the audio element.
            </audio>
            <!-- Check if the song is already in the user's playlist -->
            ${userPlaylists[playlistName] && userPlaylists[playlistName].find(s => s.title === song.title) ? '' : `
            <form action="/playlists/add" method="POST" style="display:inline;">
                <input type="hidden" name="song" value="${song.title}">
                <select name="playlistName">
                    ${Object.keys(userPlaylists).map(userPlaylist => `
                        <option value="${userPlaylist}">${userPlaylist}</option>
                    `).join('')}
                </select>
                <button type="submit">Add to My Playlist</button>
            </form>
            `}
        </li>
    `).join('')}
</ul>

                </div>
            `).join('')}
        </div>
        `);
        
            });        
// Create a new playlist
router.post('/playlists', isAuthenticated, (req, res) => {
    const user = req.session.user;
    const { name } = req.body;

    if (!playlists[user]) {
        playlists[user] = {};
    }

    playlists[user][name] = []; 
    res.redirect('/playlists');
});

// Add a song to an existing playlist
router.post('/playlists/add', isAuthenticated, (req, res) => {
    const user = req.session.user;
    const { song, playlistName } = req.body;

    const songToAdd = Object.values(playlists).flatMap(userPlaylists =>
        Object.values(userPlaylists).flat()
    ).find(s => s.title === song);

    if (playlists[user] && playlists[user][playlistName] && songToAdd) {
        playlists[user][playlistName].push(songToAdd); 
    }

    res.redirect('/playlists');
});

// BFS Search for Playlists/Songs
const bfsSearch = (playlists, query) => {
    const result = {};
    const queue = [];

    for (const user in playlists) {
        for (const playlistName in playlists[user]) {
            queue.push({ name: playlistName, songs: playlists[user][playlistName] });
        }
    }

    while (queue.length > 0) {
        const { name: currentPlaylist, songs } = queue.shift();

        if (currentPlaylist.toLowerCase().includes(query.toLowerCase())) {
            result[currentPlaylist] = songs; 
        } else {
            const matchingSongs = songs.filter(song =>
                song.title.toLowerCase().includes(query.toLowerCase())
            );
            if (matchingSongs.length > 0) {
                result[currentPlaylist] = matchingSongs; 
            }
        }
    }

    return result;
};

module.exports = router;
