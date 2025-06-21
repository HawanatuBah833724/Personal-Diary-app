const express = require('express');
const router = express.Router();
const DiaryEntry = require('../models/DiaryEntry');

// Create a new diary entry
router.post('/', async (req, res) => {
  try {
    const newEntry = new DiaryEntry(req.body);
    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all diary entries
router.get('/', async (req, res) => {
  try {
    const entries = await DiaryEntry.find();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single diary entry by ID
router.get('/:id', async (req, res) => {
  try {
    const entry = await DiaryEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a diary entry by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedEntry = await DiaryEntry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEntry) return res.status(404).json({ message: 'Entry not found' });
    res.json(updatedEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a diary entry by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedEntry = await DiaryEntry.findByIdAndDelete(req.params.id);
    if (!deletedEntry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
