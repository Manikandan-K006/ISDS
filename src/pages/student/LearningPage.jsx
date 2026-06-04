import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp, FiPlay, FiCheckCircle, FiFileText, FiMessageSquare, FiBookOpen, FiDownload, FiAward, FiX } from 'react-icons/fi';
import { MOCK_COURSES } from '../../utils/constants';

const getYoutubeEmbedUrl = (url) => {
  if (!url) return null;
  const reg = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/;
  const match = url.match(reg);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const modules = {
  'c1': {
    title: 'Advanced Mathematics',
    chapters: [
      {
        title: 'Module 1: Algebra',
        lessons: [
          { title: 'Introduction to Algebra', videoUrl: 'https://youtu.be/NybHckSEQBI' },
          { title: 'Linear Equations', videoUrl: 'https://youtu.be/Ft2_QtXAnh8' },
          { title: 'Quadratic Equations', videoUrl: 'https://youtu.be/1F1LQh1_sNc' }
        ],
        completed: [true, true, true]
      },
      {
        title: 'Module 2: Calculus',
        lessons: [
          { title: 'Limits & Continuity', videoUrl: 'https://youtu.be/9I7TVGvnIDg' },
          { title: 'Derivatives', videoUrl: 'https://youtu.be/PIWAkMpGZTs' },
          { title: 'Integration', videoUrl: 'https://youtu.be/JWlKfQ3MBXU' }
        ],
        completed: [true, false, false]
      }
    ]
  },
  'c2': {
    title: 'Quantum Physics',
    chapters: [
      {
        title: 'Module 1: Basics',
        lessons: [
          { title: 'Introduction to Quantum', videoUrl: 'https://youtu.be/JzIYSr3k5_s' },
          { title: 'Wave-Particle Duality', videoUrl: 'https://youtu.be/Q_h4IoPJXZw' },
          { title: 'Schrodinger Equation', videoUrl: '' }
        ],
        completed: [true, true, false]
      },
      {
        title: 'Module 2: Quantum Mechanics',
        lessons: [
          { title: 'Quantum States', videoUrl: '' },
          { title: 'Operators & Observables', videoUrl: '' }
        ],
        completed: [false, false]
      }
    ]
  }
};

const LearningPage = () => {
  const { courseId } = useParams();
  const course = MOCK_COURSES.find(c => c._id === courseId);
  const moduleData = modules[courseId] || modules['c1'];
  const [currentLesson, setCurrentLesson] = useState({ chapterIdx: 0, lessonIdx: 0 });
  const [expandedChapters, setExpandedChapters] = useState([0]);
  const [activeTab, setActiveTab] = useState('notes');
  const [notes, setNotes] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});

  const { chapterIdx, lessonIdx } = currentLesson;
  const currentChapter = moduleData.chapters[chapterIdx];
  const currentLessonObj = currentChapter?.lessons[lessonIdx] || { title: 'No lesson selected' };
  const currentLessonTitle = typeof currentLessonObj === 'string' ? currentLessonObj : currentLessonObj.title;
  const videoUrl = getYoutubeEmbedUrl(currentLessonObj.videoUrl);

  const totalLessons = moduleData.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
  const completedLessons = moduleData.chapters.reduce((acc, ch) => acc + ch.completed.filter(Boolean).length, 0);
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const allComplete = progress === 100;

  const navigateLesson = (dir) => {
    let ci = chapterIdx, li = lessonIdx + dir;
    if (li < 0) { ci--; if (ci < 0) return; li = moduleData.chapters[ci].lessons.length - 1; }
    if (li >= moduleData.chapters[ci].lessons.length) { ci++; li = 0; if (ci >= moduleData.chapters.length) return; }
    setCurrentLesson({ chapterIdx: ci, lessonIdx: li });
  };

  const quizQuestions = [
    { id: 1, question: 'What is the derivative of x²?', options: ['x', '2x', 'x²', '2'], correct: 1 },
    { id: 2, question: 'What is ∫ sin(x) dx?', options: ['cos(x)', '-cos(x)', 'sin(x)', '-sin(x)'], correct: 1 },
    { id: 3, question: 'What is the limit of 1/x as x→∞?', options: ['∞', '1', '0', '-∞'], correct: 2 },
  ];

  const quizScore = quizQuestions.filter(q => quizAnswers[q.id] === q.correct).length;
  const quizPassed = quizScore >= Math.ceil(quizQuestions.length * 0.5);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
      <div className="lg:w-72 flex-shrink-0">
        <div className="glass rounded-xl p-4 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Curriculum</h2>
            <span className="text-xs text-slate-500">{completedLessons}/{totalLessons}</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full mb-4 overflow-hidden">
            <div className="h-full gradient-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="space-y-1">
            {moduleData.chapters.map((ch, ci) => (
              <div key={ci}>
                <button
                  onClick={() => setExpandedChapters(prev => prev.includes(ci) ? prev.filter(i => i !== ci) : [...prev, ci])}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-white/5 text-left"
                >
                  <span className="text-xs text-slate-300 font-medium">{ch.title}</span>
                  {expandedChapters.includes(ci) ? <FiChevronUp size={14} className="text-slate-500" /> : <FiChevronDown size={14} className="text-slate-500" />}
                </button>
                <AnimatePresence>
                  {expandedChapters.includes(ci) && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      {ch.lessons.map((lesson, li) => {
                        const lessonTitle = typeof lesson === 'string' ? lesson : lesson.title;
                        const isActive = ci === chapterIdx && li === lessonIdx;
                        const isDone = ch.completed[li];
                        return (
                          <button
                            key={li}
                            onClick={() => setCurrentLesson({ chapterIdx: ci, lessonIdx: li })}
                            className={`flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-xs transition-all ${
                              isActive ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {isDone ? <FiCheckCircle className="text-emerald-400" size={12} /> : <FiPlay size={12} />}
                            {lessonTitle}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="glass rounded-xl flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">{moduleData.title}</h2>
            <p className="text-sm text-slate-400">{currentLessonTitle}</p>
          </div>
          <div className="flex-1 bg-black/90">
            {videoUrl ? (
              <iframe
                src={videoUrl}
                title={currentLessonTitle}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                    <FiPlay className="text-indigo-400" size={36} />
                  </div>
                  <p className="text-slate-400">No video added for this lesson</p>
                  <p className="text-xs text-slate-600 mt-1">Add a YouTube link in the course settings</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between glass rounded-xl px-4 py-3">
          <button onClick={() => navigateLesson(-1)} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors">
            <FiChevronLeft size={16} /> Previous
          </button>
          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-500">Progress: {progress}%</div>
            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full gradient-accent rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <button onClick={() => navigateLesson(1)} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors">
            Next <FiChevronRight size={16} />
          </button>
        </div>

        {allComplete && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4 border border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-3">
              <FiAward className="text-emerald-400" size={24} />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-emerald-400">Course Complete!</h3>
                <p className="text-xs text-slate-400">Take the final quiz to earn your certificate and credit points.</p>
              </div>
              <button onClick={() => setShowQuiz(true)} className="px-4 py-2 rounded-lg gradient-accent text-white text-sm font-medium">
                Take Quiz
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="lg:w-80 flex-shrink-0">
        <div className="glass rounded-xl flex flex-col h-full">
          <div className="flex border-b border-white/10">
            {['notes', 'qa', 'resources', 'discussion'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === tab ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab === 'notes' ? 'Notes' : tab === 'qa' ? 'AI Q&A' : tab === 'resources' ? 'Files' : 'Discuss'}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'notes' && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-white">Your Notes</h3>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Take notes for this lesson..."
                  className="w-full h-40 bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none"
                />
                <p className="text-xs text-slate-500">Auto-saved</p>
              </div>
            )}
            {activeTab === 'qa' && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-white">Ask AI about this lesson</h3>
                <textarea placeholder="Type your question..." className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none" />
                <button className="px-4 py-2 rounded-lg gradient-accent text-white text-sm">Ask</button>
              </div>
            )}
            {activeTab === 'resources' && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-white">Resources</h3>
                {['Lecture Slides.pdf', 'Practice Problems.pdf', 'Reference Material.pdf'].map(r => (
                  <div key={r} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                    <FiFileText className="text-indigo-400" size={14} />
                    <span className="text-xs text-slate-300 flex-1">{r}</span>
                    <FiDownload className="text-slate-500" size={12} />
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'discussion' && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-white">Discussion</h3>
                <p className="text-xs text-slate-500">No discussion threads yet. Start a conversation!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showQuiz && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-lg glass-dark border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Final Quiz</h2>
                <button onClick={() => setShowQuiz(false)}><FiX className="text-slate-400" size={20} /></button>
              </div>
              <div className="space-y-4">
                {quizQuestions.map(q => (
                  <div key={q.id}>
                    <p className="text-sm text-white mb-2">{q.question}</p>
                    <div className="space-y-1">
                      {q.options.map((opt, oi) => (
                        <button key={oi} onClick={() => setQuizAnswers(prev => ({...prev, [q.id]: oi}))}
                          className={`block w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                            quizAnswers[q.id] === oi ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                          }`}
                        >{opt}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {Object.keys(quizAnswers).length === quizQuestions.length && (
                <div className={`mt-4 p-3 rounded-lg ${quizPassed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'} text-sm`}>
                  {quizPassed ? `Passed! Score: ${quizScore}/${quizQuestions.length}` : `Score: ${quizScore}/${quizQuestions.length}. Need 50% to pass.`}
                  {quizPassed && <p className="text-xs mt-1">Your certificate will be generated automatically.</p>}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearningPage;
