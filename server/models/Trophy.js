const mongoose = require('mongoose');

const trophySchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  badgeType: { type: String, enum: ['academic', 'attendance', 'achievement', 'sports', 'special'], default: 'academic' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '🏆' },
  earnedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Trophy', trophySchema);
