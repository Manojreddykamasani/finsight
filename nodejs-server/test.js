// Install mongoose first:
// npm install mongoose

const mongoose = require('mongoose');

// Replace with your MongoDB URI
const uri = "mongodb+srv://manojreddy08113_db_user:manoj08113@cluster0.jrnlvwe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function connectDB() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    console.log("Connected successfully to MongoDB with Mongoose!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } finally {
    // Close the connection after testing
    await mongoose.connection.close();
  }
}

connectDB();
