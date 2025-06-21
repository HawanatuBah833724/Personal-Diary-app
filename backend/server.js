const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/diaryApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, unique: true, required: true }
}));

const Entry = mongoose.model('Entry', new mongoose.Schema({
  title: String,
  content: String,
  userId: String,
  createdAt: { type: Date, default: Date.now }
}));

app.post('/register', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ error: 'User already exists' });
  const user = await new User({ username }).save();
  res.status(200).json({ userId: user._id });
});

app.post('/login', async (req, res) => {
  const { username } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: 'User not found' });
  res.status(200).json({ userId: user._id });
});

app.post('/entries', async (req, res) => {
  const { title, content, userId } = req.body;
  if (!title || !content || !userId) return res.status(400).json({ error: 'All fields required' });
  const encryptedContent = Buffer.from(content).toString('base64');
  const entry = await new Entry({ title, content: encryptedContent, userId }).save();
  res.status(200).json(entry);
});

app.get('/entries/:userId', async (req, res) => {
  const entries = await Entry.find({ userId: req.params.userId });
  const decrypted = entries.map(e => ({
    ...e._doc,
    content: Buffer.from(e.content, 'base64').toString()
  }));
  res.status(200).json(decrypted);
});

app.put('/entries/:id', async (req, res) => {
  const { title, content } = req.body;
  const encrypted = Buffer.from(content).toString('base64');
  await Entry.findByIdAndUpdate(req.params.id, { title, content: encrypted });
  res.json({ success: true });
});

app.delete('/entries/:id', async (req, res) => {
  await Entry.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.listen(4000, () => console.log('Server running on http://localhost:4000'));
