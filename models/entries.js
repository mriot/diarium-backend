const Sequelize = require("sequelize");
const db = require("../config/database");

const Entry = db.define("entry", {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},
	createdAt: {
		type: Sequelize.DATE,
	},
	updatedAt: {
		type: Sequelize.DATE,
	},
	content: {
		type: Sequelize.TEXT,
	},
	contentType: {
		type: Sequelize.STRING,
	},
	tags: {
		type: Sequelize.STRING,
	},
});

// create table (force will drop existing table first)
Entry.sync({ force: false });

module.exports = Entry;
