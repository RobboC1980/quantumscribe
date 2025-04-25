import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getStoriesByEpicId(epicId: string) {
  return prisma.story.findMany({
    where: { epicId },
    orderBy: { position: 'asc' }
  });
}

export async function createStory(epicId: string, title: string, description: string) {
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

export async function updateStory(id: string, data: { title?: string; description?: string; status?: string }) {
  return prisma.story.update({
    where: { id },
    data,
  });
}

export async function deleteStory(id: string) {
  return prisma.story.delete({
    where: { id },
  });
}

export async function updateStoryPosition(storyId: string, newPosition: number) {
  return prisma.story.update({
    where: { id: storyId },
    data: { position: newPosition },
  });
} 