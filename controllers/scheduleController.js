// controllers/scheduleController.js
const Schedule = require('../models/Schedule');
const fs = require('fs');
const path = require('path');

const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ className: 1 });
    const schedulesObject = schedules.reduce((acc, curr) => {
      acc[curr.className] = curr.fileUrl;
      return acc;
    }, {});
    res.json(schedulesObject);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ msg: error.message });
  }
};

const uploadSchedule = async (req, res) => {
  console.log('Received schedule upload request.');
  console.log('req.body:', req.body);
  console.log('req.file:', req.file);
  const { className } = req.body;
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
  if (!className || !fileUrl) {
    console.error('Missing className or fileUrl in schedule upload.');
    return res.status(400).json({ msg: 'Class name and Excel file are required' });
  }
  try {
    let schedule = await Schedule.findOne({ className });
    if (schedule) {
      if (schedule.fileUrl) {
        const oldFilePath = path.join(__dirname, '..', schedule.fileUrl);
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Error deleting old schedule file:', err);
        });
      }
      schedule.fileUrl = fileUrl;
      schedule.uploadedAt = Date.now();
      await schedule.save();
    } else {
      schedule = await Schedule.create({ className, fileUrl });
    }
    res.status(200).json({ msg: `Schedule for ${className} updated successfully`, schedule });
  } catch (error) {
    console.error('Error during schedule upload/update:', error);
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting newly uploaded file on schedule update error:', err);
      });
    }
    res.status(500).json({ msg: error.message || 'Internal Server Error' });
  }
};

const deleteSchedule = async (req, res) => {
  const { className } = req.params;
  try {
    const schedule = await Schedule.findOne({ className });
    if (!schedule) {
      return res.status(404).json({ msg: 'Schedule not found for this class' });
    }
    if (schedule.fileUrl) {
      const filePath = path.join(__dirname, '..', schedule.fileUrl);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting schedule file:', err);
      });
    }
    await schedule.deleteOne();
    res.status(200).json({ msg: `Schedule for ${className} removed` });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ msg: error.message || 'Internal Server Error' });
  }
};

module.exports = {
  getSchedules,
  uploadSchedule,
  deleteSchedule,
};
