import dotenv from "dotenv";
dotenv.config({ quiet: true });
import express from "express";
import connectToDB from "./config/db.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const PORT = process.env.PORT;
const app = express();

connectToDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("This is server");
});

app.use("/user", userRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log("Server is listening on PORT", PORT);
});
