const express = require("express");
const moment = require("moment");
const Sequelize = require("sequelize");
const Joi = require("@hapi/joi");
const jwt = require("express-jwt");
const Auth = require("../models/auth");

const router = express.Router();

router.post("/", jwt({ secret: "test" }), (req, res) => {
	if (!req.user.admin) return res.sendStatus(401);
	res.sendStatus(200);
});

module.exports = router;
