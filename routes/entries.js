const express = require("express");
const router = express.Router();

const myData = {
	1: { name: "Markus", surname: "Kremer", age: 23 },
	2: { name: "Becci", surname: "Kremer", age: 26 },
	3: { name: "Wolfgang", surname: "Kremer", age: 57 },
};

router.get("/", (req, res) => {
	res.send(myData);
});

router.get("/:id", (req, res) => {
	res.send(myData[Number(req.params.id)]);
});

module.exports = router;
