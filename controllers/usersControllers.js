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
      users: data,
      totalPages: totalPages,
    });
  } catch (err) {
    res.status(500).send({
      status: 0,
      msg: `Server Error : ${err.message}`,
    });
  }
};

module.exports = { getUsers };
