console.clear();

require("dotenv").config();
const express = require("express");
const db = require("./config/database");

const port = process.env.PORT || 5000;
const app = express();

// Test database connection
db.authenticate()
	.then(console.log("Connection to the database has been established successfully!"))
	.catch(err => console.error("Unable to connect to the database:", err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/entries", require("./routes/entries"));
app.use("/api/jwt", require("./routes/jwt-info"));


app.listen(port, () => console.log(`Server running on port ${port}`));
