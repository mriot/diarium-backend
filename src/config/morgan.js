const morgan = require("morgan");
const chalk = require("chalk");

// https://github.com/expressjs/morgan/issues/186
morgan.token("status", (req, res) => {
  const status = res.statusCode || "status n/a";

  switch (true) {
    case status >= 500:
      return chalk.redBright(status);
    case status >= 400:
      return chalk.bgRed(status);
    case status >= 300:
      return chalk.yellow(status);
    case status >= 200:
      return chalk.green(status);
    default:
      return status;
  }
});

module.exports = morgan;
