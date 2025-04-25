import { PrismaClient, EpicStatus } from '@prisma/client';
const db = new PrismaClient();

export const list = (projectId: string) =>
  db.epic.findMany({ where: { projectId }, include: { stories: { orderBy: { position: 'asc' } } } });

export const create = (projectId: string, title: string) =>
  db.epic.create({ data: { projectId, title } });

export const updateStatus = (id: string, status: EpicStatus) =>
  db.epic.update({ where: { id }, data: { status } });

export const remove = (id: string) => db.epic.delete({ where: { id } }); 