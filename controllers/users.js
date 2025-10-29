const connectMongoDB = require("../config/connectMongoDB")

const getUsers = async (req, res) => {
  try {
    const Users = await connectMongoDB("users")
    const data = await Users.find().toArray()
    res.send({
      status: 1,
      msg: "Data fetched..",
      users: data,
    });
  } catch (err) {
    res.status(500).send({
      status: 0,
      msg: `Server Error : ${err.message}`,
    });
  }
};

module.exports = { getUsers };