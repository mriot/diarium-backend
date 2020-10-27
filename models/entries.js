const Sequelize = require("sequelize");
const db = require("../config/database");
const options = require("../config/options");

const Entry = db.define("entry", {
	entry_id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},
	assigned_day: {
		type: Sequelize.DATEONLY,
		allowNull: false,
		unique: true
	},
	content: { // JSON
		type: Sequelize.TEXT,
		allowNull: false
	},
	sanitized_content: { // text extracted from JSON to make it easily searchable
		type: Sequelize.TEXT,
		allowNull: false
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
	day_rating: {
		type: Sequelize.INTEGER
	}
}, options);

/**
 * creates the table
 * - CAUTION - setting force to true, will drop the existing table first!
 */
Entry.sync({ force: false });

module.exports = Entry;
