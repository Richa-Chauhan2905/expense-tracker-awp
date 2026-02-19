import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI
    );
    console.log(`Mongodb connected ${connection.connection.host}`);
  } catch (error) {
    console.log("Couldn't connect to DB ", error);
  }
};
