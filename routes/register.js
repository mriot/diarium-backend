const express = require("express");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const HttpStatus = require("http-status-codes");
const logger = require("node-color-log");
const User = require("../models/users");

const router = express.Router();

router.post("/", (req, res) => {
	const { username, password } = req.body;

	const schema = Joi.object({
		username: Joi.string().required(),
		password: Joi.string().required(),
	});

	const { error } = schema.validate(req.body);

	if (error) {
		res.status(HttpStatus.BAD_REQUEST).json({ error });
		logger.info("Bad request");
		return;
	}
	
	User.findOne({
		where: { username },
	}).then(user => {
		if (user) {
			res.status(HttpStatus.CONFLICT).json({ error: `Username "${username}" already taken.` });
			logger.info(`User ${username} already taken.`);
			return;
		}

		// passed, create new user
		bcrypt.hash(password, 3, (err, hash) => {
			if (err) {
				res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: "Something went wrong. Please try again." });
				logger.info(`Could not hash password for ${username}. ${err.toString()}`);
				return;
			}

			User.create({
				username,
				password: hash
			}).then(() => {
				jwt.sign({
					username,
				}, process.env.JWT_SECRET, { expiresIn: "12h" }, (hashError, token) => {
					if (hashError) {
						res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: "Something went wrong. Please try again." });
						logger.error(`Could not generate JWT ${hashError.toString()}`);
						return;
					}

					logger.info(`JWT for user ${req.body.username} generated successfully.`);
					
					res.json({ token });
				});
			});
		});
	});
});

module.exports = router;
