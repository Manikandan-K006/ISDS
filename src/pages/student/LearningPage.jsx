import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiPlay, FiCheckCircle, FiFileText, FiMessageSquare, FiBookOpen, FiDownload, FiAward, FiX, FiVideo, FiSend, FiMenu } from 'react-icons/fi';
import { useStudentData } from '../../hooks/useStudentData';
import { Card, Button, Input, Badge } from '../../components/ui';

const getYoutubeEmbedUrl = (url) => {
  if (!url) return null;
  const reg = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/;
  const match = url.match(reg);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : null;
};

const LearningPage = () => {
  const { courseId } = useParams();
  const { courses, loading, error } = useStudentData();
  const course = courses.find(c => c._id === courseId);
  const [currentLesson, setCurrentLesson] = useState({ chapterIdx: 0, lessonIdx: 0 });
  const [expandedChapters, setExpandedChapters] = useState([0]);
  const { chapterIdx, lessonIdx } = currentLesson;
  const notesKey = `isds_note_${courseId}_${chapterIdx}_${lessonIdx}`;
  const [notes, setNotes] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [activeTab, setActiveTab] = useState('notes');
  const [qaInput, setQaInput] = useState('');
  const [showRightPanel, setShowRightPanel] = useState(true);

  useEffect(() => {
    setNotes(localStorage.getItem(notesKey) || '');
  }, [notesKey]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <span className="ml-3 theme-text-muted">Loading...</span>
    </div>
  );

  if (error) return (
    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-400 text-sm">
      Failed to load data: {error}
    </div>
  );

  if (!course) return (
    <div className="flex items-center justify-center h-64">
      <p className="theme-text-muted">Course not found.</p>
    </div>
  );

  const hasModules = course?.modules?.length > 0 && course.modules[0]?.lessons;
  if (!hasModules) return (
    <div className="flex items-center justify-center h-64">
      <p className="theme-text-muted">No modules available for this course.</p>
    </div>
  );

  const moduleData = {
    title: course.title,
    chapters: course.modules.map(m => ({
      title: m.title,
      lessons: m.lessons || [],
      completed: (m.lessons || []).map(() => false)
    }))
  };

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

  const quizQuestions = course?.quizQuestions || [];
  const quizScore = quizQuestions.filter(q => quizAnswers[q.id] === q.correct).length;
  const quizPassed = quizScore >= Math.ceil(quizQuestions.length * 0.5);

  return (
    <>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-5.5rem)]">
      <div className="lg:w-72 shrink-0">
        <Card className="p-4 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold theme-text/90">Course Content</h2>
            <span className="text-xs theme-text-muted theme-subtle px-2 py-0.5 rounded-full">{completedLessons}/{totalLessons}</span>
          </div>
          <div className="w-full h-1 theme-hover rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-indigo-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="space-y-0.5">
            {moduleData.chapters.map((ch, ci) => {
              const isExpanded = expandedChapters.includes(ci);
              return (
                <div key={ci} className="rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedChapters(prev => prev.includes(ci) ? prev.filter(i => i !== ci) : [...prev, ci])}
                    className={`flex items-center justify-between w-full px-3 py-2.5 text-left transition-colors ${
                      isExpanded ? 'theme-subtle' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FiChevronDown size={14} className={`theme-text-muted shrink-0 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                      <span className="text-xs theme-text font-medium truncate">{ch.title}</span>
                    </div>
                    <span className="text-[10px] theme-text-muted shrink-0 ml-2">
                      {ch.completed.filter(Boolean).length}/{ch.lessons.length}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="pb-1">
                      {ch.lessons.map((lesson, li) => {
                        const lessonTitle = typeof lesson === 'string' ? lesson : lesson.title;
                        const lessonVideoUrl = typeof lesson === 'string' ? null : lesson.videoUrl;
                        const isActive = ci === chapterIdx && li === lessonIdx;
                        const isDone = ch.completed[li];
                        return (
                          <button
                            key={li}
                            onClick={() => setCurrentLesson({ chapterIdx: ci, lessonIdx: li })}
                            className={`flex items-center gap-2.5 w-full pl-7 pr-3 py-2 text-xs transition-all ${
                              isActive
                                ? 'text-indigo-300 bg-indigo-500/10'
                                : 'theme-text-muted hover:theme-text hover:theme-subtle'
                            }`}
                          >
                            {isDone ? (
                              <FiCheckCircle className="text-emerald-400 shrink-0" size={12} />
                            ) : lessonVideoUrl ? (
                              <FiVideo size={12} className="text-green-500/60 shrink-0" />
                            ) : (
                              <FiFileText size={12} className="theme-text-muted shrink-0" />
                            )}
                            <span className="truncate flex-1">{lessonTitle}</span>
                            {lessonVideoUrl && (
                              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-green-500/60" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <Card className="flex flex-col overflow-hidden p-0">
          <div className="relative bg-black/80 aspect-video flex items-center justify-center">
            {videoUrl ? (
              <iframe
                src={videoUrl}
                title={currentLessonTitle}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3">
                  <FiPlay className="text-indigo-400/60" size={28} />
                </div>
                <p className="theme-text-muted text-sm">No video content for this lesson</p>
                <p className="text-xs theme-text-muted mt-1">Add a YouTube link in course settings</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t theme-border">
            <h1 className="text-base font-semibold theme-text">{currentLessonTitle}</h1>
            <p className="text-xs theme-text-muted mt-0.5">{moduleData.title} &middot; {currentChapter?.title}</p>
          </div>
        </Card>

        <div className="flex items-center justify-between theme-card border theme-border rounded-2xl px-4 py-3">
          <Button variant="ghost" size="sm" icon={FiChevronLeft} onClick={() => navigateLesson(-1)}>
            Previous
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-xs theme-text-muted">{progress}% complete</span>
            <div className="w-20 h-1 theme-hover rounded-full overflow-hidden">
              <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <Button variant="ghost" size="sm" icon={FiMenu} onClick={() => setShowRightPanel(p => !p)} title="Toggle sidebar" />
          </div>
          <Button variant="ghost" size="sm" icon={FiChevronRight} onClick={() => navigateLesson(1)}>
            Next
          </Button>
        </div>

        <AnimatePresence>
          {allComplete && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <FiAward className="text-emerald-400" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-emerald-300">Course Complete!</h3>
                  <p className="text-xs theme-text-muted">Take the final quiz to earn your certificate.</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setShowQuiz(true)}>Take Quiz</Button> 
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {showRightPanel && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="lg:w-80 shrink-0">
          <Card className="flex flex-col h-full p-0">
            <div className="flex border-b theme-border px-1 pt-1">
              {[
                { key: 'notes', label: 'Notes', icon: FiFileText },
                { key: 'qa', label: 'AI Q&A', icon: FiMessageSquare },
                { key: 'resources', label: 'Files', icon: FiDownload },
                { key: 'discussion', label: 'Discuss', icon: FiBookOpen },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all rounded-t-lg ${
                    activeTab === key
                      ? 'text-indigo-300 bg-indigo-500/10 border-b-2 border-indigo-400'
                      : 'theme-text-muted hover:theme-text'
                  }`}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'notes' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium theme-text/90">Your Notes</h3>
                  <textarea
                    value={notes}
                    onChange={e => { setNotes(e.target.value); localStorage.setItem(notesKey, e.target.value); }}
                    placeholder="Take notes for this lesson..."
                    className="w-full h-36 theme-subtle border theme-border rounded-xl p-3 text-sm theme-text/80 placeholder-slate-600 focus:outline-none focus:theme-border-light focus:theme-hover transition-all resize-none"
                  />
                  <p className="text-xs theme-text-muted flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                    Auto-saved to this lesson
                  </p>
                </div>
              )}
              {activeTab === 'qa' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium theme-text/90">Ask AI Assistant</h3>
                  <p className="text-xs theme-text-muted">Get help understanding this lesson.</p>
                  <div className="relative">
                    <textarea
                      value={qaInput}
                      onChange={e => setQaInput(e.target.value)}
                      placeholder="Type your question..."
                      className="w-full h-24 theme-subtle border theme-border rounded-xl p-3 text-sm theme-text/80 placeholder-slate-600 focus:outline-none focus:theme-border-light focus:theme-hover transition-all resize-none pr-10"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={FiSend}
                      className="absolute bottom-2 right-2"
                      onClick={() => { if (qaInput.trim()) setQaInput(''); }}
                    />
                  </div>
                </div>
              )}
              {activeTab === 'resources' && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium theme-text/90 mb-3">Course Resources</h3>
                  {(course?.resources?.filter(r => r.visibility !== 'draft') || []).length > 0 ? (
                    <>
                      {[
                        { key: 'documents', label: 'Documents', types: ['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'XLS', 'XLSX', 'TXT'] },
                        { key: 'media', label: 'Media', types: ['Video', 'Audio', 'MP4', 'AVI', 'MOV', 'MKV', 'WEBM', 'MP3', 'WAV', 'AAC'] },
                        { key: 'links', label: 'Links', types: ['YouTube', 'GoogleDrive', 'OneDrive', 'GitHub', 'Website', 'ResearchPaper', 'Docs'] },
                        { key: 'other', label: 'Other', types: [] },
                      ].map(category => {
                        const items = (course?.resources || []).filter(r =>
                          r.visibility !== 'draft' && (category.types.length === 0 || category.types.includes(r.type))
                        );
                        if (items.length === 0) return null;
                        return (
                          <div key={category.key} className="mb-3">
                            <p className="text-[10px] uppercase tracking-wider theme-text-muted font-medium mb-1.5">{category.label}</p>
                            {items.map((r, ri) => {
                              const isExternal = r.externalUrl && !r.fileUrl;
                              const linkUrl = isExternal ? r.externalUrl : (r.fileUrl ? r.fileUrl : '#');
                              const isVideo = r.type === 'Video' || r.type === 'MP4' || r.type === 'WEBM';
                              const isAudio = r.type === 'Audio' || r.type === 'MP3' || r.type === 'WAV';
                              return (
                                <a
                                  key={ri}
                                  href={linkUrl}
                                  target={isExternal ? '_blank' : undefined}
                                  rel={isExternal ? 'noopener noreferrer' : undefined}
                                  className="flex items-center gap-2.5 p-2 rounded-xl hover:theme-subtle group transition-colors border border-transparent hover:theme-border"
                                >
                                  <div className="w-7 h-7 rounded-lg theme-subtle flex items-center justify-center shrink-0">
                                    {isVideo ? <FiPlay className="text-indigo-400/60" size={13} /> :
                                     isAudio ? <FiFileText className="text-rose-400/60" size={13} /> :
                                     isExternal ? <FiDownload className="text-emerald-400/60" size={13} /> :
                                     <FiFileText className="text-indigo-400/60" size={13} />}
                                  </div>
                                  <span className="text-xs theme-text-muted flex-1 group-hover:theme-text transition-colors truncate">{r.title}</span>
                                  <FiDownload className="theme-text-muted group-hover:theme-text shrink-0" size={11} />
                                </a>
                              );
                            })}
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <p className="text-xs theme-text-muted text-center py-6">No resources available for this course</p>
                  )}
                </div>
              )}
              {activeTab === 'discussion' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium theme-text/90">Discussion</h3>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-xl theme-subtle flex items-center justify-center mb-3">
                      <FiMessageSquare className="theme-text-muted" size={20} />
                    </div>
                    <p className="text-xs theme-text-muted">No discussion threads yet.</p>
                    <p className="text-xs theme-text-muted mt-1">Start a conversation with your classmates!</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

    </motion.div>

      <AnimatePresence>
        {showQuiz && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowQuiz(false)}>
            <div
              className="w-full max-w-lg theme-card border theme-border rounded-2xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold theme-text">Final Quiz</h2>
                  <p className="text-xs theme-text-muted mt-0.5">Answer all questions to complete the course</p>
                </div>
                <Button variant="ghost" size="sm" icon={FiX} onClick={() => setShowQuiz(false)} />
              </div>
              {quizQuestions.length > 0 ? (
                <div className="space-y-4">
                  {quizQuestions.map((q, qi) => (
                    <div key={q.id} className="theme-subtle rounded-xl p-4 border theme-border">
                      <p className="text-sm theme-text/90 mb-2.5 flex items-start gap-2">
                        <span className="text-indigo-400 text-xs font-medium mt-0.5">Q{qi + 1}.</span>
                        <span>{q.question}</span>
                      </p>
                      <div className="space-y-1.5 ml-5">
                        {q.options.map((opt, oi) => (
                          <button
                            key={oi}
                            onClick={() => setQuizAnswers(prev => ({...prev, [q.id]: oi}))}
                            className={`block w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                              quizAnswers[q.id] === oi
                                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                                : 'theme-subtle theme-text-muted hover:theme-text hover:theme-hover border border-transparent'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm theme-text-muted text-center py-8">Quiz feature coming soon</p>
              )}
              {Object.keys(quizAnswers).length === quizQuestions.length && (
                <div className={`mt-4 p-3 rounded-xl text-sm ${
                  quizPassed
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                }`}>
                  <div className="flex items-center gap-2">
                    {quizPassed && <FiAward size={16} />}
                    <span>
                      {quizPassed
                        ? `Passed! Score: ${quizScore}/${quizQuestions.length}`
                        : `Score: ${quizScore}/${quizQuestions.length}. Need 50% to pass.`
                      }
                    </span>
                  </div>
                  {quizPassed && <p className="text-xs mt-1.5 text-emerald-400/60">Your certificate will be generated automatically.</p>}
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LearningPage;
