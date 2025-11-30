const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({ storage });

//MiddleWare to Handle images on request of creating new Product
const handleNewImages = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "images", maxCount: 8 },
]);

//MiddleWare to Handle images on request of updating Product
const handleUpdatedImages = upload.fields([
  { name: "newThumbnail", maxCount: 1 },
  { name: "newImages", maxCount: 10 },
]);

module.exports = { handleNewImages, handleUpdatedImages };
