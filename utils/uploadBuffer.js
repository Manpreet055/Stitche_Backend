const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const { IMAGE_PRESETS } = require("./imagePresets");
const uploadBuffer = (buffer, folder, cropOptions = {}) => {
  const {
    cropMode = "fill",
    width = 800,
    height = 800,
    gravity = "auto",
  } = cropOptions;

  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      transformation: [
        {
          width: width,
          height: height,
          crop: cropMode,
          gravity: gravity,
        },
      ],
      quality: "auto",
      fetch_format: "auto",
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      },
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Helper function to upload with preset
const uploadWithPreset = (buffer, folder, presetName) => {
  const preset = IMAGE_PRESETS[presetName];
  if (!preset) {
    throw new Error(`Invalid preset: ${presetName}`);
  }
  return uploadBuffer(buffer, folder, preset);
};

module.exports = { uploadBuffer, uploadWithPreset, IMAGE_PRESETS };
