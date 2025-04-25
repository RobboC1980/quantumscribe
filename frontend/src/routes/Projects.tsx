import { useEffect, useState } from 'react';
import { post } from '../lib/api';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

interface Project { id: string; name: string; description?: string }

export default function Projects() {
  const [rows, setRows] = useState<Project[]>([]);
  const [draft, setDraft] = useState<{ name: string; description: string }>({ name: '', description: '' });
  const [show, setShow] = useState(false);

  useEffect(() => { refresh(); }, []);

  async function refresh() {
    const res = await fetch('/api/projects', { headers: auth() });
    setRows(await res.json());
  }

  async function save() {
    await post('/projects', draft);
    setShow(false);
    setDraft({ name: '', description: '' });
    refresh();
  }

  const cols: ColumnDef<Project>[] = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Description', accessorKey: 'description' },
    { header: 'Actions', cell: ({ row }) => <button onClick={() => del(row.original.id)}>🗑</button> }
  ];

  async function del(id: string) {
    await fetch(`/api/projects/${id}`, { method: 'DELETE', headers: auth() });
    refresh();
  }

  const table = useReactTable({ columns: cols, data: rows, getCoreRowModel: getCoreRowModel() });

  return (
    <main>
      <h1>Projects</h1>
      <button onClick={() => setShow(true)}>New Project</button>

      <table>
        <thead>{table.getHeaderGroups().map(hg => (
          <tr key={hg.id}>{hg.headers.map(h => <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>)}</tr>
        ))}</thead>
        <tbody>{table.getRowModel().rows.map(r => (
          <tr key={r.id}>{r.getVisibleCells().map(c => <td key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</td>)}</tr>
        ))}</tbody>
      </table>

      {show && (
        <div className="modal">
          <h2>Create Project</h2>
          <input placeholder="name" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} />
          <textarea placeholder="description" value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} />
          <button onClick={save}>Save</button>
          <button onClick={() => setShow(false)}>Cancel</button>
        </div>
      )}
    </main>
  );
}

function auth() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` };
} 