import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// Fetch projects for a user
export function list(userId) {
    return prisma.project.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: 'desc' }
    });
}
// Create a project (assign same value to ownerId and userId for backward-compatibility)
export function create(userId, data) {
    return prisma.project.create({
        data: {
            ...data,
            ownerId: userId,
            userId
        }
    });
}
// Update a project (ensure user is owner)
export function update(id, userId, data) {
    return prisma.project.update({
        where: { id, ownerId: userId },
        data
    });
}
// Delete a project
export function remove(id, userId) {
    return prisma.project.delete({
        where: { id, ownerId: userId }
    });
}
export async function getUserProjects(userId) {
    return prisma.project.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: 'desc' }
    });
}
export async function getProjectById(id, userId) {
    return prisma.project.findFirst({
        where: { id, ownerId: userId },
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
export async function createProject(name, description, userId) {
    return prisma.project.create({
        data: {
            name,
            description,
            ownerId: userId,
            userId
        }
    });
}
export async function updateProject(id, data, userId) {
    return prisma.project.update({
        where: { id, ownerId: userId },
        data
    });
}
export async function deleteProject(id, userId) {
    return prisma.project.delete({
        where: { id, ownerId: userId }
    });
}
