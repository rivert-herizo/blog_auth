import express from 'express';
import dotenv from 'dotenv';
import pg from 'pg';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import expressEjsLayouts from 'express-ejs-layouts';

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const port = 3000;

// Middleware setup
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(expressEjsLayouts); // Use EJS layouts
app.set('view engine', 'ejs'); // Set EJS as the templating engine

let isAuthenticated = false; // Placeholder for authentication check


// PostgreSQL database connection
const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

db.connect();

// Define routes
app.get('/home', (req, res) =>  {
    isAuthenticated = true;
    res.render('index.ejs', {
    layout: 'layout', 
    title: 'Home', 
    isAuthenticated : isAuthenticated
})
});

app.get('/login', (req, res) => {
    res.render('login.ejs', {
        layout: 'layout',
        title: 'Login',
        isAuthenticated: isAuthenticated
    });
})

app.get('/register', (req, res) => {
    res.render('register.ejs', {
        layout: 'layout',
        title: 'Login',
        isAuthenticated: isAuthenticated
    });
})

// initialize server
app.listen(port, () => {
    console.log("Server is running on port " + port)
});