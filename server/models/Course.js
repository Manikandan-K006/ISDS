const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  domain: { type: String, default: 'Engineering' },
  type: { type: String, enum: ['mandatory', 'elective', 'co-curricular'], default: 'elective' },
  creditPoints: { type: Number, default: 0 },
  instructor: { type: String, default: '' },
  duration: { type: String, default: '' },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  thumbnail: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  assignedClasses: [{ type: String }],
  modules: [{
    title: String,
    lessons: [{ title: String, contentUrl: String, duration: Number }],
  }],
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
