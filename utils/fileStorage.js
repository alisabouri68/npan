const fs = require('fs').promises;
const path = require('path');

const dataPath = path.join(__dirname, '../data/users.json');

const readUsers = async () => {
  try {
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeUsers = async (users) => {
  await fs.writeFile(dataPath, JSON.stringify(users, null, 2));
};

module.exports = { readUsers, writeUsers };