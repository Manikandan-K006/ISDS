const { test } = require('node:test');
const assert = require('node:assert');
const { parseStudentIds, canAccessStudent, canManageCourse } = require('../utils/access');

test('parseStudentIds handles arrays, JSON strings, and garbage', () => {
  assert.deepStrictEqual(parseStudentIds(['a', 'b']), ['a', 'b']);
  assert.deepStrictEqual(parseStudentIds('["a","b"]'), ['a', 'b']);
  assert.deepStrictEqual(parseStudentIds('not-json'), []);
  assert.deepStrictEqual(parseStudentIds(''), []);
  assert.deepStrictEqual(parseStudentIds(null), []);
});

test('canAccessStudent allows admin and teacher', async () => {
  const prisma = {};
  assert.strictEqual(await canAccessStudent(prisma, 'u1', 'admin', 's1'), true);
  assert.strictEqual(await canAccessStudent(prisma, 'u1', 'teacher', 's1'), true);
});

test('canAccessStudent allows students only on their own record', async () => {
  assert.strictEqual(await canAccessStudent({}, 'me', 'student', 'me'), true);
  assert.strictEqual(await canAccessStudent({}, 'me', 'student', 'other'), false);
});

test('canAccessStudent checks parent.studentIds', async () => {
  const prisma = {
    user: {
      findUnique: async ({ where }) => {
        if (where.id === 'parent1') return { studentIds: '["s1","s2"]' };
        return null;
      },
    },
  };
  assert.strictEqual(await canAccessStudent(prisma, 'parent1', 'parent', 's1'), true);
  assert.strictEqual(await canAccessStudent(prisma, 'parent1', 'parent', 's3'), false);
  assert.strictEqual(await canAccessStudent(prisma, 'nope', 'parent', 's1'), false);
});

test('canManageCourse allows admin, teacher only on own course', async () => {
  const prisma = {
    course: {
      findUnique: async ({ where }) => ({ id: where.id, instructorId: 'teacher1' }),
    },
  };
  assert.strictEqual(await canManageCourse(prisma, 'admin', 'admin', 'c1'), true);
  assert.strictEqual(await canManageCourse(prisma, 'teacher1', 'teacher', 'c1'), true);
  assert.strictEqual(await canManageCourse(prisma, 'teacher2', 'teacher', 'c1'), false);
  assert.strictEqual(await canManageCourse(prisma, 'student1', 'student', 'c1'), false);
  const missingCourse = {
    course: { findUnique: async () => null },
  };
  assert.strictEqual(await canManageCourse(missingCourse, 'teacher1', 'teacher', 'missing'), false);
});
