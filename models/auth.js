const Sequelize = require("sequelize");
const db = require("../config/database");

const Auth = db.define("auth", {
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
