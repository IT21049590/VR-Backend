const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Replace with your MongoDB connection string
const mongoURI =
  "mongodb+srv://hiruna:abcd1234@cluster0.20vxq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3000;

// Define a schema for the 'user' collection
// Create a model based on the schema
const db = mongoose.connection.useDb("VR"); // Replace <dbname> with your actual database name
const User = db.collection("user");


// API route to get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({}).toArray(); // Convert the cursor to an array
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// app.get("/users/:email", async (req, res) => {
//   try {
//     const email = req.params.email;
//     const user = await User.findOne({ User: { $regex: new RegExp(email, "i") } }); // Case-insensitive search for email
//     if (user) {
//       res.json(user); // Return the user data
//     } else {
//       res.status(404).json({ message: "User not found" });
//     }
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// app.get("/user/:email", async (req, res) => {
//   try {
//     const email = req.params.email;
//     const user = await User.findOne({ User: { $regex: new RegExp(email, "i") } });
//     if (user) {
//       res.json(user);
//     } else {
//       res.status(404).json({ message: "User not found" });
//     }
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

app.get("/users/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const users = await User.find({ User: email }).toArray(); // Convert the cursor to an array
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
