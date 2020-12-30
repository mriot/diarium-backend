const dayjs = require("dayjs");
const express = require("express");
const verifyJWT = require("../../middleware/jwt");
const { StatusCodes } = require("http-status-codes");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const ROOT = process.env.LOCAL_UPLOAD_TARGET;

/**
 * /uploads => all uploads
 * /uploads/2020 => all uploads for 2020
 * ...
 * /uploads/2020/12/02/filename.jpg => Single file
 *
 * Multiple uploads are returned as array and sorted by date
 *
 */

/*
example: /uploads/2020/12/
[
  { date: "2020-12-02", type: "image/jpeg", url: "/api/entries/uploads/2020/12/02/picture.jpg" },
  { date: "2020-12-10", type: "image/jpeg", url: "/api/entries/uploads/2020/12/10/picture.jpg" },
  { date: "2020-12-20", type: "image/jpeg", url: "/api/entries/uploads/2020/12/20/picture.jpg" }
]

example: /uploads/2020/
{
  12: [
    { date: "2020-12-02", type: "image/jpeg", url: "/api/entries/uploads/2020/12/02/picture.jpg" },
    { date: "2020-12-10", type: "image/jpeg", url: "/api/entries/uploads/2020/12/10/picture.jpg" },
    { date: "2020-12-20", type: "image/jpeg", url: "/api/entries/uploads/2020/12/20/picture.jpg" }
  ]
}
*/

router.get("/uploads/:year/:month/:day/:filename", function (req, res) {
  const { year, month, day, filename } = req.params;
  const parsedDate = dayjs(`${year}/${month}/${day}`, "YYYY/MM/DD", true);

  if (!parsedDate.isValid()) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: parsedDate.toString(),
      required_format: "YYYY/MM/DD"
    });
    return;
  }

  const filepath = path.join(ROOT, parsedDate.format("YYYY-MM-DD"), filename);

  fs.open(filepath, "r", (err, fd) => {
    if (err) {
      console.log(err);
      return res.sendStatus(StatusCodes.NOT_FOUND);
    }

    res.sendFile(filepath);

    fs.close(fd, (err) => {
      if (err) throw err;
    });
  });
});

router.post("/uploads/:year?/:month?/:day?", function (req, res) {
  const { year, month, day } = req.params;
  const parsedDate = dayjs(`${year}/${month}/${day}`, "YYYY/MM/DD", true);

  if (!parsedDate.isValid()) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: parsedDate.toString(),
      required_format: "YYYY/MM/DD"
    });
  }

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      code: StatusCodes.BAD_REQUEST,
      error: "Bad Request",
      message: "No file to upload"
    });
  }

  const file = req.files.file;
  const filepath = path.join(ROOT, parsedDate.format("YYYY-MM-DD"));

  fs.mkdir(filepath, { recursive: true }, (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        error: "Internal Server Error",
        message: "Could not save file to disk",
        err
      });
    }

    file.mv(path.join(filepath, file.name.replace(/\s/, "_")), (err) => {
      if (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          code: StatusCodes.INTERNAL_SERVER_ERROR,
          error: "Internal Server Error",
          message: "Failed uploading the file",
          err
        });
      }

      res.json({
        path: path.join(req.baseUrl, req.path, file.name.replace(/\s/gi, "_"))
      });
    });
  });
});

module.exports = router;
