exports.IMAGE_PRESETS = {
  // Profile/Avatar images
  profile: {
    cropMode: "fill",
    width: 400,
    height: 400,
    gravity: "face", // Focus on faces
  },

  // Product main images
  productMain: {
    cropMode: "fit", // Maintain aspect ratio
    width: 1200,
    height: 1200,
    gravity: "center",
  },

  // Product thumbnails
  productThumb: {
    cropMode: "fill",
    width: 300,
    height: 300,
    gravity: "center",
  },

  // Product gallery/zoom images
  productZoom: {
    cropMode: "fit",
    width: 2000,
    height: 2000,
    gravity: "center",
  },

  // Category/Banner images
  banner: {
    cropMode: "fill",
    width: 1920,
    height: 600,
    gravity: "center",
  },

  // Mobile banner
  bannerMobile: {
    cropMode: "fill",
    width: 768,
    height: 400,
    gravity: "center",
  },
};
