const express = require("express");
const Op = require("sequelize/lib/operators");
const moment = require("moment");
const Sequelize = require("sequelize");
const Entries = require("../models/entries");
const router = express.Router();

// GET ALL ENTRIES OR ONE BY ID
router.get("/", (req, res) => {
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
/*
router.get("/:year", (req, res) => {
	Entries.findAll({
		where: {
			createdAt: {
				[Op.like]: `%${moment(req.params.year, "YYYY").get("year")}%`
			}
		},
	})
		.then(entries => res.send(entries))
		.catch(error => console.log(error));
});
*/

router.get("/:year", (req, res) => {
	if (!/^\d{4}$/.test(req.params.year)) {
		res.send("Year has to be a valid 4 digit number");
		return;
	}

	Entries.findAll({
		where: {
			[Sequelize.Op.and]: [
				{
					createdAt: {
						[Sequelize.Op.gte]: moment(req.params.year, "YYYY").utcOffset(0, true)
					}
				},
				{
					createdAt: {
						[Sequelize.Op.lt]: moment(req.params.year, "YYYY").add(1, "year").utcOffset(0, true)
					}
				}
			]
		},
	})
		.then(entries => res.send(entries))
		.catch(error => console.log(error));
});
/*
// ALL ENTRIES FOR GIVEN YEAR:MONTH PAIR
router.get("/:year/:month", (req, res) => {
	Entries.findAll({
		where: {
			[Op.and]: [{ year: req.params.year }, { month: req.params.month }]
		}
	})
		.then(entries => res.send(entries))
		.catch(error => console.log(error));
});

// SINGLE ENTRY (matching year/month/day)
router.get("/:year/:month/:day", (req, res) => {
	Entries.findOne({
		where: {
			[Op.and]: [{ year: req.params.year }, { month: req.params.month }, { day: req.params.day }]
		}
	})
		.then(entry => res.send(entry))
		.catch(error => console.log(error));
});
*/
module.exports = router;
