var Prisma = require('@prisma/client');
const { PrismaClient } = Prisma;

let global = {}

const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV === 'development') global.prisma = prisma

module.exports = prisma;