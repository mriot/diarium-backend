const express = require("express");
const Op = require("sequelize/lib/operators");
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
router.get("/:year", (req, res) => {
	Entries.findAll({
		where: {
			year: req.params.year
		}
	})
		.then(entries => res.send(entries))
		.catch(error => console.log(error));
});

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

module.exports = router;
