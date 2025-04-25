import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { post } from '../lib/api';
import { withQuery } from '../lib/query';

interface Epic { id: string; title: string; status: string; stories: Story[] }
interface Story { id: string; title: string; position: number }

function Kanban() {
  const { projectId = '' } = useParams();
  const qc = useQueryClient();

  const { data: epics = [] } = useQuery({
    queryKey: ['epics', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/epics`, hdr());
      return res.json();
    }
  });

  const reorder = useMutation({
    mutationFn: ({ id, pos, epicId }: any) =>
      post(`/stories/${id}/reorder`, { position: pos, epicId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['epics', projectId] })
  });

  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(ev: DragEndEvent) {
    const { active, over } = ev;
    if (!over || active.id === over.id) return;

    // derive new position
    const [eidFrom, sid] = (active.id as string).split('|');
    const [eidTo] = (over.id as string).split('|');
    const epicFrom = epics.find(e => e.id === eidFrom)!;
    const epicTo = epics.find(e => e.id === eidTo)!;

    const oldIdx = epicFrom.stories.findIndex(s => s.id === sid);
    const newIdx =
      epicTo.id === eidFrom
        ? epicTo.stories.findIndex(s => s.id === (over.id as string).split('|')[1])
        : epicTo.stories.length;

    reorder.mutate({ id: sid, pos: newIdx, epicId: epicTo.id });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', gap: 24, overflowX: 'auto' }}>
        {epics.map(epic => (
          <SortableContext
            key={epic.id}
            items={epic.stories.map(s => `${epic.id}|${s.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <Column epic={epic} />
          </SortableContext>
        ))}
      </div>
    </DndContext>
  );
}

function Column({ epic }: { epic: Epic }) {
  return (
    <div style={{ minWidth: 250, border: '1px solid #ddd', padding: 8 }}>
      <h3>{epic.title}</h3>
      {epic.stories.map(s => (
        <div key={s.id} id={`${epic.id}|${s.id}`} style={{ border: '1px solid #999', margin: 4, padding: 4 }}>
          {s.title}
        </div>
      ))}
    </div>
  );
}

function hdr() {
  return { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
}

export default withQuery(<Kanban />); 