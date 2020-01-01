const Sequelize = require("sequelize");
const db = require("../config/database");

const User = db.define("user", {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},
	name: {
		type: Sequelize.STRING
	},
	password: {
		type: Sequelize.STRING
	}
});

// create table (force will drop existing table first)
User.sync({ force: false });

module.exports = User;
