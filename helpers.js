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

//Returns Date in mm/dd/yyyy format
const getDate = function() {
  let date = new Date();
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
  const yyyy = date.getFullYear();

  date = mm + '/' + dd + '/' + yyyy;
  return date;
};

module.exports = { getUserByEmail, generateRandomString, getDate };