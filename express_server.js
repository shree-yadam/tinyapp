const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

//Object to maintain URL Data
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Object to store user data 
// key user ID and value Object with keys id, email and password
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

//body-parser tp read body of request
app.use(bodyParser.urlencoded({extended: true}));

//Use cookie-parser
app.use(cookieParser());

//Function to generate a random string of input length to be used as shortURL
const generateRandomString = function(length) {
  const characters = 'ABCDEFGHIKJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = "";
  const range = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * range));
  }
  return result;
};

//Set EJS as the view engine
app.set("view engine", "ejs");

//Display database of URLs
app.get("/urls", (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = {
    urls: urlDatabase,
    user: users[user_id]
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

//Display form to create new shortURL
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = {
    user : users[user_id]
  };
  res.render("urls_new", templateVars);
});

//Handle GET request to path /urls/:shortURL
app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = {
    user : users[user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

//Handle GET request to path /u/:shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Login request
app.post("/login", (req, res) => {
  res
    .cookie("username",req.body.username)
    .redirect("/urls");
});

//Create new short URL for input long URL
app.post("/urls", (req, res) => {
  let newShortURL;
  let success = false;
  do {
    newShortURL = generateRandomString(6);
    if (!Object.keys(urlDatabase).includes(newShortURL)) {
      success = true;
    }
  } while (!success);
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`/urls/${newShortURL}`);
});

//Handle delete request from form
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//Handle Update request
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

//Handle Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//Handle register request
app.get("/register", (req, res) => {
  const templateVars = {
    user : users[req.cookies["user_id"]]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  let newUserID;
  let success = false;
  do {
    newUserID = generateRandomString(6);
    if (!Object.keys(users).includes(newUserID)) {
      success = true;
    }
  } while (!success);
  const user = {
    id: newUserID,
    email: req.body.email,
    password: req.body.password
  };
  users[newUserID] = user;
  console.log(users);
  res
  .cookie("user_id", newUserID)
  .redirect("/urls");
});

//Server listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});