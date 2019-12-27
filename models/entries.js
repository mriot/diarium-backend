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
	modifiedAt: {
		type: Sequelize.DATE,
	},
	content: {
		type: Sequelize.TEXT,
	},
	contentType: {
		type: Sequelize.TEXT,
	},
	tags: {
		type: Sequelize.STRING,
	},
});

Entry.sync({ force: false });

module.exports = Entry;
