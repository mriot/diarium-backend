const { StatusCodes } = require("http-status-codes");
const express = require("express");
const Sequelize = require("sequelize");
const logger = require("node-color-log");
const verifyJWT = require("../../middleware/jwt");
const Entries = require("../../models/entries");
const dayjs = require("dayjs");

const router = express.Router();

router.get("/range/:count?", verifyJWT, (req, res) => {
  const { count } = req.params;
  const { start, end, column } = req.query;
  const startDate = dayjs(start, "YYYY-MM-DD", true);
  const endDate = dayjs(end, "YYYY-MM-DD", true);

  if (count && count !== "count") {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: `Invalid path '/range/${count}/' — Try instead '/range/count/'`
    });
    return;
  }

  if (!startDate.isValid() || !endDate.isValid()) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: "Parameters 'start' and 'end' are required and have to be a valid date (YYYY-MM-DD)"
    });
    return;
  }

  const QUERY_MODEL = {
    // eslint-disable-next-line no-nested-ternary
    attributes: column ? Array.isArray(column) ? column : new Array(column) : null,
    where: {
      [Sequelize.Op.and]: [
        {
          assigned_day: {
            [Sequelize.Op.gte]: startDate.format()
          }
        },
        {
          assigned_day: {
            [Sequelize.Op.lt]: endDate.format()
          }
        }
      ]
    }
  };

  if (count) {
    Entries.count(QUERY_MODEL)
      .then(countValue => res.json({
        records_in_range: countValue
      }))
      .catch(error => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: error.original.toString()
        });
        logger.error(error);
      });
    return;
  }

  Entries.findAndCountAll(QUERY_MODEL)
    .then(entries => res.json({
      count: entries.count,
      entries: entries.rows
    }))
    .catch(error => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: error.original.toString()
      });
      logger.error(error);
    });
});

module.exports = router;
