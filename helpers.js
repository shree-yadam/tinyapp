//Check if email present in the database
const getUserByEmail = function(email, database) {
  for (let id in database) {
    if (database[id].email === email) {
      return database[id];
    }
  }
  return null;
};

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

module.exports = {getUserByEmail, generateRandomString};