const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

const dbURI = "mongodb+srv://manojreddy08113_db_user:manoj08113@cluster0.jrnlvwe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(dbURI)
  .then(() => {
    console.log('MongoDB connected successfully!');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('Use this URL to view the server in your browser: http://localhost:3000');
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  }
});

const Item = mongoose.model('Item', itemSchema);

app.use(express.json());

app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find();
    if (items.length === 0) {
      const dummyItem = new Item({
        name: 'First Item',
        quantity: 1
      });
      await dummyItem.save();
      return res.status(200).json([dummyItem]);
    }
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/', (req, res) => {
  res.send('Server is connected to MongoDB!');
});
