const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({ storage });

const uploadMiddleware = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "images", maxCount: 8 },
]);

module.exports = uploadMiddleware;
