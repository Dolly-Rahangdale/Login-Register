// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to your MongoDB database
mongoose.connect('mongodb://127.0.0.1:27017/my_database', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(()=>{
    console.log("connected to database")
})
.catch((error)=>{
    console.log("failed to connect Database", error)
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);

// Implement the registration endpoint
app.post('/api/register', async (req, res) => {
  const { name, dateOfBirth, email, password } = req.body;
console.log("req.body", req.body);
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({ name, dateOfBirth, email, password: hashedPassword });
    await user.save();
console.log("********users********", user);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Could not register user' });
  }
});

// Implement the login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT token and send it back to the client
    const token = jwt.sign({ userId: user._id }, 'your-secret-key');
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Could not login user' });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
