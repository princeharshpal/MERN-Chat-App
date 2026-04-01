import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

import { User } from "../models/user.model.js";

const SEED_USERS = [
  {
    fullName: "Aarav Sharma",
    email: "aarav@nexus.dev",
    password: "password123",
  },
  {
    fullName: "Priya Patel",
    email: "priya@nexus.dev",
    password: "password123",
  },
  {
    fullName: "Rohan Gupta",
    email: "rohan@nexus.dev",
    password: "password123",
  },
  {
    fullName: "Sneha Verma",
    email: "sneha@nexus.dev",
    password: "password123",
  },
  {
    fullName: "Arjun Singh",
    email: "arjun@nexus.dev",
    password: "password123",
  },
  {
    fullName: "Kavya Reddy",
    email: "kavya@nexus.dev",
    password: "password123",
  },
  {
    fullName: "Dev Malhotra",
    email: "dev@nexus.dev",
    password: "password123",
  },
  {
    fullName: "Ananya Joshi",
    email: "ananya@nexus.dev",
    password: "password123",
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const existingCount = await User.countDocuments({
      email: { $in: SEED_USERS.map((u) => u.email) },
    });

    if (existingCount > 0) {
      console.log(
        `Found ${existingCount} existing seed users. Skipping seed to avoid duplicates.`,
      );
      console.log("To re-seed, delete the existing seed users first.");
      await mongoose.disconnect();
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);

    const usersToInsert = await Promise.all(
      SEED_USERS.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, salt),
      })),
    );

    const created = await User.insertMany(usersToInsert);
    console.log(`Seeded ${created.length} users successfully:`);
    created.forEach((u) => {
      console.log(`  - ${u.fullName} (${u.email}) [id: ${u._id}]`);
    });

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seedDatabase();
