const Sequelize = require("sequelize");
const moment = require("moment");
const db = require("../config/database");

const Entry = db.define("entry", {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},
	createdAt: {
		type: Sequelize.DATE,
		// get: () => moment.utc(this.getDataValue("createdAt")).format("YYYY-MM-DD"),
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

/* * /
Entry.create({
	content: "Hello! :)",
	contentType: "markdown",
	tags: "my tags",
	createdAt: moment()
});
/* */

// Entry.create({ content: "Hello2 :)", contentType: "markdown", tags: "my tags" });
// Entry.create({ content: "Hello3 :)", contentType: "markdown", tags: "my tags" });
// Entry.create({ content: "Hello4 :)", contentType: "markdown", tags: "my tags" });
// Entry.create({ content: "Hello5 :)", contentType: "markdown", tags: "my tags" });

module.exports = Entry;
