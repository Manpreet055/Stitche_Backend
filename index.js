require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const orders = require("./routes/ordersRoute");
const users = require("./routes/usersRoute");
const inbox = require("./routes/inboxRoute");
const products = require("./routes/productsRoute");

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:4173"],
    credentials: true,
  })
);

app.use("/users", users);
app.use("/orders", orders);
app.use("/inbox", inbox);
app.use("/products", products);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
