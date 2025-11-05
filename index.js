require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const helmet = require("helmet");
const handleSearch = require("./controllers/handleSearchController");
const port = process.env.PORT || 3000;

const orders = require("./routes/ordersRoute");
const users = require("./routes/usersRoute");
const inbox = require("./routes/inboxRoute");
const products = require("./routes/productsRoute");

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:5174",
  "http://172.16.14.207:5173",
];

app.use(express.json());
app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use("/users", users);
app.use("/orders", orders);
app.use("/inbox", inbox);
app.use("/products", products);
app.use("/api/search", handleSearch);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
