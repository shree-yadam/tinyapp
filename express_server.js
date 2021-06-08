const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");

//Object to maintain URL Data
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//body-parser tp read body of request
app.use(bodyParser.urlencoded({extended: true}));

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
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

//Display form to create new shortURL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Handle GET request to path /urls/:shortURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

//Handle GET request to path /u/:shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Create new short URL for input long URL
app.post("/urls", (req, res) => {
  let newShortURL
  do {
    newShortURL = generateRandomString(6);
    if (!Object.keys(urlDatabase).includes(newShortURL)) {
      break;
    }
  } while(true);
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

//Server listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});