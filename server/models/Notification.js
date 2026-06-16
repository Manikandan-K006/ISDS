const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['assignment_created', 'assignment_submitted', 'assignment_graded', 'course_enrolled', 'course_completed', 'certificate_generated', 'attendance_alert', 'new_message', 'info'], 
    default: 'info' 
  },
  isRead: { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
  link: { type: String, default: '' },
}, { timestamps: true });

notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
