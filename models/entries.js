const Sequelize = require("sequelize");
const db = require("../config/database");

// NOTE: I've added getters to all of them — even though we only need it on "tags"
// I did this to fix the scrambled order in the final JSON. (I know it doesn't really matter 😬 )
// I'm not sure why this happens, probably async stuff (?)

const Entry = db.define("entry", {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		get() { return this.getDataValue("id"); },
	},
	assignedDay: {
		type: Sequelize.DATEONLY,
		get() { return this.getDataValue("assignedDay"); },
	},
	content: {
		type: Sequelize.TEXT,
		get() { return this.getDataValue("content"); },
	},
	contentType: {
		type: Sequelize.STRING,
		defaultValue: "text/markdown",
		get() { return this.getDataValue("contentType"); },
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
