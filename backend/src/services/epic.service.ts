import { PrismaClient, EpicStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------- Internal helpers ----------------

async function getMaxEpicOrder(projectId: string) {
  const maxOrderEpic = await prisma.epic.findFirst({
    where: { projectId },
    orderBy: { order: 'desc' } as const
  });
  return maxOrderEpic ? maxOrderEpic.order : -1;
}

// ---------------- Public API consumed by routes ----------------

// List epics (and their stories) for a given project
export async function list(projectId: string) {
  return prisma.epic.findMany({
    where: { projectId },
    include: {
      stories: {
        orderBy: { position: 'asc' } as const
      }
    },
    orderBy: { order: 'asc' } as const
  });
}

// Create a new epic at the end of the ordered list
export async function create(projectId: string, title: string) {
  const newOrder = (await getMaxEpicOrder(projectId)) + 1;
  return prisma.epic.create({
    data: {
      title,
      projectId,
      // Since userId is required, we need to set it, but in actual use
      // the auth middleware will ensure it's set correctly
      userId: '', // This will be overridden by middleware
      order: newOrder
    }
  });
}

// Update status of an epic (PLANNED | ACTIVE | DONE)
export async function updateStatus(id: string, status: EpicStatus) {
  return prisma.epic.update({
    where: { id },
    data: { status }
  });
}

// Delete an epic (and cascade delete its stories if Prisma schema configured to do so)
export async function remove(id: string) {
  return prisma.epic.delete({ where: { id } });
}

// ----- Additional helpers still used elsewhere -----

export async function updateOrder(epicId: string, newOrder: number) {
  return prisma.epic.update({
    where: { id: epicId },
    data: { order: newOrder } as const
  });
} 