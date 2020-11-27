const HttpStatus = require("http-status-codes");
const express = require("express");
const moment = require("moment");
const Sequelize = require("sequelize");
const Joi = require("@hapi/joi");
const logger = require("node-color-log");
const string = require("@hapi/joi/lib/types/string");
const verifyJWT = require("../middleware/jwt");
const Entries = require("../models/entries");
const sanitize = require("./_functions/sanitizer");

const router = express.Router();

/**
 * =============== [ GET - REQUESTS ] ===============
 */

// SEARCH
router.get("/search", verifyJWT, (req, res) => {
  if (!req.query.q) {
    res.status(HttpStatus.BAD_REQUEST).json({ error: "No query specified" });
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

// COUNT ALL
router.get("/count", (req, res) => {
  Entries.count()
    .then(count => res.json({ all_records: count }))
    .catch(error => logger.error(error));
});

router.get("/range/:count?", verifyJWT, (req, res) => {
  const { count } = req.params;
  const { start, end, column } = req.query;
  const startDate = moment(start, "YYYY-MM-DD", true);
  const endDate = moment(end, "YYYY-MM-DD", true);

  if (count && count !== "count") {
    res.status(HttpStatus.BAD_REQUEST).json({
      error: `Invalid path '/range/${count}/' — Try instead '/range/count/'`
    });
    return;
  }

  if (!startDate.isValid() || !endDate.isValid()) {
    res.status(HttpStatus.BAD_REQUEST).json({
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
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
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
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: error.original.toString()
      });
      logger.error(error);
    });
});

// GET ALL ENTRIES OR ONE BY ID
router.get("/", verifyJWT, (req, res) => {
  if (req.query.id) {
    Entries.findOne({
      where: {
        entry_id: req.query.id
      }
    })
      .then(entry => res.json(entry))
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
  const parsedDate = moment(req.params.year, "YYYY", true);

  if (!parsedDate.isValid()) {
    res.status(HttpStatus.BAD_REQUEST).json({ error: parsedDate.toString(), required_format: "YYYY" });
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
  const parsedDate = moment(`${year}-${month}`, "YYYY-MM", true);

  if (!parsedDate.isValid()) {
    res.status(HttpStatus.BAD_REQUEST).json({ error: parsedDate.toString(), required_format: "YYYY-MM" });
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
router.get("/:year/:month/:day", verifyJWT, (req, res) => {
  const { year, month, day } = req.params;
  const parsedDate = moment(`${year}-${month}-${day}`, "YYYY-MM-DD", true);

  if (!parsedDate.isValid()) {
    res.status(HttpStatus.BAD_REQUEST).json({ error: parsedDate.toString(), required_format: "YYYY-MM-DD" });
    return;
  }

  Entries.findOne({
    where: {
      assigned_day: parsedDate.format()
    }
  })
    .then(entry => res.json(entry))
    .catch(error => logger.error(error));
});

/**
 * =============== [ POST - REQUESTS ] ===============
 */

// CREATE SINGLE ENTRY
router.post("/", verifyJWT, (req, res) => {
  // JSON.parse is done by json-middleware in app.js
  const REQUEST_BODY_JSON = req.body;

  // validate content
  const schema = Joi.object({
    assigned_day: Joi.date().required(),
    content: Joi.object({
      time: Joi.number().required(),
      blocks: Joi.array().required(),
      version: Joi.string().optional()
    }).required(),
    tags: Joi.array().required()
  });

  const { error } = schema.validate(REQUEST_BODY_JSON);

  if (error) {
    res.status(HttpStatus.BAD_REQUEST).json({
      error: "The data is not matching the required schema.",
      required_schema: {
        assigned_day: "DATE (YYYY-MM-DD)",
        content: {
          time: "NUMBER (unix timestamp)",
          blocks: "ARRAY [{}, {}, ...]",
          version: "OPTIONAL - STRING (Editor.js version)"
        },
        tags: "ARRAY ['tag1', 'tag2', ...]"
      }
    });
    return;
  }

  // strictly check if date matches the required format
  const assignedDay = moment(REQUEST_BODY_JSON.assigned_day, "YYYY-MM-DD", true);
  if (!assignedDay.isValid()) {
    res.status(HttpStatus.BAD_REQUEST).json({ error: assignedDay.toString(), required_format: "YYYY-MM-DD" });
    return;
  }

  // check if an entry already exists for that day
  Entries.findOne({
    where: {
      assigned_day: {
        [Sequelize.Op.eq]: assignedDay
      }
    }
  })
    .then(existingEntry => {
      if (existingEntry) {
        res.status(HttpStatus.CONFLICT).json({
          error: `Entry for ${moment(assignedDay).format("YYYY-MM-DD")} already exists!`
        });
        return;
      }

      Entries.create({
        assigned_day: assignedDay,
        content: JSON.stringify(REQUEST_BODY_JSON.content),
        tags: REQUEST_BODY_JSON.tags,
        sanitized_content: sanitize(REQUEST_BODY_JSON.content)
      })
        .then(newEntry => res.json(newEntry))
        .catch(createError => logger.error(createError));
    });
});

/**
 * =============== [ PUT - REQUESTS ] ===============
 */

// UPDATE SINGLE ENTRY
router.put("/", verifyJWT, (req, res) => {
  if (!req.query.id) {
    res.status(HttpStatus.BAD_REQUEST).json({ error: "No ID specified" });
    return;
  }

  Entries.findOne({
    where: {
      entry_id: req.query.id
    }
  })
    .then(existingEntry => {
      if (!existingEntry) {
        res.status(HttpStatus.NOT_FOUND).json({ error: `Entry for ID ${req.query.id} not found` });
        return;
      }

      const schema = Joi.object({
        assigned_day: Joi.date().optional(),
        content: Joi.string().optional(),
        tags: Joi.array().optional()
      });

      const { error } = schema.validate(req.body);

      if (error) {
        res.status(HttpStatus.BAD_REQUEST).json({ error });
        return;
      }

      // determine what to update
      const queryConfig = {};
      const { assignedDay, content, tags } = req.body;

      if (assignedDay) {
        queryConfig.assigned_day = assignedDay;
      }
      if (tags) {
        queryConfig.tags = tags;
      }
      if (content) {
        const [cleanHTML, cleanText] = sanitize(content);
        queryConfig.content = cleanHTML;
        queryConfig.content_text = cleanText;
      }

      existingEntry.update(queryConfig)
        .then(updatedEntry => res.send(updatedEntry))
        .catch(updateError => logger.error(updateError));
    });
});

/**
 * =============== [ DELETE - REQUESTS ] ===============
 */

// DELETE SINGLE ENTRY
router.delete("/", verifyJWT, (req, res) => {
  if (!req.query.id) {
    res.status(HttpStatus.BAD_REQUEST).json({ error: "No ID specified" });
    return;
  }

  Entries.findOne({
    where: {
      entry_id: req.query.id
    }
  })
    .then(existingEntry => {
      if (!existingEntry) {
        res.status(HttpStatus.NOT_FOUND).json({ error: `Entry for ID ${req.query.id} not found` });
        return;
      }

      existingEntry.destroy()
        .then(deletedEntry => res.send(deletedEntry))
        .catch(deleteError => logger.error(deleteError));
    });
});

module.exports = router;
