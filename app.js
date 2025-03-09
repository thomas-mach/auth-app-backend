const express = require("express");
const userRouter = require("./routes/userRoutes");
const authRouter = require("./routes/authRoutes");
const morgan = require("morgan");
const globalErrorHandling = require("./controllers/errorController");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");

require("./jobs/deleteOldUsers");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());

app.set("trust proxy", 1);

app.use("/v1/auth", authRouter);
app.use("/v1/users", userRouter);

app.use(helmet());
//contro atacchi basati sul headers Cross-Site Scripting (XSS)
// Clickjacking
// Attacchi di sniffing MIME
// Injection di codice
// Altri attacchi basati sugli header HTTP

app.use(globalErrorHandling);

module.exports = app;
