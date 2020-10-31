const express = require("express");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const HttpStatus = require("http-status-codes");
const chalk = require("chalk");
const Users = require("../models/users");

const router = express.Router();

router.post("/auth", (req, res) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);

  if (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ error });
    console.log(chalk.red(error));
    return;
  }

  Users.findOne({
    where: { username: req.body.username }
  }).then(user => {
    if (!user) {
      res.status(HttpStatus.UNAUTHORIZED).json({ error: "Credentials are incorrect." });
      console.log(chalk.magenta(`User ${req.body.username} was not found.`));
      return;
    }

    bcrypt.compare(req.body.password, user.password).then(match => {
      if (!match) {
        res.status(HttpStatus.UNAUTHORIZED).json({ error: "Credentials are incorrect." });
        console.log(chalk.magenta(`Password for user ${req.body.username} was wrong.`));
        return;
      }

      console.log(chalk.green(`User ${req.body.username} logged in successfully.`));

      jwt.sign({
        username: user.dataValues.username
      }, process.env.JWT_SECRET, { expiresIn: "12h" }, (err, token) => {
        if (err) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: "Something went wrong. Please try again." });
          console.log(chalk.red(`Could not generate JWT ${err.toString()}`));
          return;
        }

        console.log(chalk.green(`JWT for user ${req.body.username} generated successfully.`));

        res.json({ token });
      });
    });
  });
});

/**
 * =============== [ CREATE - USER ] ===============
 */

router.post("/create", (req, res) => {
  const { username, password } = req.body;

  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);

  if (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ error });
    console.log(chalk.red(error));
    return;
  }

  Users.findOne({
    where: { username }
  }).then(user => {
    if (user) {
      res.status(HttpStatus.CONFLICT).json({ error: `Username "${username}" already taken.` });
      console.log(chalk.red(`User ${username} already taken.`));
      return;
    }

    // passed, create new user
    bcrypt.hash(password, 3, (err, hash) => {
      if (err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: "Something went wrong. Please try again." });
        console.log(chalk.red(`Could not hash password for ${username}. ${err.toString()}`));
        return;
      }

      Users.create({
        username,
        password: hash
      }).then(() => {
        jwt.sign({
          username
        }, process.env.JWT_SECRET, { expiresIn: "12h" }, (hashError, token) => {
          if (hashError) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: "Something went wrong. Please try again." });
            console.log(chalk.red(`Could not generate JWT ${hashError.toString()}`));
            return;
          }

          console.log(chalk.green(`JWT for user ${req.body.username} generated successfully.`));

          res.json({ token });
        });
      });
    });
  });
});

module.exports = router;
