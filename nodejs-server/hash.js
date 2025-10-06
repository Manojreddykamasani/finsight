const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Make sure the path to your userModel is correct
const User = require('./models/userModel'); 

// Load environment variables (like MONGO_URL) from your .env file
dotenv.config();

const MONGO_URI = process.env.MONGO_URL;

// --- The user data to be inserted ---
// It uses the exact hash value you provided.
const userData = {
  email: "testuser@finsight.com",
  password: "$2b$12$t1052rXdUP/F2QdInu.UN.aDwBFG3Igv/EIHTYQu3wsHi3.W1AfCS",
  isVerified: true,
  balance: 100000.0,
  portfolio: [],
};

/**
 * Connects to the database, creates a single user if they don't exist,
 * and then disconnects.
 */
const seedUser = async () => {
  if (!MONGO_URI) {
    console.error('❌ Error: MONGO_URL is not defined in your .env file.');
    process.exit(1); // Exit the script with an error code
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected successfully.');

    // Step 1: Check if a user with this email already exists
    const existingUser = await User.findOne({ email: userData.email });

    if (existingUser) {
      console.warn(`⚠️  A user with the email "${userData.email}" already exists.`);
      console.log('   Skipping creation.');
    } else {
      // Step 2: Create the new user
      console.log(`Creating user with email: ${userData.email}...`);
      await User.create(userData);
      console.log('✅ User was created successfully!');
    }

  } catch (error) {
    console.error('❌ An error occurred during the seeding process:');
    console.error(error);
    process.exit(1);
  } finally {
    // Step 3: Disconnect from the database
    console.log('Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('👋 Connection closed.');
  }
};

// Run the seeder function
seedUser();