console.clear();

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const moment = require("moment");
const db = require("./config/database");

const port = process.env.PORT || 5000;
const app = express();

// Test database connection
db.authenticate()
	.then(console.log("Connection to the database has been established successfully!"))
	.catch(err => console.error("Unable to connect to the database:", err));

// Middleware
app.use((req, res, next) => {
	// console.log(req.headers);
	// console.log(req.body);
	// console.log(req.method);
	// console.log(req.baseUrl);
	// console.log(req.url);
	// console.log(req.params);
	// console.log(req.query);

	console.log("➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖");
	console.log(`\n📨 ${req.method} REQUEST ON ENDPOINT ${req.baseUrl + req.url} • ${moment().format("YYYY-MM-DD HH:mm:ss")}`);
	console.log("———————————————————————————————————————————————————————————————————————————————————————————————————————————");
	console.log("▶ HEADERS:\n", req.headers);
	console.log("▶ PARAMS:\n", req.params);
	console.log("▶ QUERY:\n", req.query);
	console.log("▶ BODY:\n", req.body);

	next();
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/entries", require("./routes/entries"));
app.use("/api/jwt", require("./routes/jwt-info"));


app.listen(port, () => console.log(`Server running on port ${port}`));
