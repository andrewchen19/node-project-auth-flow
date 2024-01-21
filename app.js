const express = require("express");
const app = express();

const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const { authenticateUser } = require("./middleware/auth");
const notFound = require("./middleware/not-found");
const connectDB = require("./db/connect");
require("dotenv").config();

// build-in module
const path = require("path");

// extra packages
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");

// used to inform the Express application to trust a proxy server's settings
app.set("trust proxy", 1);

// middlewares
app.use(express.static("./public"));
app.use(express.json());
// const __dirname = dirname(fileURLToPath(import.meta.url))
app.use(express.static(path.resolve(__dirname, "./client/build")));

// other middlewares
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60, // Limit each IP to 60 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
      msg: "Too many requests from this IP, please try again after 15 minutes",
    },
  })
);
app.use(morgan("tiny"));
app.use(helmet());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(fileUpload());
app.use(xss());

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", authenticateUser, userRouter);

app.use("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});

// custom global middleware (after all routes)
app.use(notFound);

// server will start only if we have successfully connected to DB
const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.CONNECT_STRING);

    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
