const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const PORT = 8080; //default port 8080
const SHORT_URL_LENGTH = 6;
const USER_ID_LENGTH = 6;
const saltRounds = 10;

const app = express();

//Object to maintain URL Data
const urlDatabase = {};

//Object to store user data
// key user ID and value Object with keys id, email and password
const users = {};

//Set EJS as the view engine
app.set("view engine", "ejs");

//body-parser tp read body of request
app.use(express.urlencoded({
  extended: true
}));

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

//Check if email present in the database
const getUserByEmail = function(email) {
  for (let id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return null;
};

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

//addNewUser - TBD
//authenticateUSer - TBD

//Display database of URLs
app.get("/urls", (req, res) => {
  const id = req.cookies.user_id;
  const templateVars = {
    urls: urlsForUser(id),
    user: users[id]
  };
  res.render("urls_index", templateVars);
});

//Display form to create new shortURL
app.get("/urls/new", (req, res) => {
  const id = req.cookies.user_id;
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
  const id = req.cookies.user_id;
  const shortURL = req.params.shortURL;
  if (id !== urlDatabase[shortURL].userID) {
    res.status(401).send("Unauthorized Access!");
    return;
  }
  const templateVars = {
    user : users[id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

//Handle GET request to path /u/:shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//Login request
app.get("/login", (req, res) => {
  const templateVars = {
    user : users[req.cookies.user_id]
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  // const password = bcrypt.hashSync(req.body.password, saltRounds);
  const {email, password} = req.body;
  const user = getUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res
      .status(403)
      .send("Invalid credentials!!");
    return;
  }
  res
    .cookie("user_id", user.id)
    .redirect("/urls");
});

//Create new short URL for input long URL
app.post("/urls", (req, res) => {
  let newShortURL;
  let success = false;
  const userID = req.cookies.user_id;
  const longURL = req.body.longURL;
  do {
    newShortURL = generateRandomString(SHORT_URL_LENGTH);
    if (!Object.keys(urlDatabase).includes(newShortURL)) {
      success = true;
    }
  } while (!success);
  urlDatabase[newShortURL] = {longURL, userID};
  res.redirect(`/urls/${newShortURL}`);
});

//Handle delete request from form
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.cookies.user_id;
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
  const id = req.cookies.user_id;
  const shortURL = req.params.shortURL;
  if (id !== urlDatabase[shortURL].userID) {
    res.status(401).send("Unauthorized Access!");
    return;
  }
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
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
    user : users[req.cookies.user_id]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  if (!email || !(req.body.password) || getUserByEmail(email)) {
    res
    .status(400)
    .send("BAD REQUEST!!");
    return;
  }
  const password = bcrypt.hashSync(req.body.password, saltRounds);
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
  res
    .cookie("user_id", id)
    .redirect("/urls");
});

//Server listening
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});