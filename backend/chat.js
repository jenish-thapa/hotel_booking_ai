const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite", // Path to your SQLite database file
});

// Define your Chat model
const Chat = sequelize.define("Chat", {
  role: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  content: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = { sequelize, Chat };
