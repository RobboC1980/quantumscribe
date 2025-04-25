import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export function list(ownerId) {
    return prisma.project.findMany({ where: { ownerId } });
}
export function create(ownerId, data) {
    return prisma.project.create({ data: { ...data, ownerId } });
}
export function update(id, ownerId, data) {
    return prisma.project.update({ where: { id, ownerId }, data });
}
export function remove(id, ownerId) {
    return prisma.project.delete({ where: { id, ownerId } });
}
export async function getUserProjects(userId) {
    return prisma.project.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
}
export async function getProjectById(id, userId) {
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
export async function createProject(name, description, userId) {
    return prisma.project.create({
        data: {
            name,
            description,
            userId
        }
    });
}
export async function updateProject(id, data, userId) {
    return prisma.project.update({
        where: { id, userId },
        data
    });
}
export async function deleteProject(id, userId) {
    return prisma.project.delete({
        where: { id, userId }
    });
}
