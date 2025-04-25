import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export async function getStoriesByEpicId(epicId) {
    return prisma.story.findMany({
        where: { epicId },
        orderBy: { position: 'asc' }
    });
}
export async function create(epicId, title, position) {
    // Get the highest position in this epic if position not provided
    let newPosition = position;
    if (newPosition === undefined) {
        const maxPositionStory = await prisma.story.findFirst({
            where: { epicId },
            orderBy: { position: 'desc' }
        });
        newPosition = maxPositionStory ? maxPositionStory.position + 1 : 0;
    }
    return prisma.story.create({
        data: {
            title,
            epicId,
            position: newPosition
        }
    });
}
export async function updateStory(id, data) {
    return prisma.story.update({
        where: { id },
        data
    });
}
export async function remove(id) {
    return prisma.story.delete({
        where: { id }
    });
}
// Function used in routes/epics.ts to reorder stories
export async function reorder(storyId, newPosition, epicId) {
    // If epicId is provided, it means we're moving story to a different epic
    if (epicId) {
        return prisma.story.update({
            where: { id: storyId },
            data: {
                position: newPosition,
                epicId
            }
        });
    }
    // Otherwise just update the position
    return prisma.story.update({
        where: { id: storyId },
        data: { position: newPosition }
    });
}
