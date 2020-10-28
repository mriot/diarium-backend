require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dayjs = require("dayjs");
const logger = require("node-color-log");
const db = require("./config/database");

const port = process.env.PORT || 5000;
const app = express();

console.clear();

// Test database connection
db.authenticate()
	.then(logger.info("Connection to the database has been established successfully!"))
	.catch(err => logger.error("Unable to connect to the database:", err));

// Middleware
app.use((req, res, next) => {
	logger.log("➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖");
	logger.color("cyan").bold().log(`\n📨 ${req.method} ${req.url} • ${dayjs().format("YYYY-MM-DD HH:mm:ss")}`);

	// console.log("▶ HEADERS:\n", req.headers);
	// console.log("▶ PARAMS:\n", req.params);
	// console.log("▶ QUERY:\n", req.query);
	// console.log("▶ BODY:\n", req.body);

	// console.log(req.headers);
	// console.log(req.body);
	// console.log(req.method);
	// console.log(req.url);
	// console.log(req.params);
	// console.log(req.query);

	next();
});
app.use(cors());
app.use(express.json()); // http://expressjs.com/en/4x/api.html#express.json
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/register", require("./routes/register"));
app.use("/api/entries", require("./routes/entries"));
app.use("/api/jwt", require("./routes/jwt-info"));

app.listen(port, () => logger.info(`Server running on port ${port}`));
