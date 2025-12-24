const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({ storage });

// Handle new images
exports.handleNewImages = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "images", maxCount: 8 },
]);

// Update images
exports.handleUpdatedImages = upload.fields([
  { name: "newThumbnail", maxCount: 1 },
  { name: "newImages", maxCount: 10 },
]);

exports.handleProfileImage = upload.single("avatar");
