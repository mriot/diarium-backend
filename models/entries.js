const Sequelize = require("sequelize");
const db = require("../config/database");

const Entry = db.define("entry", {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},
	assignedDay: {
		type: Sequelize.DATEONLY
	},
	content: {
		type: Sequelize.TEXT,
	},
	contentType: {
		type: Sequelize.STRING,
		defaultValue: "text/markdown",
	},
	tags: {
		type: Sequelize.STRING,
		get() {
			return JSON.parse(this.getDataValue("tags"));
		},
		set(value) {
			return this.setDataValue("tags", JSON.stringify(value));
		}
	},
	createdAt: {
		type: Sequelize.DATE,
	},
	updatedAt: {
		type: Sequelize.DATE,
	},
});

// create table (force will drop existing table first)
Entry.sync({ force: false });

module.exports = Entry;
