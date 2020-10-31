const jwt = require("jsonwebtoken");
const HttpStatus = require("http-status-codes");
const chalk = require("chalk");

/**
 * ExpressJS middleware to verify JSON Web Tokens (JWT)
 * @param {Object} req - ExpressJS request object
 * @param {Object} res - ExpressJS response object
 * @param {callback} next - Call the next middleware function in the stack
 */
const verifyJWT = (req, res, next) => {
  const token = (req.headers.authorization && req.headers.authorization.split(" ")[1]) || false;

  // NO TOKEN FOUND
  if (!token) {
    res.status(HttpStatus.StatusCodes.BAD_REQUEST).json({ error: "No token found in the authorization header" });
    chalk.red("verifyJWT: No token found!");
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(HttpStatus.StatusCodes.UNAUTHORIZED).json({ error: "Could not verify token" });
      chalk.red("verifyJWT: Could not be verified!");
      return;
    }

    // "refresh" the valid token (=> same payload, new 'exp' and 'iat' date)
    // IMPORTANT: the old token stays valid until it reaches it's expiry date
    const payload = decoded;
    delete payload.exp;
    delete payload.iat;

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "12h" }, (signErr, newToken) => {
      if (signErr) {
        res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Some server sided error occured" });
        chalk.red("verifyJWT: Failed signing JWT!");
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
