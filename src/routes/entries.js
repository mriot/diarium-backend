const { StatusCodes } = require("http-status-codes");
const express = require("express");
const Sequelize = require("sequelize");
const Joi = require("@hapi/joi");
const logger = require("node-color-log");
const verifyJWT = require("../middleware/jwt");
const Entries = require("../models/entries");
const sanitize = require("./_functions/sanitizer");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");

dayjs.extend(customParseFormat);

const router = express.Router();

router.use(require("./entries/count"));
router.use(require("./entries/search"));
router.use(require("./entries/uploads"));
router.use(require("./entries/range"));
router.use(require("./entries/get"));

/**
 * ============================== CREATE ==============================
 */

// CREATE SINGLE ENTRY
router.post("/", verifyJWT, (req, res) => {
  // JSON.parse is done by json-middleware in app.js
  const REQUEST_BODY_JSON = req.body;

  // validate content
  const schema = Joi.object({
    assigned_day: Joi.date().required(),
    content: Joi.string().required(),
    tags: Joi.array().required()
  });

  const { error } = schema.validate(REQUEST_BODY_JSON);

  if (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: "The data is not matching the required schema.",
      required_schema: {
        assigned_day: "DATE (YYYY-MM-DD)",
        content: "HTML",
        tags: "ARRAY ['tag1', 'tag2', ...]"
      }
    });
    return;
  }

  // strictly check if date matches the required format
  const assignedDay = dayjs(REQUEST_BODY_JSON.assigned_day, "YYYY-MM-DD", true);
  if (!assignedDay.isValid()) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: assignedDay.toString(),
      required_format: "YYYY-MM-DD"
    });
    return;
  }

  // check if an entry already exists for that day
  Entries.findOne({
    where: {
      assigned_day: {
        [Sequelize.Op.eq]: assignedDay.format()
      }
    }
  })
    .then(existingEntry => {
      if (existingEntry) {
        res.status(StatusCodes.CONFLICT).json({
          error: `Entry for ${assignedDay.format("YYYY-MM-DD")} already exists!`,
          existingEntry
        });
        return;
      }

      const [cleanHTML, cleanText] = sanitize(REQUEST_BODY_JSON.content);

      Entries.create({
        assigned_day: assignedDay.format(),
        content: cleanHTML,
        content_text: cleanText,
        tags: REQUEST_BODY_JSON.tags
      })
        .then(newEntry => res.json(newEntry))
        .catch(createError => logger.error(createError));
    });
});

/**
 * ============================== UPDATE ==============================
 */

// UPDATE SINGLE ENTRY
router.put("/", verifyJWT, (req, res) => {
  if (!req.query.id) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "No ID specified" });
    return;
  }

  Entries.findOne({
    where: {
      entry_id: req.query.id
    }
  })
    .then(existingEntry => {
      if (!existingEntry) {
        res.status(StatusCodes.NOT_FOUND).json({ error: `Entry for ID ${req.query.id} not found` });
        return;
      }

      const schema = Joi.object({
        content: Joi.string().optional(),
        tags: Joi.array().optional(),
        rating: Joi.number().optional()
      });

      const { error } = schema.validate(req.body);

      if (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ error });
        return;
      }

      // determine what to update
      const queryConfig = {};
      const { rating, content, tags } = req.body;

      if (typeof rating !== "undefined") {
        queryConfig.day_rating = rating;
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
 * ============================== DELETE ==============================
 */

// DELETE SINGLE ENTRY
router.delete("/", verifyJWT, (req, res) => {
  if (!req.query.id) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "No ID specified" });
    return;
  }

  Entries.findOne({
    where: {
      entry_id: req.query.id
    }
  })
    .then(existingEntry => {
      if (!existingEntry) {
        res.status(StatusCodes.NOT_FOUND).json({ error: `Entry for ID ${req.query.id} not found` });
        return;
      }

      existingEntry.destroy()
        .then(deletedEntry => res.send(deletedEntry))
        .catch(deleteError => logger.error(deleteError));
    });
});

module.exports = router;
