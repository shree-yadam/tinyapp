const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

//Object to maintain URL Data
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "aJ48lW"}
};

//Object to store user data
// key user ID and value Object with keys id, email and password
const users = {
  "aJ48lW": {
    id: "aJ48lW",
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

//Set EJS as the view engine
app.set("view engine", "ejs");

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
  const {email, password} = req.body;
  const user = getUserByEmail(email);
  if (!user || user.password !== password) {
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
    newShortURL = generateRandomString(6);
    if (!Object.keys(urlDatabase).includes(newShortURL)) {
      success = true;
    }
  } while (!success);
  urlDatabase[newShortURL] = {longURL, userID};
  res.redirect(`/urls/${newShortURL}`);
});

//Handle delete request from form
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//Handle Update request
app.post("/urls/:shortURL", (req, res) => {
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
  const {email, password} = req.body;
  if (!email || !password || getUserByEmail(email)) {
    res
      .status(400)
      .send("BAD REQUEST!!");
    return;
  }
  let id;
  let success = false;
  do {
    id = generateRandomString(6);
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
  console.log(`Example app listening on port ${PORT}!`);
});