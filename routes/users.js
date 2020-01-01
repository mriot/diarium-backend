const express = require("express");
const moment = require("moment");
const Sequelize = require("sequelize");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const Users = require("../models/users");

const router = express.Router();

router.post("/", (req, res) => {
	Users.findOne({
		where: {
			
		}
	});

	const user = {
		id: 1,
		name: "Admin",
		role: "admin",
	};

	jwt.sign(user, "markus", (err, token) => {
		res.send(token);
	});
});

module.exports = router;
