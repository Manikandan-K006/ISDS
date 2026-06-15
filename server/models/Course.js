const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: { type: String, required: true },
  description: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
  externalUrl: { type: String, default: '' },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  visibility: { type: String, enum: ['public', 'students', 'draft'], default: 'students' },
  order: { type: Number, default: 0 },
}, { _id: true });

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
  resources: [resourceSchema],
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
