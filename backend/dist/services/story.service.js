import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export async function getStoriesByEpicId(epicId) {
    return prisma.story.findMany({
        where: { epicId },
        orderBy: { position: 'asc' }
    });
}
export async function createStory(epicId, title, description) {
    // Get the highest position in this epic
    const maxPositionStory = await prisma.story.findFirst({
        where: { epicId },
        orderBy: { position: 'desc' },
    });
    const newPosition = maxPositionStory ? maxPositionStory.position + 1 : 0;
    return prisma.story.create({
        data: {
            title,
            description,
            epicId,
            position: newPosition,
        },
    });
}
export async function updateStory(id, data) {
    return prisma.story.update({
        where: { id },
        data,
    });
}
export async function deleteStory(id) {
    return prisma.story.delete({
        where: { id },
    });
}
export async function updateStoryPosition(storyId, newPosition) {
    return prisma.story.update({
        where: { id: storyId },
        data: { position: newPosition },
    });
}
