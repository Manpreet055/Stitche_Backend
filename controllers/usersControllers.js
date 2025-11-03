const { connectMongoDB } = require("../config/connectMongoDB");

const getUsers = async (req, res) => {
  try {
    const Users = await connectMongoDB("users");
    let { limit, page } = req.query;
    limit = parseInt(limit) || 10;
    page = parseInt(page) || 1;
    const skip = (page - 1) * limit;
    const length = await Users.find().count();
    const totalPages = Math.ceil(length / limit);

    const data = await Users.find().sort({dateJoined:1}).skip(skip).limit(limit).toArray();

    res.send({
      status: 1,
      msg: "Data fetched..",
      totalPages: totalPages,
      users: data,
    });
  } catch (err) {
    res.status(500).send({
      status: 0,
      msg: `Server Error : ${err.message}`,
    });
  }
};

const handleSearchUsers = async (req, res) => {
  try {
    const Users = await connectMongoDB("users");
    const { query,limit } = req.query;
    
    if (!query) {
      return res.status(400).json({
        status: 0,
        msg: "Search query is required",
      });
    }
    
    const searchResults = await Users.aggregate([
      {
        $search: {
          index: "users",
          text: {
            query:query,
            path: [
              "Username",
              "email",
              "phone",
              "status",
              "role",
              "address.city",
              "address.country"
            ],
            fuzzy: { maxEdits: 2 },
          },
        },
      },
      { $limit: limit || 10 },
    ]).toArray();
    
    res.status(200).json({
      status: 1,
      msg: "Data fetched successfully",
      users: searchResults,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: `Server Error: ${error.message}`,
    });
  }
};

module.exports = { getUsers, handleSearchUsers };
