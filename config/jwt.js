const jwt = require("jsonwebtoken");

/**
 * ExpressJS middleware to verify JSON Web Tokens (JWT)
 * @param {Object} req - ExpressJS request object
 * @param {Object} res - ExpressJS response object
 * @param {callback} next - Call the next middleware function in the stack
 */
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
