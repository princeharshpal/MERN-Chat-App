import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    avatar: {
      url: { type: String, required: true, default: "" },
      public_id: { type: String, required: true },
    },
    password: { type: String, required: true, select: false },
    email: { type: String, unique: true, lowercase: true, trim: true, required: true },
    refreshTokens: [{ type: String }],
  },
  { timestamps: true }
);

const requestSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Request = mongoose.model("Request", requestSchema);

const seedUsers = [
  { name: "Alice Johnson", email: "alice@test.com", password: "Test@1234" },
  { name: "Bob Smith", email: "bob@test.com", password: "Test@1234" },
  { name: "Charlie Brown", email: "charlie@test.com", password: "Test@1234" },
  { name: "Diana Prince", email: "diana@test.com", password: "Test@1234" },
  { name: "Edward Norton", email: "edward@test.com", password: "Test@1234" },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    await User.deleteMany({});
    await Request.deleteMany({});
    console.log("Cleared existing users and requests");

    const hashedPassword = await bcrypt.hash("Test@1234", 10);

    const createdUsers = [];
    for (const u of seedUsers) {
      const user = await User.create({
        name: u.name,
        email: u.email,
        password: hashedPassword,
        avatar: {
          url: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=7c3aed&color=fff&bold=true&size=128`,
          public_id: `seed_${u.email}`,
        },
      });
      createdUsers.push(user);
      console.log(`  Created user: ${u.name} (${u.email})`);
    }

    const [alice, bob, charlie, diana, edward] = createdUsers;

    // Alice <-> Bob: friends
    await Request.create({ sender: alice._id, receiver: bob._id, status: "accepted" });
    console.log("  Friendship: Alice <-> Bob");

    // Alice <-> Charlie: friends
    await Request.create({ sender: charlie._id, receiver: alice._id, status: "accepted" });
    console.log("  Friendship: Alice <-> Charlie");

    // Bob <-> Diana: friends
    await Request.create({ sender: bob._id, receiver: diana._id, status: "accepted" });
    console.log("  Friendship: Bob <-> Diana");

    // Edward -> Alice: pending request
    await Request.create({ sender: edward._id, receiver: alice._id, status: "pending" });
    console.log("  Pending request: Edward -> Alice");

    // Diana -> Bob: already friends (handled above)
    // Charlie -> Diana: pending request
    await Request.create({ sender: charlie._id, receiver: diana._id, status: "pending" });
    console.log("  Pending request: Charlie -> Diana");

    console.log("\n===== SEED COMPLETE =====");
    console.log("\nTest accounts (all passwords: Test@1234):");
    console.log("┌─────────────────┬───────────────────┐");
    console.log("│ Name            │ Email             │");
    console.log("├─────────────────┼───────────────────┤");
    for (const u of seedUsers) {
      console.log(`│ ${u.name.padEnd(15)} │ ${u.email.padEnd(17)} │`);
    }
    console.log("└─────────────────┴───────────────────┘");
    console.log("\nFriendships:");
    console.log("  Alice <-> Bob (can chat)");
    console.log("  Alice <-> Charlie (can chat)");
    console.log("  Bob <-> Diana (can chat)");
    console.log("\nPending requests:");
    console.log("  Edward -> Alice (Alice can accept)");
    console.log("  Charlie -> Diana (Diana can accept)");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seed();
