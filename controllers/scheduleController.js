// controllers/scheduleController.js
const Schedule = require('../models/Schedule');
const fs = require('fs');
const path = require('path');

// @desc    Get all schedules
// @route   GET /api/schedules
// @access  Public
const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ className: 1 });
    // Transform array of documents into an object for easier frontend consumption
    const schedulesObject = schedules.reduce((acc, curr) => {
      acc[curr.className] = curr.fileUrl;
      return acc;
    }, {});
    res.json(schedulesObject);
  } catch (error) {
    console.error('Error fetching schedules:', error); // Added logging
    res.status(500).json({ msg: error.message });
  }
};

// @desc    Upload/Update a schedule for a specific class
// @route   POST /api/schedules
// @access  Private (Admin/Secretaria)
const uploadSchedule = async (req, res) => {
  console.log('Received schedule upload request.');
  console.log('req.body:', req.body); // Log request body
  console.log('req.file:', req.file); // Log req.file to check Multer's output

  const { className } = req.body;
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!className || !fileUrl) {
    console.error('Missing className or fileUrl in schedule upload.'); // Added logging
    return res.status(400).json({ msg: 'Class name and Excel file are required' });
  }

  try {
    let schedule = await Schedule.findOne({ className });
    console.log('Existing schedule found:', schedule); // Added logging

    if (schedule) {
      // If old schedule exists, delete the old file
      if (schedule.fileUrl) {
        const oldFilePath = path.join(__dirname, '..', schedule.fileUrl);
        console.log('Attempting to delete old file:', oldFilePath); // Added logging
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Error deleting old schedule file:', err);
        });
      }
      // Update existing schedule
      schedule.fileUrl = fileUrl;
      schedule.uploadedAt = Date.now();
      await schedule.save();
      console.log('Schedule updated successfully.'); // Added logging
    } else {
      // Create new schedule entry
      schedule = await Schedule.create({ className, fileUrl });
      console.log('New schedule created successfully.'); // Added logging
    }

    res.status(200).json({ msg: `Schedule for ${className} updated successfully`, schedule });

  } catch (error) {
    console.error('Error during schedule upload/update:', error); // More specific error logging
    // If there's an error, delete the newly uploaded file
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting newly uploaded file on schedule update error:', err);
      });
    }
    res.status(500).json({ msg: error.message || 'Internal Server Error' }); // Ensure a message is always sent
  }
};

// @desc    Delete a schedule for a specific class
// @route   DELETE /api/schedules/:className
// @access  Private (Admin/Secretaria)
const deleteSchedule = async (req, res) => {
  const { className } = req.params;

  try {
    const schedule = await Schedule.findOne({ className });

    if (!schedule) {
      return res.status(404).json({ msg: 'Schedule not found for this class' });
    }

    // Delete associated file
    if (schedule.fileUrl) {
      const filePath = path.join(__dirname, '..', schedule.fileUrl);
      console.log('Attempting to delete schedule file:', filePath); // Added logging
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting schedule file:', err);
      });
    }

    await schedule.deleteOne();
    console.log(`Schedule for ${className} removed.`); // Added logging
    res.status(200).json({ msg: `Schedule for ${className} removed` });

  } catch (error) {
    console.error('Error deleting schedule:', error); // Added logging
    res.status(500).json({ msg: error.message || 'Internal Server Error' }); // Ensure a message is always sent
  }
};

module.exports = {
  getSchedules,
  uploadSchedule,
  deleteSchedule,
};
