const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
	const token = (req.headers.authorization && req.headers.authorization.split(" ")[1]) || false;

	if (!token) {
		res.sendStatus(401);
		next();
		return;
	}

	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) {
			res.status(401).json({ err });
			return;
		}
		next();
	});
};

module.exports = verifyJWT;
