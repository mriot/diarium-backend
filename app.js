console.clear();

const express = require("express");
const Sequelize = require("sequelize");
const entries = require("./models/entries");

const port = process.env.PORT || 5000;

const app = express();
const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: "db.sqlite"
});

sequelize
	.authenticate()
	.then(() => {
		console.log("Connection has been established successfully!");
	})
	.catch(err => {
		console.error("Unable to connect to the database:", err);
	});

entries(sequelize, Sequelize);
sequelize.sync();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api/entries", require("./routes/entries"));


app.listen(port, () => console.log(`Server running on port ${port}`));
