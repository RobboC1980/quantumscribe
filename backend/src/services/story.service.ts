import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

export const create = (epicId: string, title: string, position: number) =>
  db.story.create({ data: { epicId, title, position } });

export const reorder = (id: string, position: number, newEpicId?: string) =>
  db.story.update({ where: { id }, data: { position, ...(newEpicId && { epicId: newEpicId }) } });

export const remove = (id: string) => db.story.delete({ where: { id } }); 