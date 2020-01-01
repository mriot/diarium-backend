const express = require("express");
const moment = require("moment");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/", (req, res) => {
	const schema = Joi.object({
		token: Joi.string().required()
	});

	const { error, value } = schema.validate(req.body);

	if (error) {
		res.status(400).json({ error });
		return;
	}

	jwt.verify(req.body.token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) {
			res.status(401).json({ err });
			return;
		}

		res.send({
			decoded,
			human_readable: {
				issued_at: moment.unix(decoded.iat).format("YYYY-MM-DD HH:mm:ss Z"),
				expires_at: moment.unix(decoded.exp).format("YYYY-MM-DD HH:mm:ss Z"),
			}
		});
	});
});

module.exports = router;
