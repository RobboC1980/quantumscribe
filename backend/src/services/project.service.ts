import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Fetch projects for a user
export function list(userId: string) {
  return prisma.project.findMany({ 
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' } as const
  });
}

// Create a project (assign same value to ownerId and userId for backward-compatibility)
export function create(userId: string, data: { name: string; description?: string }) {
  return prisma.project.create({ 
    data: { 
      ...data, 
      ownerId: userId,
      userId 
    } as any
  });
}

// Update a project (ensure user is owner)
export function update(id: string, userId: string, data: { name?: string; description?: string }) {
  return prisma.project.update({ 
    where: { id, ownerId: userId },
    data 
  });
}

// Delete a project
export function remove(id: string, userId: string) {
  return prisma.project.delete({ 
    where: { id, ownerId: userId }
  });
}

export async function getUserProjects(userId: string) {
  return prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' } as const
  });
}

export async function getProjectById(id: string, userId: string) {
  return prisma.project.findFirst({
    where: { id, ownerId: userId },
    include: {
      epics: {
        include: {
          stories: {
            orderBy: { position: 'asc' } as const
          }
        },
        orderBy: { order: 'asc' } as any
      }
    }
  });
}

export async function createProject(name: string, description: string, userId: string) {
  return prisma.project.create({
    data: {
      name,
      description,
      ownerId: userId,
      userId
    } as any
  });
}

export async function updateProject(id: string, data: { name?: string; description?: string }, userId: string) {
  return prisma.project.update({
    where: { id, ownerId: userId },
    data
  });
}

export async function deleteProject(id: string, userId: string) {
  return prisma.project.delete({
    where: { id, ownerId: userId }
  });
} 