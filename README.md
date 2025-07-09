Hello welcome to my blog project with login functionnality 

This blog is using node.js, express.js, and postgresql

How to set it up ?

1- Download and install node.js

Follow this link https://nodejs.org/en/download

** Optional install nodemon to avoid relaunching the server everytime you update the code **

2- Install the following packages by running npm i 
├── bcrypt@6.0.0
├── body-parser@2.2.0
├── dotenv@17.0.0
├── ejs@3.1.10
├── express-ejs-layouts@2.5.1
├── express-session@1.18.1
├── express@5.1.0
├── passport-google-oauth2@0.2.0
├── passport-local@1.0.0
├── passport@0.7.0
└── pg@8.16.3

3 - Setup your google oauth using this link https://console.cloud.google.com/

4- Create an .env file and add your database a credentials, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET

5- Run the server using node index.js or if you've installed nodemon use nodemon index.js




