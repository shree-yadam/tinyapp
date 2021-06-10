const {assert} = require('chai');

const { getUserByEmail, generateRandomString } = require('../helpers.js');

const testUsers = {
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
  });
  it('should return undefined for a non-existant email', function() {
    const user = getUserByEmail("sdy@trt.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});

describe('generateRandomString', function() {
  it('should return a random string of given length', function() {
    const actualOutputLength = generateRandomString(6).length;
    const expectedOutputLength = 6;
    assert.equal(actualOutputLength, expectedOutputLength);
  });
  it('should return expty string if length is 0', function() {
    const actualOutputLength = generateRandomString(0).length;
    const expectedOutputLength = 0;
    assert.equal(actualOutputLength, expectedOutputLength);
  });
  it('should return expty string if length is undefined', function() {
    const actualOutputLength = generateRandomString().length;
    const expectedOutputLength = 0;
    assert.equal(actualOutputLength, expectedOutputLength);
  });
});