import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getStoriesByEpicId(epicId: string) {
  return prisma.story.findMany({
    where: { epicId },
    orderBy: { position: 'asc' } as const
  });
}

export async function create(epicId: string, title: string, position?: number) {
  // Get the highest position in this epic if position not provided
  let newPosition = position;
  
  if (newPosition === undefined) {
    const maxPositionStory = await prisma.story.findFirst({
      where: { epicId },
      orderBy: { position: 'desc' } as const
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

export async function updateStory(id: string, data: { title?: string; description?: string; status?: string }) {
  return prisma.story.update({
    where: { id },
    data
  });
}

export async function remove(id: string) {
  return prisma.story.delete({
    where: { id }
  });
}

// Function used in routes/epics.ts to reorder stories
export async function reorder(storyId: string, newPosition: number, epicId?: string) {
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
    data: { position: newPosition } as const
  });
} 