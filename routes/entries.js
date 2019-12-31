const express = require("express");
const moment = require("moment");
const Sequelize = require("sequelize");
const Joi = require("@hapi/joi");
const Entries = require("../models/entries");
const router = express.Router();

/**
 * =============== [ GET - REQUESTS] ===============
 */

// GET ALL ENTRIES OR ONE BY ID
router.get("/", (req, res) => {
	if (req.query.id) {
		Entries.findOne({
			where: {
				id: req.query.id
			}
		})
			.then(entry => (entry !== null ? res.send(entry) : res.sendStatus(404)))
			.catch(error => console.log(error));
	} else {
		Entries.findAll()
			.then(entries => (entries.length < 1 ? res.sendStatus(404) : res.send(entries)))
			.catch(error => console.log(error));
	}
});


// ALL ENTRIES FOR GIVEN YEAR
router.get("/:year", (req, res) => {
	const parsedDate = moment(req.params.year, "YYYY", true);

	if (!parsedDate.isValid()) {
		res.status(400).json({ error: `${parsedDate}` });
		return;
	}

	Entries.findAll({
		where: {
			[Sequelize.Op.and]: [
				{
					assignedDay: {
						[Sequelize.Op.gte]: moment(req.params.year, "YYYY")
					}
				},
				{
					assignedDay: {
						[Sequelize.Op.lt]: moment(req.params.year, "YYYY").add(1, "year")
					}
				}
			]
		},
	})
		.then(entries => (entries.length < 1 ? res.sendStatus(404) : res.send(entries)))
		.catch(error => console.log(error));
});


// ALL ENTRIES FOR GIVEN YEAR:MONTH PAIR
router.get("/:year/:month", (req, res) => {
	const parsedDate = moment(`${req.params.year}-${req.params.month}`, "YYYY-MM", true);

	if (!parsedDate.isValid()) {
		res.status(400).json({ error: `${parsedDate}` });
		return;
	}

	Entries.findAll({
		where: {
			[Sequelize.Op.and]: [
				{
					assignedDay: {
						[Sequelize.Op.gte]: parsedDate
					}
				},
				{
					assignedDay: {
						[Sequelize.Op.lt]: parsedDate.add(1, "month")
					}
				}
			]
		},
	})
		.then(entries => (entries.length < 1 ? res.sendStatus(404) : res.send(entries)))
		.catch(error => console.log(error));
});


// SINGLE ENTRY (matching year/month/day)
router.get("/:year/:month/:day", (req, res) => {
	const parsedDate = moment(`${req.params.year}-${req.params.month}-${req.params.day}`, "YYYY-MM-DD", true);

	if (!parsedDate.isValid()) {
		res.status(400).json({ error: `${parsedDate}` });
		return;
	}

	Entries.findOne({
		where: {
			assignedDay: parsedDate
		},
	})
		.then(entry => (entry !== null ? res.send(entry) : res.sendStatus(404)))
		.catch(error => console.log(error));
});


/**
 * =============== [ POST - REQUESTS] ===============
 */

// CREATE SINGLE ENTRY
router.post("/:year/:month/:day", (req, res) => {
	const assignedDay = moment(`${req.params.year}-${req.params.month}-${req.params.day}`, "YYYY-MM-DD", true);

	// strictly check if date matches our format
	if (!assignedDay.isValid()) {
		res.status(400).json({ error: `${assignedDay}` });
		return;
	}

	// check if an entry already exists for that day
	Entries.findOne({
		where: {
			assignedDay: {
				[Sequelize.Op.eq]: assignedDay
			}
		},
	})
		.then(existingEntry => {
			if (existingEntry) {
				res.status(409).json({ error: `Entry for ${moment(assignedDay).format("YYYY-MM-DD")} already exists` });
				return;
			}

			const schema = Joi.object({
				content: Joi.string().required(),
				tags: Joi.string(),
				contentType: Joi.string().optional(),
			});
		
			const { error, value } = schema.validate(req.body);
		
			if (error) {
				res.status(400).json({ error });
				return;
			}
		
			Entries.create({
				assignedDay, // derived from URL path
				content: req.body.content,
				tags: req.body.tags,
				contentType: req.body.contentType, // default: text/markdown
			})
				.then(newEntry => res.json(newEntry));
		});
});


/**
 * =============== [ PUT - REQUESTS] ===============
 */

// UPDATE SINGLE ENTRY
router.put("/", (req, res) => {
	if (!req.query.id) res.status(400).json({ error: "No ID specified" });
	Entries.findOne({
		where: {
			id: req.query.id
		}
	})
		.then(existingEntry => {
			if (!existingEntry) {
				res.status(404).json({ error: `Entry for ID ${req.query.id} not found` });
				return;
			}

			const schema = Joi.object({
				content: Joi.string().required(),
				tags: Joi.string(),
				contentType: Joi.string().optional(),
			});
		
			const { error, value } = schema.validate(req.body);
		
			if (error) {
				res.status(400).json({ error });
				return;
			}

			existingEntry.update({
				content: req.body.content,
				tags: req.body.tags,
				contentType: req.body.contentType,
			}).then(updatedEntry => res.send(updatedEntry));
		});
});


// DELETE SINGLE ENTRY
router.delete("/", (req, res) => {
	if (!req.query.id) res.status(400).json({ error: "No ID specified" });
	Entries.findOne({
		where: {
			id: req.query.id
		}
	})
		.then(existingEntry => {
			if (!existingEntry) {
				res.status(404).json({ error: `Entry for ID ${req.query.id} not found` });
				return;
			}

			existingEntry.destroy().then(deletedEntry => res.send(deletedEntry));
		});
});

module.exports = router;
