const express = require("express");
const moment = require("moment");
const Sequelize = require("sequelize");
const Joi = require("@hapi/joi");
const verifyJWT = require("../config/jwt");
const Entries = require("../models/entries");

const router = express.Router();

/**
 * =============== [ GET - REQUESTS] ===============
 */

// SEARCH
router.get("/search", verifyJWT, (req, res) => {
	if (!req.query.q) {
		res.status(400).json({ error: "No query specified" });
		return;
	}

	const queryArray = req.query.q.split(" ");

	Entries.findAll({
		where: {
			content: {
				[Sequelize.Op.and]: queryArray.map(queryItem => ({
					[Sequelize.Op.like]: `%${queryItem}%`
				}))
			}
		}
	})
		.then(entries => {
			res.send({
				records_found: entries.length,
				records: entries,
			});
		})
		.catch(error => console.log(error));
});


// COUNT ALL
router.get("/count", (req, res) => {
	Entries.count()
		.then(count => res.json({ all_records: count }))
		.catch(error => console.log(error));
});


router.get("/range/:count?", verifyJWT, (req, res) => {
	const { count } = req.params;
	const { start, end, column } = req.query;
	const startDate = moment(start, "YYYY-MM-DD", true);
	const endDate = moment(end, "YYYY-MM-DD", true);

	if (count && count !== "count") {
		res.status(400).json({
			error: `Invalid path '/range/${count}/' — Try instead '/range/count/'`,
		});
		return;
	}

	if (!startDate.isValid() || !endDate.isValid()) {
		res.status(400).json({
			error: "Parameters 'start' and 'end' are required and have to be a valid date (YYYY-MM-DD)",
		});
		return;
	}

	const QUERY_MODEL = {
		// eslint-disable-next-line no-nested-ternary
		attributes: column ? Array.isArray(column) ? column : new Array(column) : null,
		where: {
			[Sequelize.Op.and]: [
				{
					assignedDay: {
						[Sequelize.Op.gte]: startDate.format()
					}
				},
				{
					assignedDay: {
						[Sequelize.Op.lt]: endDate.format()
					}
				}
			]
		},
	};

	if (count) {
		Entries.count(QUERY_MODEL)
			.then(countValue => res.json({
				records_in_range: countValue
			}))
			.catch(error => {
				res.status(500).json({
					error: error.original.toString()
				});
				console.log(error);
			});
		return;
	}

	Entries.findAll(QUERY_MODEL)
		.then(entries => res.json(entries))
		.catch(error => {
			res.status(500).json({
				error: error.original.toString()
			});
			console.log(error);
		});
});


// GET ALL ENTRIES OR ONE BY ID
router.get("/", verifyJWT, (req, res) => {
	if (req.query.id) {
		Entries.findOne({
			where: {
				id: req.query.id
			}
		})
			.then(entry => res.send(entry))
			.catch(error => console.log(error));
	} else {
		Entries.findAll()
			.then(entries => res.send(entries))
			.catch(error => console.log(error));
	}
});


// ALL ENTRIES FOR GIVEN YEAR
router.get("/:year", verifyJWT, (req, res) => {
	const parsedDate = moment(req.params.year, "YYYY", true);

	if (!parsedDate.isValid()) {
		res.status(400).json({ error: parsedDate.toString(), required_format: "YYYY" });
		return;
	}

	Entries.findAll({
		where: {
			[Sequelize.Op.and]: [
				{
					assignedDay: {
						[Sequelize.Op.gte]: parsedDate.format()
					}
				},
				{
					assignedDay: {
						[Sequelize.Op.lt]: parsedDate.add(1, "year").format()
					}
				}
			]
		},
	})
		.then(entries => res.send(entries))
		.catch(error => console.log(error));
});


// ALL ENTRIES FOR GIVEN YEAR:MONTH PAIR
router.get("/:year/:month", verifyJWT, (req, res) => {
	const { year, month } = req.params;
	const parsedDate = moment(`${year}-${month}`, "YYYY-MM", true);

	if (!parsedDate.isValid()) {
		res.status(400).json({ error: parsedDate.toString(), required_format: "YYYY-MM" });
		return;
	}

	Entries.findAll({
		where: {
			[Sequelize.Op.and]: [
				{
					assignedDay: {
						[Sequelize.Op.gte]: parsedDate.format()
					}
				},
				{
					assignedDay: {
						[Sequelize.Op.lt]: parsedDate.add(1, "month").format()
					}
				}
			]
		},
	})
		.then(entries => res.send(entries))
		.catch(error => console.log(error));
});


// SINGLE ENTRY (matching year/month/day)
router.get("/:year/:month/:day", verifyJWT, (req, res) => {
	const { year, month, day } = req.params;
	const parsedDate = moment(`${year}-${month}-${day}`, "YYYY-MM-DD", true);

	if (!parsedDate.isValid()) {
		res.status(400).json({ error: parsedDate.toString(), required_format: "YYYY-MM-DD" });
		return;
	}

	Entries.findOne({
		where: {
			assignedDay: parsedDate.format()
		},
	})
		.then(entry => res.json(entry))
		.catch(error => console.log(error));
});


/**
 * =============== [ POST - REQUESTS] ===============
 */

// CREATE SINGLE ENTRY
router.post("/:year/:month/:day", verifyJWT, (req, res) => {
	const { year, month, day } = req.params;
	const assignedDay = moment(`${year}-${month}-${day}`, "YYYY-MM-DD", true);

	// strictly check if date matches our format
	if (!assignedDay.isValid()) {
		res.status(400).json({ error: assignedDay.toString(), required_format: "YYYY-MM-DD" });
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
				res.status(409).json({
					error: `Entry for ${moment(assignedDay).format("YYYY-MM-DD")} already exists`
				});
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
				.then(newEntry => res.json(newEntry))
				.catch(createError => console.log(createError));
		});
});


/**
 * =============== [ PUT - REQUESTS] ===============
 */

// UPDATE SINGLE ENTRY
router.put("/", verifyJWT, (req, res) => {
	if (!req.query.id) {
		res.status(400).json({ error: "No ID specified" });
		return;
	}

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
				assignedDay: Joi.date().optional(),
				content: Joi.string().optional(),
				contentType: Joi.string().optional(),
				tags: Joi.string().optional(),
			});
		
			const { error, value } = schema.validate(req.body);
		
			if (error) {
				res.status(400).json({ error });
				return;
			}

			const queryConfig = {};
			const { assignedDay, content, contentType, tags } = req.body;

			if (assignedDay) queryConfig.assignedDay = assignedDay;
			if (content) 		 queryConfig.content 		 = content;
			if (contentType) queryConfig.contentType = contentType;
			if (tags)				 queryConfig.tags 			 = tags;

			existingEntry.update(queryConfig)
				.then(updatedEntry => res.send(updatedEntry))
				.catch(updateError => console.log(updateError));
		});
});


// DELETE SINGLE ENTRY
router.delete("/", verifyJWT, (req, res) => {
	if (!req.query.id) {
		res.status(400).json({ error: "No ID specified" });
		return;
	}
	
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

			existingEntry.destroy()
				.then(deletedEntry => res.send(deletedEntry))
				.catch(deleteError => console.log(deleteError));
		});
});

module.exports = router;
