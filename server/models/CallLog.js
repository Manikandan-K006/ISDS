const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentContact: { type: String, required: true },
  type: { type: String, enum: ['call', 'message', 'scheduled'], default: 'call' },
  notes: { type: String, default: '' },
  scheduledAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('CallLog', callLogSchema);
