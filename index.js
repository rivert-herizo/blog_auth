import express from 'express';
import dotenv from 'dotenv';
import pg from 'pg';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import passport from 'passport';
import { Strategy } from 'passport-local';
import GoogleStrategy from 'passport-google-auth2'; 
import expressEjsLayouts from 'express-ejs-layouts';
import bcrypt from 'bcrypt';
import session from 'express-session';
import e from 'express';

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

app.use(passport.initialize());
app.use(passport.session());

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

app.post("/login",
    passport.authenticate("local", {
        successRedirect : '/home',
        failureRedirect : '/login',
    })
)


app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) console.log(err);
        res.redirect("/login");
        isAuthenticated = false; // Reset authentication status
    })
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

passport.use(
    'local', 
    new Strategy(async function verify(username, password, cb) {
        try {
            const checkUser = await db.query('SELECT * FROM users WHERE email = $1', [username]);
            if(checkUser.rows.length) {
                const user = checkUser.rows[0];
                const hashedPassword = user.password;
                console.log(hashedPassword);
                bcrypt.compare(password, hashedPassword, (err, valid) => {
                    if(err) {
                        console.log('Error comparing passwords');
                        return cb(err)
                    } else {
                        if(valid) {
                            return cb(null, user)
                        } else {
                            return cb(null, false)
                        }
                    }
                })
            } else {
                return cb("User not found")
            }
        } catch (error) {
            console.log(error);
        }
    }
));

// app.use(
//     'Google', 
//     new GoogleStrategy({
//         clientID: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         callbackURL: 'http://localhost:3000/auth/google/home',
//         userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
//     }), 
//     async (accessToken, refreshToken, profile, cb) => {
//         try {
//             console.log('Google profile:', profile);
//             const email = profile.email;
//             const name = profile.family_name + ' ' + profile.given_name;
//             const checkUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
//             if (checkUser.rows.length === 0) {
//                 const newUser = await db.query('INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *', [email, 'google-auth2', name]);
//                 return cb(null, newUser.rows[0]);
//             }
//             else {
//                 return cb(null, newUser.rows[0]);
//             }
            
//         }
//         catch (error){
//             return cb(error);
//         }
//     }
// );

passport.serializeUser((user, cb) => {
    cb(null,user);
});

passport.deserializeUser((user, cb) => {
    cb(null,user);
});

// initialize server
app.listen(port, () => {
    console.log("Server is running on port " + port)
});