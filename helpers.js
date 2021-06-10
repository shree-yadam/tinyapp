//Check if email present in the database
const getUserByEmail = function(email, database) {
  for (let id in database) {
    if (database[id].email === email) {
      return database[id];
    }
  }
  return null;
};

module.exports = {getUserByEmail};