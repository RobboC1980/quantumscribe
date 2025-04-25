import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// ---------------- Internal helpers ----------------
async function getMaxEpicOrder(projectId) {
    const maxOrderEpic = await prisma.epic.findFirst({
        where: { projectId },
        orderBy: { order: 'desc' }
    });
    return maxOrderEpic ? maxOrderEpic.order : -1;
}
// ---------------- Public API consumed by routes ----------------
// List epics (and their stories) for a given project
export async function list(projectId) {
    return prisma.epic.findMany({
        where: { projectId },
        include: {
            stories: {
                orderBy: { position: 'asc' }
            }
        },
        orderBy: { order: 'asc' }
    });
}
// Create a new epic at the end of the ordered list
export async function create(projectId, title) {
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
export async function updateStatus(id, status) {
    return prisma.epic.update({
        where: { id },
        data: { status }
    });
}
// Delete an epic (and cascade delete its stories if Prisma schema configured to do so)
export async function remove(id) {
    return prisma.epic.delete({ where: { id } });
}
// ----- Additional helpers still used elsewhere -----
export async function updateOrder(epicId, newOrder) {
    return prisma.epic.update({
        where: { id: epicId },
        data: { order: newOrder }
    });
}
