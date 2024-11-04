const express = require('express');
const session = require('express-session');
const { google } = require('googleapis');
const path = require('path');
const favicon = require('serve-favicon');
const { stringify } = require('querystring');
const { GoogleGenerativeAI } = require("@google/generative-ai");


require("dotenv").config({ path: "./config/config.env" });
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const { addUser, checkAddGoogleUser, checkUser, importChats, storeQuery,
   addChat, getAllChats } = require('./database');

const generateQuery = require('./generateQuery');
const getResponse = require('./main');
const makePdf = require('./makePdf');
const { mailPdf } = require('./mailPdf');
const checkQuery = require('./checkTravel');


const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
   session({
      secret: 'this is our session very personal',
      resave: true,
      saveUninitialized: true,
      cookie: { secure: false } // Use true for HTTPS, false for HTTP
   })
);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

const GOOGLE_CONFIG = require('./config/client_secret.json').web;

const { OAuth2 } = google.auth;
const oauth2Client = new OAuth2(
   GOOGLE_CONFIG.client_id,
   GOOGLE_CONFIG.client_secret,
   'http://127.0.0.1:5000/callback'
);

function loginIsRequired(req, res, next) {
   if (req.session.google_id) {
      return next();
   } else {
      return res.sendStatus(401); // Authorization required
   }
}

app.get('/', (req, res) => {
   if (req.session.google_id) {
      res.redirect('/home');
   } else {
      res.redirect('/user/login');
   }
});


app.get('/user/login', (req, res) => {
   res.render('login');
});


app.get('/about', (req, res) => {
   res.render('about');
});


app.get('/home', loginIsRequired, async (req, res) => {
   const now = new Date();
   const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
   const month = now.toLocaleString("default", { month: "short" });
   const date = month + " " + now.getDate();

   const allChats = await getAllChats(req.session.email);

   console.log(allChats);
   let { chat1, chat2, chat3, chat4, chat5 } = allChats;
   // console.log();
   while (typeof chat1 === 'string') {
      chat1 = JSON.parse(chat1);
   }
   while (typeof chat2 === 'string') {
      chat2 = JSON.parse(chat2);
   }
   while (typeof chat3 === 'string') {
      chat3 = JSON.parse(chat3);
   }
   while (typeof chat4 === 'string') {
      chat4 = JSON.parse(chat4);
   }
   while (typeof chat5 === 'string') {
      chat5 = JSON.parse(chat5);
   }
   const context = {
      time: time, date: date, month: month, chat1: chat1, chat2: chat2, chat3: chat3,
      chat4: chat4, chat5: chat5
   };
   console.log(context);
   res.render('index', context);
});


app.post('/api', async (req, res) => {
   const userInput = req.body.userInput;
   const chatNum = req.body.chatNum;
   let response = '';

   if (!checkQuery(userInput)) {
      response = 'The above query is not a travel related query!';
   } else {
      const options = req.body.options;
      const query = generateQuery(userInput, options);

      // Calling OpenAi API
      response = await getResponse(query);
      console.log(response);
      console.log('-----');
      console.log(chatNum);
      // For testing
      // response = query;

      // Storing data
      storeQuery(req.session.email, userInput, response, chatNum);
   }

   const data = { userInput: userInput, response: response };
   res.json(data);
});


// DEPRICATED
app.post('/register', (req, res) => {
   res.render('register');
});


// DEPRICATED
app.post('/login_validation', async (req, res) => {
   const email = req.body.email;
   const password = req.body.password;
   const users = await checkUser(email, password);

   if (users.length > 0) {
      req.session.google_id = users[0][0];
      req.session.email = email;

      // console.log(users[0]);

      res.redirect('/home');
   } else {
      res.redirect('/user/login');
   }
});


app.post('/google_validation', (req, res) => {
   const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
         'https://www.googleapis.com/auth/userinfo.profile',
         'https://www.googleapis.com/auth/userinfo.email',
         'openid',
      ],
   });

   res.redirect(authUrl);
});


app.get('/callback', async (req, res) => {
   try {
      const { tokens } = await oauth2Client.getToken(req.query.code);
      oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({
         auth: oauth2Client,
         version: 'v2',
      });
      const userInfo = await oauth2.userinfo.get();

      req.session.google_id = userInfo.data.id;
      req.session.name = userInfo.data.name;
      req.session.email = userInfo.data.email;

      checkAddGoogleUser(req.session.email);

      res.redirect('/home');
   } catch (error) {
      console.error('Error authenticating user:', error);
      res.sendStatus(500);
   }
});


// DEPRICATED
app.post('/add_user', async (req, res) => {
   const email = req.body.newemail;
   const password = req.body.newpassword;

   const userID = await addUser(email, password);
   req.session.google_id = userID;
   req.session.email = email;
   res.redirect('/home');
});


app.post('/getChats', async (req, res) => {
   const chatNum = req.body.chatNum;
   console.log(req.session.email);
   console.log(req.session);
   let chats = await importChats(req.session.email, chatNum);
   // console.log('String------', typeof (chats))
   while (typeof chats === 'string') {
      chats = JSON.parse(chats);
   }
   res.json(chats);
});


app.post('/addChats', async (req, res) => {
   const response = await addChat(req.session.email);
   res.json(response);
});


app.post('/sendMail', async (req, res) => {
   const chats = req.body.chatbox;
   await makePdf(chats);
   await mailPdf(req.session.email, req.session.name);
   res.json('sent');
});


app.get('/logout', (req, res) => {
   req.session.destroy();
   res.redirect('/user/login');
});


app.post('/checkHuman', async (req, res) => {
   const query = stringify({
      secret: process.env.RECAPTCHA_SECRET_KEY,
      response: req.body.captcha,
      remoteip: req.connection.remoteAddress
   });

   try {
      const verifyURL = `https://google.com/recaptcha/api/siteverify?${query}`;

      const response = await fetch(verifyURL).then(res => res.json());

      // If not successful
      if (response.success !== undefined && !response.success)
         return res.json({ success: false, message: 'Failed captcha verification' });

      // If successful
      return res.json({ success: true, message: 'Captcha passed' });

   } catch (error) {
      console.error('Error verifying reCAPTCHA:', error.message);
      res.status(500).json({ error: 'Internal server error' });
   }

});


// Error Handling
app.use((err, req, res, next) => {
   console.log(err.stack);
   res.status(500).send("Something bad happend! 😥");
});

app.listen(5000, () => {
   console.log('Server running on http://localhost:5000');
});
