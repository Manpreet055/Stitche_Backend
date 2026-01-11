const { uploadWithPreset, uploadBuffer } = require("../utils/uploadBuffer");
const cloudinary = require("../config/cloudinary");
const { extractPublicId } = require("../utils/uploadBuffer");
exports.handleUpdatedProductImages = async (
  req,
  product = {},
  updates = {},
) => {
  let images = [...(product.media?.images || [])];
  let imagesIds = [...(product.media?.imagesIds || [])];
  let thumbnail = product.media?.thumbnail || "";
  let thumbnailId = product.media?.thumbnailId || null;
  imagesIds = images.map((url, i) => imagesIds[i] || extractPublicId(url));
  thumbnailId = thumbnailId || extractPublicId(thumbnail);

  const newImages = [...(req.files?.newImages || [])];
  // HANDLE NEW THUMBNAIL
  if (req.files?.newThumbnail) {
    if (thumbnailId) {
      await cloudinary.uploader.destroy(thumbnailId);
    }
    const result = await uploadBuffer(
      req.files.newThumbnail[0].buffer,
      `products/${product.title.replace("&", "_").trim()}/thumbnails`,
    );
    thumbnailId = result.public_id;
    thumbnail = result.secure_url;
  }

  // HANDLE NEW IMAGES
  if (newImages) {
    for (const img of newImages) {
      const result = await uploadBuffer(
        img.buffer,
        `products/${product.title.replace("&", "_").trim()}/images`,
      );
      imagesIds.push(result.public_id);
      images.push(result.secure_url);
    }
  }

  let removedImages = updates.removedImages || [];

  if (typeof removedImages === "string") {
    removedImages = JSON.parse(removedImages);
  }

  if (removedImages.length > 0) {
    for (const url of removedImages) {
      const index = images.indexOf(url);
      if (index === -1) continue;

      // Delete from cloudinary
      const publicId = imagesIds[index] || extractPublicId(url);
      if (publicId) await cloudinary.uploader.destroy(publicId);

      images.splice(index, 1);
      imagesIds.splice(index, 1);
    }

    // Handle thumbnail removal
    const thumbIndex = removedImages.indexOf(thumbnail);
    if (thumbIndex > -1) {
      if (thumbnailId) {
        await cloudinary.uploader.destroy(thumbnailId);
      } else {
        const extractedId = extractPublicId(thumbnail);
        if (extractedId) {
          await cloudinary.uploader.destroy(extractedId);
        }
      }
      thumbnail = "";
      thumbnailId = null;
    }
  }

  const normalizedImagesIds = images
    .map((url, i) => imagesIds[i] || extractPublicId(url))
    .filter(Boolean);
  const normalizedThumbnailId = thumbnail
    ? thumbnailId || extractPublicId(thumbnail)
    : null;
  return {
    images,
    thumbnail,
    imagesIds: normalizedImagesIds,
    thumbnailId: normalizedThumbnailId,
  };
};

exports.handleNewProductImages = async (req) => {
  const images = [];
  const imagesIds = [];
  let thumbnail = "";
  let thumbnailId = null;

  // Upload thumbnail
  if (req.files?.thumbnail) {
    const result = await uploadBuffer(
      req.files.thumbnail[0].buffer,
      `products/${req.body.title.trim()}/thumbnails`,
    );
    thumbnail = result.secure_url;
    thumbnailId = result.public_id;
  }

  // Upload images
  if (req.files?.images) {
    for (const img of req.files.images) {
      const result = await uploadBuffer(
        img.buffer,
        `products/${req.body.title.trim()}/images`,
      );
      images.push(result.secure_url);
      imagesIds.push(result.public_id);
    }
  }

  return { images, thumbnail, imagesIds, thumbnailId };
};
