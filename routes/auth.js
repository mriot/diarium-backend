const express = require("express");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const HttpStatus = require("http-status-codes");
const Users = require("../models/users");

const router = express.Router();

router.post("/", (req, res) => {
	const schema = Joi.object({
		username: Joi.string().required(),
		password: Joi.string().required(),
	});

	const { error, value } = schema.validate(req.body);

	if (error) {
		res.status(HttpStatus.BAD_REQUEST).json({ error });
		return;
	}
	
	Users.findOne({
		where: { username: req.body.username },
	}).then(user => {
		if (!user) {
			res.status(HttpStatus.UNAUTHORIZED).json({ error: "Credentials are incorrect." });
			return;
		}

		bcrypt.compare(req.body.password, user.password).then(match => {
			if (!match) {
				res.status(HttpStatus.UNAUTHORIZED).json({ error: "Credentials are incorrect." });
				return;
			}

			jwt.sign({
				username: user.dataValues.username
			}, process.env.JWT_SECRET, { expiresIn: "12h" }, (err, token) => {
				if (err) {
					res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: "Something went wrong. Please try again." });
					return;
				}
	
				res.json({ token });
			});
		});
	});
});

module.exports = router;
