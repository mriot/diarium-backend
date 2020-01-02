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

	const decodedJWT = jwt.decode(req.body.token);
	jwt.verify(req.body.token, process.env.JWT_SECRET, (err, decoded) => {
		res.send({
			_isValid: err ? `false (${err.message})` : true,
			decodedJWT,
			human_readable: {
				issued_at: moment.unix(decodedJWT.iat).format("YYYY-MM-DD HH:mm:ss Z"),
				expires_at: moment.unix(decodedJWT.exp).format("YYYY-MM-DD HH:mm:ss Z"),
			},
		});
	});
});

module.exports = router;
