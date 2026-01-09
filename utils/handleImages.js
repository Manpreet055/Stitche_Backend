const { uploadWithPreset } = require("../utils/uploadBuffer");
const { cloudinary } = require("../config/cloudinary");

exports.handleUpdatedProductImages = async (
  req,
  product = {},
  updates = {},
) => {
  let images = [...(product.media?.images || [])];
  let imagesIds = [...(product.media?.imagesIds || [])];
  let thumbnail = product.media?.thumbnail || "";
  let thumbnailId = product.media?.thumbnailId || null;

  // HANDLE NEW THUMBNAIL
  if (req.files?.newThumbnail) {
    if (thumbnailId) {
      await cloudinary.uploader.destroy(thumbnailId);
    }
    const result = await uploadWithPreset(
      req.files.newThumbnail[0].buffer,
      `products/${product.title.trim()}/thumbnails`,
      "productThumb",
    );
    thumbnailId = result.public_id;
    thumbnail = result.secure_url;
  }

  // HANDLE NEW IMAGES
  if (req.files?.newImages) {
    for (const img of req.files.newImages) {
      const result = await uploadWithPreset(
        img.buffer,
        `products/${product.title.trim()}/images`,
        "productMain",
      );
      imagesIds.push(result.public_id);
      images.push(result.secure_url);
    }
  }

  // HANDLE REMOVED IMAGES
  let removedImages = updates.removedImages || [];

  if (typeof removedImages === "string") {
    removedImages = JSON.parse(removedImages);
  }

  for (const url of removedImages) {
    const index = images.indexOf(url);
    if (index > -1) {
      const publicId = imagesIds[index];
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
        imagesIds.splice(index, 1);
      }
      images.splice(index, 1);
    }
  }

  return {
    images,
    thumbnail,
    thumbnailId,
    imagesIds,
  };
};

exports.handleNewProductImages = async (req) => {
  const images = [];
  const imagesIds = [];
  let thumbnail = "";
  let thumbnailId = null;

  // Upload thumbnail
  if (req.files?.thumbnail) {
    const result = await uploadWithPreset(
      req.files.thumbnail[0].buffer,
      `products/${req.body.title.trim()}/thumbnails`,
      "productThumb",
    );
    thumbnail = result.secure_url;
    thumbnailId = result.public_id;
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
      imagesIds.push(result.public_id);
    }
  }

  return { images, thumbnail, imagesIds, thumbnailId };
};
