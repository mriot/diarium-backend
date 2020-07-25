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
		return;
	}

	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) {
			res.status(401).json({ err });
			return;
		}

		// "refresh" the valid token (=> same payload, new 'exp' and 'iat' date)
		// NOTE: the old token stays valid until it reaches it's expiry date
		const payload = decoded;
		delete payload.exp;
		delete payload.iat;

		jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "12h" }, (signErr, newToken) => {
			if (signErr) {
				res.status(500).json({ error: "Some server sided error occured" });
				return;
			}

			// set header on response object with the new, extended token
			res.set("token", newToken);
		});

		// call next middleware function in stack
		next();
	});
};

module.exports = verifyJWT;
