function computeAttendanceStats(records) {
  const counted = records.filter((r) => r.status !== 'holiday');
  const total = counted.length;
  const present = counted.filter((r) => r.status === 'present' || r.status === 'late').length;
  const absent = counted.filter((r) => r.status === 'absent').length;
  const leave = counted.filter((r) => r.status === 'leave').length;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;
  return { total, present, absent, leave, rate };
}

function attendanceRisk({ total, present, target = 75, classesRemaining = 20 }) {
  if (total === 0) {
    return { status: 'SAFE', current: 0, target, classesRemaining, neededToReachTarget: 0, canMiss: classesRemaining };
  }
  const current = Math.round((present / total) * 100);
  const totalFuture = total + classesRemaining;
  const neededPresentTotal = Math.ceil((target / 100) * totalFuture);
  const neededToReachTarget = Math.max(0, neededPresentTotal - present);
  const canMiss = Math.max(0, totalFuture - neededPresentTotal);

  let status = 'SAFE';
  if (current < target) status = 'HIGH RISK';
  else if (current < target + 10) status = 'WARNING';

  return { status, current, target, classesRemaining, neededToReachTarget, canMiss };
}

module.exports = { computeAttendanceStats, attendanceRisk };
