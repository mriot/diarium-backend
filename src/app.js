require("dotenv").config();
const express = require("express");
const cors = require("cors");
const logger = require("node-color-log");
const chalk = require("chalk");
const db = require("./config/database");
const { StatusCodes } = require("http-status-codes");
const fileUpload = require("express-fileupload");
const morgan = require("./config/morgan");

const port = process.env.PORT || 5000;
const app = express();

console.clear();

db.authenticate()
  .then(logger.info("Successfully connected to the database"))
  .catch(err => logger.error("Unable to connect to the database:", err));

app.use(morgan(":method :url » :status :res[content-length] (:response-time ms)", {
  skip: (req, res) => { return req.method === "OPTIONS"; }
}));
app.use(cors());
app.use(express.json({ limit: "300kb" })); // http://expressjs.com/en/4x/api.html#express.json
app.use(express.urlencoded({ extended: true }));

app.use(fileUpload());

app.use("/api/user", require("./routes/user"));
app.use("/api/entries", require("./routes/entries"));
app.use("/api/jwt", require("./routes/jwt-info"));
app.use("/api/upload", require("./routes/upload"));
app.use((req, res, next) => {
  console.log(chalk.bgRed(StatusCodes.NOT_FOUND));
  res.status(StatusCodes.NOT_FOUND).json({ error: `Could not find endpoint ${req.url}` });
});

app.listen(port, () => logger.info(`Server running on port ${port}`));
