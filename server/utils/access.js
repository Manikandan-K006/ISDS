const parseStudentIds = (value) => {
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

const canManageCourse = async (prisma, userId, userRole, courseId) => {
  if (userRole === 'admin') return true;
  if (userRole !== 'teacher') return false;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });
  return !!course && course.instructorId === userId;
};

const canAccessStudent = async (prisma, userId, userRole, studentId) => {
  if (userRole === 'admin' || userRole === 'teacher') return true;
  if (userRole === 'student') return userId === studentId;
  if (userRole === 'parent') {
    const parent = await prisma.user.findUnique({
      where: { id: userId },
      select: { studentIds: true },
    });
    return !!parent && parseStudentIds(parent.studentIds).includes(studentId);
  }
  return false;
};

module.exports = { parseStudentIds, canAccessStudent, canManageCourse };
