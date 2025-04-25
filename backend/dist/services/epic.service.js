import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export async function getEpicsByProjectId(projectId) {
    return prisma.epic.findMany({
        where: { projectId },
        include: {
            stories: {
                orderBy: { order: 'asc' }
            }
        },
        orderBy: { order: 'asc' }
    });
}
export async function createEpic(projectId, title, userId) {
    // Get the highest order in this project
    const maxOrderEpic = await prisma.epic.findFirst({
        where: { projectId },
        orderBy: { order: 'desc' },
    });
    const newOrder = maxOrderEpic ? maxOrderEpic.order + 1 : 0;
    return prisma.epic.create({
        data: {
            title,
            projectId,
            userId,
            order: newOrder,
        },
    });
}
export async function updateEpic(id, title, userId) {
    return prisma.epic.update({
        where: { id, userId },
        data: { title },
    });
}
export async function deleteEpic(id, userId) {
    return prisma.epic.delete({
        where: { id, userId },
    });
}
export async function updateEpicOrder(epicId, newOrder, userId) {
    const epic = await prisma.epic.findUnique({
        where: { id: epicId },
    });
    if (!epic || epic.userId !== userId) {
        throw new Error('Epic not found or permission denied');
    }
    return prisma.epic.update({
        where: { id: epicId },
        data: { order: newOrder },
    });
}
