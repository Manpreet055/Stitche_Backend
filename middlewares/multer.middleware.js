const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({ storage });

// Handle new images
const handleNewImages = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "images", maxCount: 8 },
]);

// Update images
const handleUpdatedImages = upload.fields([
  { name: "newThumbnail", maxCount: 1 },
  { name: "newImages", maxCount: 10 },
]);

module.exports = { handleNewImages, handleUpdatedImages };
