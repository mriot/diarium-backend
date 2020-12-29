const { StatusCodes } = require("http-status-codes");
const express = require("express");
const Sequelize = require("sequelize");
const logger = require("node-color-log");
const verifyJWT = require("../../middleware/jwt");
const Entries = require("../../models/entries");
const dayjs = require("dayjs");

const router = express.Router();

// GET ALL ENTRIES OR ONE BY ID
router.get("/", verifyJWT, (req, res) => {
  if (req.query.id) {
    Entries.findOne({
      where: {
        entry_id: req.query.id
      }
    })
      .then(entry => res.json(entry || {}))
      .catch(error => logger.error(error));
  } else {
    Entries.findAndCountAll()
      .then(entries => res.json({
        count: entries.count,
        entries: entries.rows
      }))
      .catch(error => logger.error(error));
  }
});

// ALL ENTRIES FOR GIVEN YEAR
router.get("/:year", verifyJWT, (req, res) => {
  const parsedDate = dayjs(req.params.year, "YYYY", true);

  if (!parsedDate.isValid()) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: parsedDate.toString(), required_format: "YYYY" });
    return;
  }

  Entries.findAndCountAll({
    where: {
      [Sequelize.Op.and]: [
        {
          assigned_day: {
            [Sequelize.Op.gte]: parsedDate.format()
          }
        },
        {
          assigned_day: {
            [Sequelize.Op.lt]: parsedDate.add(1, "year").format()
          }
        }
      ]
    }
  })
    .then(entries => res.json({
      count: entries.count,
      entries: entries.rows
    }))
    .catch(error => logger.error(error));
});

// ALL ENTRIES FOR GIVEN YEAR:MONTH PAIR
router.get("/:year/:month", verifyJWT, (req, res) => {
  const { year, month } = req.params;
  const parsedDate = dayjs(`${year}-${month}`, "YYYY-MM", true);

  if (!parsedDate.isValid()) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: parsedDate.toString(), required_format: "YYYY-MM" });
    return;
  }

  Entries.findAndCountAll({
    where: {
      [Sequelize.Op.and]: [
        {
          assigned_day: {
            [Sequelize.Op.gte]: parsedDate.format()
          }
        },
        {
          assigned_day: {
            [Sequelize.Op.lt]: parsedDate.add(1, "month").format()
          }
        }
      ]
    }
  })
    .then(entries => res.json({
      count: entries.count,
      entries: entries.rows
    }))
    .catch(error => logger.error(error));
});

// GET SINGLE ENTRY (matching year/month/day)
router.get("/:year/:month/:day", async (req, res) => {
  const { year, month, day } = req.params;
  const parsedDate = dayjs(`${year}-${month}-${day}`, "YYYY-MM-DD", true);

  if (!parsedDate.isValid()) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: parsedDate.toString(), required_format: "YYYY-MM-DD"
    });
    return;
  }

  try {
    const result = await Entries.findOne({
      where: {
        assigned_day: parsedDate.format()
      }
    });

    res.json(result || {});
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      error: "Internal Server Error",
      message: "Could not query database"
    });
  }
});

module.exports = router;
