const Sequelize = require("sequelize");
const verifyJWT = require("../../middleware/jwt");
const Entries = require("../../models/entries");
const express = require("express");
const { StatusCodes } = require("http-status-codes");
const logger = require("node-color-log");

const router = express.Router();

router.get("/search", verifyJWT, (req, res) => {
  if (!req.query.q) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "No query specified" });
    return;
  }

  const queryArray = req.query.q.split(" ");

  Entries.findAndCountAll({
    where: {
      content_text: {
        [Sequelize.Op.and]: queryArray.map(queryItem => ({
          [Sequelize.Op.like]: `%${queryItem}%`
        }))
      }
    }
  })
    .then(entries => {
      res.send({
        count: entries.count,
        records: entries.rows
      });
    })
    .catch(error => logger.error(error));
});

module.exports = router;
