const { connectMongoDB } = require("../config/connectMongoDB");

const handleSearch = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        status: 0,
        msg: "Search query is required",
      });
    }

    const searchConfig = [
      {
        collection: "products",
        index: "products_search_index",
        path: ["name", "title", "category", "brand", "subCategory"],
      },
      {
        collection: "users",
        index: "users_search_index",
        path: [
          "username",
          "email",
          "role",
          "profile.fullName",
          "profile.phone",
          "profile.address.city",
          "profile.address.country",
          "profile.address.street",
        ],
      },
      {
        collection: "orders",
        index: "orders_search_index",
        path: [
          "orderId",
          "user.username",
          "user.email",
          "user.firstName",
          "user.lastName",
          "user.phone",
          "shipping.address",
          "shipping.city",
          "shipping.country",
          "shipping.postalCode",
        ],
      },
    ];

    const searchResults = await Promise.all(
      searchConfig.map(async (config) => {
        const collection = await connectMongoDB(config.collection);
        const result = await collection
          .aggregate([
            {
              $search: {
                index: config.index,
                text: {
                  query: query,
                  path: config.path,
                  fuzzy: { maxEdits: 2 },
                },
              },
            },
            { $limit: 15 },
          ])
          .toArray();
        return { [config.collection]: result };
      }),
    );

    const merged = Object.assign({}, ...searchResults);
    res.status(200).json({
      status: 1,
      msg: "Found these results..",
      results: merged,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: `Server Error :${error.message}`,
    });
  }
};

module.exports = handleSearch;
