const cookieSession = require('cookie-session');
const express = require('express');
const bcrypt = require('bcrypt');
const {getUserByEmail, generateRandomString, getDate} = require('./helpers');

const PORT = 8080; //default port 8080
const SHORT_URL_LENGTH = 6;
const USER_ID_LENGTH = 6;
const saltRounds = 10;

const app = express();

//Object to maintain URL Data
//Format: {shortURL: {longURL: "", userID: "", date: , visitCount:}}
const urlDatabase = {};

//Object to store user data
// key user ID and value Object with keys id, email and password
//Format: {id: {id:"" ,  email:"" , password: ""}}
const users = {};

//Set EJS as the view engine
app.set("view engine", "ejs");

//body-parser tp read body of request
app.use(express.urlencoded({
  extended: true
}));

//Use cookie-parser
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

//Filtering urls by user id
const urlsForUser = function(id) {
  const databaseForUser = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      databaseForUser[key] = urlDatabase[key];
    }
  }
  return databaseForUser;
};

//addNewUser - adds a new user to the database if user doesn't exist
const addNewUser = (email, pswd) => {
  if (!email || !(pswd) || getUserByEmail(email,users)) {
    return null;
  }
  const password = bcrypt.hashSync(pswd, saltRounds);
  let id;
  let success = false;
  do {
    id = generateRandomString(USER_ID_LENGTH);
    if (!Object.keys(users).includes(id)) {
      success = true;
    }
  } while (!success);
  const user = {id, email, password};
  users[id] = user;
  return id;
};

//Handle GET /
app.get("/", (req, res) => {
  const id = req.session.userID;
  if (!id) {
    res.redirect("/login");
    return;
  }
  res.redirect("/urls");
});

//Display database of URLs
app.get("/urls", (req, res) => {
  const id = req.session.userID;
  const templateVars = {
    urls: urlsForUser(id),
    user: users[id]
  };
  res.render("urls_index", templateVars);
});

//Display form to create new shortURL
app.get("/urls/new", (req, res) => {
  const id = req.session.userID;
  if (!id) {
    res.redirect("/login");
    return;
  }
  const templateVars = {
    user : users[id]
  };
  res.render("urls_new", templateVars);
});

//Handle GET request to path /urls/:shortURL
app.get("/urls/:shortURL", (req, res) => {
  const id = req.session.userID;
  const shortURL = req.params.shortURL;
  if (!id || !shortURL || !urlDatabase[shortURL] || id !== urlDatabase[shortURL].userID) {
    res.status(401).send("Unauthorized Access!");
    return;
  }
  const templateVars = {
    user : users[id],
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    date: urlDatabase[shortURL].date,
    visitCount: urlDatabase[shortURL].visitCount
  };
  res.render("urls_show", templateVars);
});

//Handle GET request to path /u/:shortURL
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send("NOT FOUND!");
    return;
  }
  urlDatabase[req.params.shortURL].visitCount++;
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//Login request
app.get("/login", (req, res) => {
  const templateVars = {
    user : users[req.session.userID]
  };
  if (req.session.userID) {
    res.redirect("/urls");
    return;
  }
  res.render("urls_login", templateVars);
});

//Check credentials and login valid user
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  const user = getUserByEmail(email,users);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res
      .status(403)
      .send("Invalid credentials!!");
    return;
  }
  req.session.userID = user.id;
  res.redirect("/urls");
});

//Create new short URL for input long URL
app.post("/urls", (req, res) => {
  let newShortURL;
  let success = false;
  const userID = req.session.userID;
  const longURL = req.body.longURL;
  if (!userID) {
    res.status(401).send("Unauthorized Access!");
    return;
  }
  if (!longURL) {
    res
      .status(400)
      .send("Enter URL!");
    return;
  }
  do {
    newShortURL = generateRandomString(SHORT_URL_LENGTH);
    if (!Object.keys(urlDatabase).includes(newShortURL)) {
      success = true;
    }
  } while (!success);
  let date = getDate();
  urlDatabase[newShortURL] = {longURL, userID, date, visitCount: 0};
  res.redirect(`/urls/${newShortURL}`);
});

//Handle delete request from form
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.session.userID;
  const shortURL = req.params.shortURL;
  if (id !== urlDatabase[shortURL].userID) {
    res.status(401).send("Unauthorized Access!");
    return;
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//Handle Update request
app.post("/urls/:shortURL", (req, res) => {
  const id = req.session.userID;
  const shortURL = req.params.shortURL;
  if (id !== urlDatabase[shortURL].userID) {
    res.status(401).send("Unauthorized Access!");
    return;
  }
  if (!req.body.longURL) {
    res
      .status(400)
      .send("Enter URL before Submit!!");
    return;
  }
  
  if (id !== urlDatabase[shortURL].userID) {
    res.status(401).send("Unauthorized Access!");
    return;
  }
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

//Handle Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//Handle register request
app.get("/register", (req, res) => {
  const templateVars = {
    user : users[req.session.userID]
  };
  if (req.session.userID) {
    res.redirect("/urls");
    return;
  }
  res.render("urls_register", templateVars);
});

//Checking valid input and registering new user
app.post("/register", (req, res) => {
  const id = addNewUser(req.body.email, req.body.password);
  if (!id) {
    res
      .status(400)
      .send("BAD REQUEST!!");
    return;
  }
  req.session.userID = id;
  res.redirect("/urls");
});

//Server listening
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});