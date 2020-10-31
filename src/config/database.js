const Sequelize = require("sequelize");

module.exports = new Sequelize({
  dialect: "sqlite",
  storage: "db.sqlite",
  logging: false // disable logging; default: console.log
});
