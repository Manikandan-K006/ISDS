const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
