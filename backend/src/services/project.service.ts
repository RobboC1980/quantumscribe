import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export function list(ownerId: string) {
  return prisma.project.findMany({ where: { ownerId } });
}

export function create(ownerId: string, data: { name: string; description?: string }) {
  return prisma.project.create({ data: { ...data, ownerId } });
}

export function update(id: string, ownerId: string, data: { name?: string; description?: string }) {
  return prisma.project.update({ where: { id, ownerId }, data });
}

export function remove(id: string, ownerId: string) {
  return prisma.project.delete({ where: { id, ownerId } });
} 