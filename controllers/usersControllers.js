const { connectMongoDB } = require("../config/connectMongoDB");
const { ObjectId } = require("mongodb");

const getUsers = async (req, res) => {
  try {
    const Users = await connectMongoDB("users");
    let { limit, page } = req.query;
    limit = parseInt(limit) || 10;
    page = parseInt(page) || 1;
    const skip = (page - 1) * limit;
    const length = await Users.countDocuments();
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

const handleFindUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      res.status(400).json({
        status: 0,
        msg: "User Id is not valid",
      });
    }

    const Users = await connectMongoDB("users");
    const foundUser = await Users.findOne({ _id: new ObjectId(id) });

    if (!foundUser) {
      res.status(404).json({
        status: 0,
        msg: "User not found",
      });
    }
    res.status(200).json({
      status: 1,
      msg: "Data fetching Successful",
      user: foundUser,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: `Something went wrong:${error.message}`,
    });
  }
};

const filterUsers = async (req, res) => {
  try {
    const { ...filters } = req.query;

    if (Object.keys(filters).length === 0) {
      return res.status(400).json({
        status: 0,
        msg: "Please provide filters",
      });
    }
    for (const key in filters) {
      if (filters[key] === "true") filters[key] = true;
      else if (filters[key] === "false") filters[key] = false;
      else if (!isNaN(filters[key])) filters[key] = Number(filters[key]);
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
      foundUsers: filteredUsers.length,
      users: filteredUsers,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: `Server Error: ${error.message}`,
    });
  }
};

module.exports = { getUsers, filterUsers, handleFindUserById };
