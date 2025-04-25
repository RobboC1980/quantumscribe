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

export async function getUserProjects(userId: string) {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getProjectById(id: string, userId: string) {
  return prisma.project.findFirst({
    where: { id, userId },
    include: {
      epics: {
        include: {
          stories: {
            orderBy: { position: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      }
    }
  });
}

export async function createProject(name: string, description: string, userId: string) {
  return prisma.project.create({
    data: {
      name,
      description,
      userId
    }
  });
}

export async function updateProject(id: string, data: { name?: string; description?: string }, userId: string) {
  return prisma.project.update({
    where: { id, userId },
    data
  });
}

export async function deleteProject(id: string, userId: string) {
  return prisma.project.delete({
    where: { id, userId }
  });
} 