const Sequelize = require("sequelize");
const verifyJWT = require("../../middleware/jwt");
const Entries = require("../../models/entries");
const dayjs = require("dayjs");
const express = require("express");
const logger = require("node-color-log");

const router = express.Router();

router.get("/count/:year?/:month?", verifyJWT, async (req, res) => {
  const { year, month } = req.params;
  const response = {};

  response.total = await Entries.count();

  if (year) {
    const date = dayjs(year, "YYYY");

    response.year = await Entries.count({
      where: {
        [Sequelize.Op.and]: [
          {
            assigned_day: {
              [Sequelize.Op.gte]: date.startOf("year").format()
            }
          },
          {
            assigned_day: {
              [Sequelize.Op.lte]: date.endOf("year").format()
            }
          }
        ]
      }
    });
  }

  if (month) {
    const date = dayjs(`${year}-${month}`, "YYYY-MM");

    response.month = await Entries.count({
      where: {
        [Sequelize.Op.and]: [
          {
            assigned_day: {
              [Sequelize.Op.gte]: date.startOf("month").format()
            }
          },
          {
            assigned_day: {
              [Sequelize.Op.lte]: date.endOf("month").format()
            }
          }
        ]
      }
    });
  }

  res.json(response);
});

module.exports = router;
