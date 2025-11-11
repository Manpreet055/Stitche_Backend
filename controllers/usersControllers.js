const User = require("../models/userSchema");
const { ObjectId } = require("mongodb");
const getUsers = async (req, res) => {
  try {
    let { limit, page } = req.query;
    limit = parseInt(limit) || 10;
    page = parseInt(page) || 1;
    const skip = (page - 1) * limit;
    const length = await User.countDocuments();
    const totalPages = Math.ceil(length / limit);

    const data = await User.find()
      .sort({ dateJoined: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

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

    const foundUser = await User.findById(id).lean();

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

module.exports = { getUsers, handleFindUserById };
