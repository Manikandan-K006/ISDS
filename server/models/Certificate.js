const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  issuedAt: { type: Date, default: Date.now },
  grade: { type: String, default: 'A' },
  creditPoints: { type: Number, default: 0 },
  instructor: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
