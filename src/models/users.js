const Sequelize = require("sequelize");
const db = require("../config/database");
const options = require("../config/options");

const User = db.define("user", {
  user_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  last_seen: {
    type: Sequelize.DATE
  }
}, options);

/**
 * creates the table
 * - CAUTION - setting force to true, will drop the existing table first!
 */
User.sync({ force: false });

module.exports = User;
