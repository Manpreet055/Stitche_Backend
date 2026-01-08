const { IMAGE_PRESETS, uploadWithPreset } = require("../utils/uploadBuffer");

exports.handleNewProductImages = async (req, product = {}, updates = {}) => {
  let images = [...product.media.images];
  let thumbnail = product.media.thumbnail;

  // HANDLE NEW THUMBNAIL
  if (req.files?.newThumbnail) {
    const result = await uploadWithPreset(
      req.files.newThumbnail[0].buffer,
      `products/${product.title.trim()}/thumbnails`,
      "productThumb",
    );
    thumbnail = result.secure_url;
  }

  // HANDLE NEW IMAGES
  if (req.files?.newImages) {
    for (const img of req.files.newImages) {
      //buffer upload for each image
      const result = await uploadWithPreset(
        img.buffer,
        `products/${product.title.trim()}/images`,
        "productMain",
      );
      images.push(result.secure_url);
    }
  }

  // HANDLE REMOVED IMAGES
  let removedImages = updates.removedImages || [];

  if (typeof removedImages === "string") {
    // If single value OR comma-separated string
    removedImages = removedImages.split(",");
  }

  if (!Array.isArray(removedImages)) {
    removedImages = [removedImages];
  }

  if (removedImages.length > 0) {
    images = images.filter((url) => !removedImages.includes(url));
  }

  return { images, thumbnail };
};

exports.handleUpdatedProductImages = async (req) => {
  const images = [];
  let thumbnail = "";

  // Upload thumbnail
  if (req.files?.thumbnail) {
    const result = await uploadWithPreset(
      req.files.thumbnail[0].buffer,
      `products/${req.body.title.trim()}/thumbnails`,
      "productThumb",
    );
    thumbnail = result.secure_url;
  }

  // Upload images
  if (req.files?.images) {
    for (const img of req.files.images) {
      const result = await uploadWithPreset(
        img.buffer,
        `products/${req.body.title.trim()}/images`,
        "productMain",
      );
      images.push(result.secure_url);
    }
  }

  return { images, thumbnail };
};
