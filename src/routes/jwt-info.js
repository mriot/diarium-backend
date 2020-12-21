const express = require("express");
const dayjs = require("dayjs");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const HttpStatus = require("http-status-codes");

const router = express.Router();

router.post("/", (req, res) => {
  const schema = Joi.object({
    token: Joi.string().required()
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    res.status(HttpStatus.StatusCodes.BAD_REQUEST).json({ error });
    return;
  }

  const decodedJWT = jwt.decode(req.body.token, { complete: true });
  jwt.verify(req.body.token, process.env.JWT_SECRET, (err, decoded) => {
    res.send({
      _isValid: err ? `false (${err.message})` : true,
      decodedJWT,
      human_readable: {
        issued_at: dayjs.unix(decodedJWT.iat).format("YYYY-MM-DD HH:mm:ss Z"),
        expires_at: dayjs.unix(decodedJWT.exp).format("YYYY-MM-DD HH:mm:ss Z")
      }
    });
  });
});

module.exports = router;
