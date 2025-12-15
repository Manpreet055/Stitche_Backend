require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const helmet = require("helmet");
const connectMongoDB = require("./config/connectMongoDB");
const apiLimiter = require("./middlewares/rateLimit");
const coreRouter = require("./routes/coreRoutes");
const userRouter = require("./routes/usersRoute");
const port = process.env.PORT || 3000;
const cookieParser = require("cookie-parser");

const products = require("./routes/productsRoute");

connectMongoDB();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,
  }),
);
app.use("/api/", apiLimiter);

app.use("/products", products);
app.use("/api/", coreRouter);
app.use("/users", userRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
