import mongoose from "mongoose";

const connectToDB = () => {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then((data) => {
      console.log("Connected to DB:", data.connection.host);
    })
    .catch((error) => {
      console.log("DB CONNECTION ERROR:", error);
      throw new ErrorHandler(500, "Failed to connect to the database");
    });
};

export default connectToDB;
