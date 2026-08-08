const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s+#.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function evaluateAnswer(answer, keywords) {
  const norm = normalize(answer);
  const list = asArray(keywords).map((k) => String(k).toLowerCase().trim()).filter(Boolean);
  if (!list.length) return { score: 0, hits: [], missing: [], coverage: 0 };

  const hits = list.filter((k) => norm.includes(k));
  const missing = list.filter((k) => !norm.includes(k));
  const coverage = Math.round((hits.length / list.length) * 100);

  let score = coverage;
  if (norm.length >= 30) score = Math.min(100, score + 10);
  if (norm.length >= 100) score = Math.min(100, score + 10);

  const feedback = [];
  if (hits.length) feedback.push(`Covered: ${hits.join(', ')}`);
  if (missing.length) feedback.push(`Consider mentioning: ${missing.join(', ')}`);
  if (norm.length < 30) feedback.push('Answer is brief — expand with explanation or example.');

  return { score, hits, missing, coverage, feedback };
}

function evaluateSession(answers) {
  const list = asArray(answers);
  if (!list.length) {
    return { score: 0, strengths: [], weakAreas: [], recommendations: [] };
  }
  const scores = list.map((a) => a.score || 0);
  const score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const strengths = list.filter((a) => (a.score || 0) >= 70).map((a) => a.question);
  const weakAreas = list.filter((a) => (a.score || 0) < 50).map((a) => a.question);
  const lowScores = list.filter((a) => (a.score || 0) < 60);
  const missingConcepts = new Set();
  lowScores.forEach((a) => {
    (a.missing || []).slice(0, 3).forEach((m) => missingConcepts.add(m));
  });
  return {
    score,
    strengths: strengths.slice(0, 5),
    weakAreas: weakAreas.slice(0, 5),
    recommendations: Array.from(missingConcepts).slice(0, 8),
  };
}

module.exports = { evaluateAnswer, evaluateSession };
