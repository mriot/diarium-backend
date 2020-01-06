const express = require("express");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Users = require("../models/users");

const router = express.Router();

router.post("/", (req, res) => {
	const schema = Joi.object({
		username: Joi.string().required(),
		password: Joi.string().required(),
	});

	const { error, value } = schema.validate(req.body);

	if (error) {
		res.status(400).json({ error });
		return;
	}
	
	Users.findOne({
		where: { username: req.body.username },
	}).then(user => {
		if (!user) {
			res.status(401).json({ error: "Credentials are incorrect." });
			return;
		}

		bcrypt.compare(req.body.password, user.password).then(match => {
			if (!match) {
				res.status(401).json({ error: "Credentials are incorrect." });
				return;
			}

			jwt.sign({
				username: user.dataValues.username
			}, process.env.JWT_SECRET, { expiresIn: "12h" }, (err, token) => {
				if (err) {
					res.status(500).json({ error: "Something went wrong. Please try again." });
					return;
				}
	
				res.json({ token });
			});
		});
	});
});

module.exports = router;
