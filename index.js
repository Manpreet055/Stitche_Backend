require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const orders = require("./routes/orders");
const users = require("./routes/users");

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:4173"],
    credentials: true,
  })
);

app.use("/users", users);
app.use("/orders", orders);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
