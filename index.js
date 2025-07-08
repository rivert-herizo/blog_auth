import express from 'express';
import dotenv from 'dotenv';
import pg from 'pg';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import expressEjsLayouts from 'express-ejs-layouts';
import bcrypt from 'bcrypt';
import session from 'express-session';
import passport from 'passport';

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const port = 3000;
const saltRound = 10;

app.use(session({
    secret: process.env.SESSION_SECRET, // get the session secret
    resave: false, // don't resave already saved session
    saveUninitialized: true, // save uninitialized session
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // save the session for 24 hours
    } 
}));

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

app.get('/register', (req, res) => {
    res.render('register.ejs', {
        layout: 'layout',
        title: 'Register',
        isAuthenticated: isAuthenticated
    });
})

app.get('/login', (req, res) => {
    res.render('login.ejs', {
        layout: 'layout',
        title: 'Login',
        isAuthenticated: isAuthenticated
    });
})


app.post('/register', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.username;

    try {
        const emailCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if (emailCheck.rows.length > 0) {
            res.redirect('/login');
        } else {
            bcrypt.hash(password, saltRound, async (error, hash) => {
                if (error){
                    console.log('Error hashing the password :', error)
                } else {
                    const result = await db.query('INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *', [email, hash, name]);
                    const user = result.rows[0];
                    res.redirect('/login');
                }
            });
        }
    }
    catch (error) {
        console.log(error)
    }
});



// initialize server
app.listen(port, () => {
    console.log("Server is running on port " + port)
});