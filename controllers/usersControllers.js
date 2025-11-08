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

    const data = await Users.find(
      {},
      {
        projetion: {
          Username: 1,
          role: 1,
          email: 1,
          status: 1,
          orders: 1,
          lastLogin: 1,
        },
      },
    )
      .sort({ dateJoined: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

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

const filterUsers = async (req, res) => {
  try {
    const filters = { ...req.body };

    if (Object.keys(filters).length === 0) {
      return res.status(400).json({
        status: 0,
        msg: "Please provide filters",
      });
    }

    const Users = await connectMongoDB("users");
    const filteredUsers = await Users.find(filters).toArray();

    if (filteredUsers.length === 0) {
      return res.status(404).json({
        status: 0,
        msg: "No Users found",
      });
    }

    res.status(200).json({
      status: 1,
      msg: "Users filtration successful.",
      users: filteredUsers,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: `Server Error: ${error.message}`,
    });
  }
};

module.exports = { getUsers, filterUsers };
