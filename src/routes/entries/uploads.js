const dayjs = require("dayjs");
const express = require("express");
const verifyJWT = require("../../middleware/jwt");
const { StatusCodes } = require("http-status-codes");

const router = express.Router();
const PATH = process.env.LOCAL_UPLOAD_TARGET;

router.get("/uploads/:year/:month/:day/:filename", function (req, res) {
  const image = `${PATH}/2020-12-01/Coronamarkus_2.jpg`;
  const video = `${PATH}/2020-12-01/hover.mp4`;
  const pdf = `${PATH}/2020-12-01/test.pdf`;
  const txt = `${PATH}/2020-12-01/StarWars_Movie_Order.txt`;
  const audio = `${PATH}/2020-12-01/audio.mp3`;

  res.sendFile(image);
});

router.post("/uploads/:year?/:month?/:day?", verifyJWT, function (req, res) {
  const { year, month, day } = req.params;
  const parsedDate = dayjs(`${year}/${month}/${day}`, "YYYY/MM/DD", true);

  if (!parsedDate.isValid()) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: parsedDate.toString(),
      required_format: "YYYY/MM/DD"
    });
    return;
  }

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      code: StatusCodes.BAD_REQUEST,
      error: "Bad Request",
      message: "No file to upload found"
    });
  }

  const file = req.files.file;

  console.log(file);
  const dest = `${PATH}/${parsedDate.format("YYYY-MM-DD")}/${file.name.replace(/\s/, "_")}`;
  console.log(dest);

  file.mv(dest, (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        error: "Internal Server Error",
        message: "Failed uploading the file",
        err
      });
    }

    res.send("File uploaded!");
  });
});

module.exports = router;
