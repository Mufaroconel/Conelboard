import React, { useRef, useEffect, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap, Node, Edge, addEdge, Connection, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import '../../index.css';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { CheckCircle, Edit2, ArrowUp, ArrowDown, Trash2, Pencil } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../ui/Dialog';
import { Task, TaskStatus, Priority } from '../../types';
import { useStore } from '@/store/useStore';
import { Handle, Position } from 'reactflow';
import { Textarea } from '../ui/Textarea';
import { TaskCard } from '../kanban/TaskCard';

const subtaskStatuses: TaskStatus[] = ['icebox', 'emergency', 'in-progress', 'testing', 'complete'];

const statusColors = {
  'icebox': '#94A3B8',
  'emergency': '#F44336',
  'in-progress': '#F59E0B',
  'testing': '#8B5CF6',
  'complete': '#00C853'
};

const statusTitles = {
  'icebox': 'Ice box',
  'emergency': 'Emergency',
  'in-progress': 'In progress',
  'testing': 'Testing',
  'complete': 'Complete'
};

// --- KanbanNode and nodeTypes moved outside the component ---
const KanbanNode = ({ id, data, editingNodeId, editingNodeLabel, setEditingNodeId, setEditingNodeLabel, handleSaveNodeLabel, handleNodeDoubleClick }: any) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="p-4 min-w-[180px] text-center shadow-md bg-white rounded relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Connection handles (top and bottom) */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full"
        style={{ top: -10 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full"
        style={{ bottom: -10 }}
      />
      {editingNodeId === id ? (
        <div className="flex gap-2 items-center">
          <Input
            value={editingNodeLabel}
            onChange={e => setEditingNodeLabel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSaveNodeLabel(); }}
            autoFocus
            className="flex-1"
          />
          <Button size="sm" onClick={handleSaveNodeLabel} disabled={!editingNodeLabel.trim()}>
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditingNodeId(null)}>
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <span
            className="font-semibold text-lg cursor-pointer"
            onDoubleClick={() => handleNodeDoubleClick(null, { id, data, position: { x: 0, y: 0 } })}
          >
            {data.label}
          </span>
          {(hovered || !data.label) && (
            <button
              className="ml-2 p-1 rounded hover:bg-gray-100"
              title="Rename node"
              onClick={() => setEditingNodeId(id)}
            >
              <Pencil className="w-4 h-4 text-gray-400 hover:text-primary" />
            </button>
          )}
        </div>
      )}
      {/* Tooltip/help for connecting nodes visually */}
      {hovered && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-gray-800 text-white text-xs rounded px-2 py-1 shadow z-10 pointer-events-none">
          Drag from the blue dot to connect nodes
        </div>
      )}
    </div>
  );
};

// Memoize nodeTypes so it's not recreated on every render
const nodeTypes = {
  default: KanbanNode,
};

const defaultTask = (overrides: Partial<Task> = {}): Task => ({
  id: `${Date.now()}`,
  title: '',
  description: '',
  status: 'icebox',
  priority: 'medium',
  tags: [],
  subtasks: [],
  timeSpent: 0,
  isTimerRunning: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  moduleId: '',
  assignee: '',
  notes: '',
  ...overrides,
});

// Draggable subtask card component
const DraggableSubtaskCard = ({ subtask, children }: { subtask: Task, children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useDraggable({ id: subtask.id });
  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
      {children}
    </div>
  );
};

// Droppable Kanban column component
const DroppableKanbanColumn = ({ status, children }: { status: TaskStatus, children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`w-72 min-w-[18rem] bg-gray-50 rounded p-2 border flex-shrink-0 transition-colors ${isOver ? 'bg-blue-50 border-blue-400' : ''}`}
    >
      {children}
    </div>
  );
};

const FlowchartView: React.FC = () => {
  const { currentProject, setProjectFlowchart, createProjectFlowchart, setCurrentFlowchartId, currentFlowchartId, syncFlowchartSubtasksToMainKanban, updateFlowchartSubtaskStatus } = useStore();

  const flowcharts = currentProject?.flowcharts || [];
  const selectedFlowchart = flowcharts.find(fc => fc.id === currentFlowchartId) || flowcharts[0];

  // --- Node editing state ---
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingNodeLabel, setEditingNodeLabel] = useState('');

  // --- Subtask state ---
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');
  // Add state for editing all subtask fields
  const [editingSubtaskDescription, setEditingSubtaskDescription] = useState('');
  const [editingSubtaskStatus, setEditingSubtaskStatus] = useState<TaskStatus>('icebox');
  const [editingSubtaskPriority, setEditingSubtaskPriority] = useState<Priority>('medium');
  const [editingSubtaskTags, setEditingSubtaskTags] = useState<string>('');
  const [editingSubtaskAssignee, setEditingSubtaskAssignee] = useState('');
  const [editingSubtaskDueDate, setEditingSubtaskDueDate] = useState<string>('');
  const [editingSubtaskNotes, setEditingSubtaskNotes] = useState('');

  // --- DnD sensors ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // --- Nodes/edges state, only initialized once per flowchart ---
  const [nodes, setNodes, onNodesChange] = useNodesState(selectedFlowchart?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(selectedFlowchart?.edges || []);

  // --- Infinite loop fix: only set local state when flowchart id changes ---
  const lastLoadedFlowchartId = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (selectedFlowchart?.id !== lastLoadedFlowchartId.current) {
      setNodes(selectedFlowchart?.nodes || []);
      setEdges(selectedFlowchart?.edges || []);
      lastLoadedFlowchartId.current = selectedFlowchart?.id;
    }
    // eslint-disable-next-line
  }, [selectedFlowchart?.id]);

  // --- Infinite loop fix: only update store if not just loaded ---
  const prevNodes = useRef(nodes);
  const prevEdges = useRef(edges);
  useEffect(() => {
    if (
      currentProject &&
      selectedFlowchart &&
      lastLoadedFlowchartId.current === selectedFlowchart.id &&
      (prevNodes.current !== nodes || prevEdges.current !== edges)
    ) {
      setProjectFlowchart(currentProject.id, selectedFlowchart.id, nodes, edges);
      prevNodes.current = nodes;
      prevEdges.current = edges;
    }
    // eslint-disable-next-line
  }, [nodes, edges]);

  // --- Node label editing logic ---
  const handleNodeDoubleClick = (_: any, node: Node) => {
    setEditingNodeId(node.id);
    setEditingNodeLabel(node.data.label || '');
  };
  const handleSaveNodeLabel = () => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === editingNodeId ? { ...n, data: { ...n.data, label: editingNodeLabel } } : n
      )
    );
    setEditingNodeId(null);
    setEditingNodeLabel('');
  };

  // --- Subtask logic (two-way sync with Kanban) ---
  // Helper to get latest task by id from project modules
  const getLatestTaskById = (taskId: string): Task | undefined => {
    if (!currentProject) return undefined;
    for (const module of currentProject.modules) {
      const found = module.tasks.find(t => t.id === taskId);
      if (found) return found;
    }
    return undefined;
  };

  // When rendering nodeSubtasks, always use the latest from Kanban if available
  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode.id) : undefined;
  const nodeSubtasksRaw = selectedNodeData?.data?.subtasks || [];
  const nodeSubtasks = nodeSubtasksRaw.map((st: Task) => getLatestTaskById(st.id) || st);

  const handleAddSubtask = () => {
    if (!selectedNode || !newSubtask.trim()) return;
    const newTask = defaultTask({
      title: newSubtask,
      status: 'icebox',
      moduleId: 'flowchart-tasks',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setNodes(nds => nds.map(n =>
      n.id === selectedNode.id
        ? { ...n, data: { ...n.data, subtasks: [...(n.data.subtasks || []), newTask] } }
        : n
    ));
    setNewSubtask('');
    // Sync to main Kanban
    if (currentProject && currentFlowchartId) {
      const updatedSubtasks = [...(selectedNode.data.subtasks || []), newTask];
      syncFlowchartSubtasksToMainKanban(currentProject.id, currentFlowchartId, selectedNode.id, updatedSubtasks);
    }
  };

  const handleEditSubtask = (subtaskId: string, title: string) => {
    setEditingSubtaskId(subtaskId);
    const subtask = nodeSubtasks.find((s: Task) => s.id === subtaskId);
    setEditingSubtaskTitle(title);
    setEditingSubtaskDescription(subtask?.description || '');
    setEditingSubtaskStatus(subtask?.status || 'icebox');
    setEditingSubtaskPriority(subtask?.priority || 'medium');
    setEditingSubtaskTags((subtask?.tags || []).join(','));
    setEditingSubtaskAssignee(subtask?.assignee || '');
    setEditingSubtaskDueDate(subtask?.dueDate ? new Date(subtask.dueDate).toISOString().slice(0, 10) : '');
    setEditingSubtaskNotes(subtask?.notes || '');
  };

  const handleSaveEditSubtask = () => {
    if (!selectedNode || !editingSubtaskTitle.trim()) return;
    setNodes(nds => nds.map(n =>
      n.id === selectedNode.id
        ? {
            ...n,
            data: {
              ...n.data,
              subtasks: (n.data.subtasks || []).map((s: Task) =>
                s.id === editingSubtaskId
                  ? {
                      ...s,
                      title: editingSubtaskTitle,
                      description: editingSubtaskDescription,
                      status: editingSubtaskStatus,
                      priority: editingSubtaskPriority,
                      tags: editingSubtaskTags.split(',').map(t => t.trim()).filter(Boolean),
                      assignee: editingSubtaskAssignee,
                      dueDate: editingSubtaskDueDate ? new Date(editingSubtaskDueDate) : undefined,
                      notes: editingSubtaskNotes,
                      updatedAt: new Date(),
                    }
                  : s
              )
            }
          }
        : n
    ));
    setEditingSubtaskId(null);
    setEditingSubtaskTitle('');
    setEditingSubtaskDescription('');
    setEditingSubtaskStatus('icebox');
    setEditingSubtaskPriority('medium');
    setEditingSubtaskTags('');
    setEditingSubtaskAssignee('');
    setEditingSubtaskDueDate('');
    setEditingSubtaskNotes('');
    // Sync to main Kanban
    if (currentProject && currentFlowchartId) {
      const updatedSubtasks = (selectedNode.data.subtasks || []).map((s: Task) =>
        s.id === editingSubtaskId
          ? {
              ...s,
              title: editingSubtaskTitle,
              description: editingSubtaskDescription,
              status: editingSubtaskStatus,
              priority: editingSubtaskPriority,
              tags: editingSubtaskTags.split(',').map(t => t.trim()).filter(Boolean),
              assignee: editingSubtaskAssignee,
              dueDate: editingSubtaskDueDate ? new Date(editingSubtaskDueDate) : undefined,
              notes: editingSubtaskNotes,
              updatedAt: new Date(),
            }
          : s
      );
      syncFlowchartSubtasksToMainKanban(currentProject.id, currentFlowchartId, selectedNode.id, updatedSubtasks);
    }
  };

  const handleToggleSubtaskStatus = (subtaskId: string, status: TaskStatus) => {
    if (!selectedNode) return;
    
    setNodes(nds => nds.map(n =>
      n.id === selectedNode.id
        ? {
            ...n,
            data: {
              ...n.data,
              subtasks: (n.data.subtasks || []).map((s: Task) =>
                s.id === subtaskId ? { ...s, status } : s
              )
            }
          }
        : n
    ));
    
    // Update in store
    if (currentProject && currentFlowchartId) {
      updateFlowchartSubtaskStatus(currentProject.id, currentFlowchartId, selectedNode.id, subtaskId, status);
    }
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (!selectedNode) return;
    
    setNodes(nds => nds.map(n =>
      n.id === selectedNode.id
        ? {
            ...n,
            data: {
              ...n.data,
              subtasks: (n.data.subtasks || []).filter((s: Task) => s.id !== subtaskId)
            }
          }
        : n
    ));
    
    // Sync to main Kanban
    if (currentProject && currentFlowchartId) {
      const updatedSubtasks = (selectedNode.data.subtasks || []).filter((s: Task) => s.id !== subtaskId);
      syncFlowchartSubtasksToMainKanban(currentProject.id, currentFlowchartId, selectedNode.id, updatedSubtasks);
    }
  };

  const handleMoveSubtask = (subtaskId: string, direction: 'up' | 'down', status: TaskStatus) => {
    if (!selectedNode) return;
    
    setNodes(nds => nds.map(n => {
      if (n.id !== selectedNode.id) return n;
      let subtasks = (n.data.subtasks || []).slice();
      const currentIdx = subtasks.findIndex((st: any) => st.id === subtaskId);
      if (currentIdx === -1) return n;
      
      const newIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;
      if (newIdx < 0 || newIdx >= subtasks.length) return n;
      
      // Swap positions
      [subtasks[currentIdx], subtasks[newIdx]] = [subtasks[newIdx], subtasks[currentIdx]];
      return { ...n, data: { ...n.data, subtasks } };
    }));
  };

  const handleSubtaskDragEnd = (event: DragEndEvent, status: TaskStatus) => {
    const { active, over } = event;
    if (!over || !selectedNode) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    if (activeId === overId) return;
    
    setNodes(nds => nds.map(n => {
      if (n.id !== selectedNode.id) return n;
      let subtasks = (n.data.subtasks || []).slice();
      const activeIdx = subtasks.findIndex((st: Task) => st.id === activeId);
      const overIdx = subtasks.findIndex((st: Task) => st.id === overId);
      if (activeIdx === -1 || overIdx === -1) return n;
      
      // Move subtask
      const [removed] = subtasks.splice(activeIdx, 1);
      removed.status = status; // If dropped in a new column, update status
      subtasks.splice(overIdx, 0, removed);
      return { ...n, data: { ...n.data, subtasks } };
    }));
    
    // Update in store
    if (currentProject && currentFlowchartId) {
      const updatedSubtasks = (selectedNode.data.subtasks || []).map((s: Task) =>
        s.id === activeId ? { ...s, status } : s
      );
      syncFlowchartSubtasksToMainKanban(currentProject.id, currentFlowchartId, selectedNode.id, updatedSubtasks);
    }
  };

  const handleSubtaskStatusChange = (subtaskId: string, newStatus: TaskStatus) => {
    if (!selectedNode) return;

    // Update local node state immediately
    setNodes(nds => nds.map(n =>
      n.id === selectedNode.id
        ? {
            ...n,
            data: {
              ...n.data,
              subtasks: (n.data.subtasks || []).map((s: Task) =>
                s.id === subtaskId ? { ...s, status: newStatus } : s
              )
            }
          }
        : n
    ));

    // Also update in Kanban/store immediately
    if (currentProject && currentFlowchartId) {
      // Get the latest subtasks from the node after local update
      const updatedNode = nodes.find(n => n.id === selectedNode.id);
      const updatedSubtasks = updatedNode
        ? (updatedNode.data.subtasks || []).map((s: Task) =>
            s.id === subtaskId ? { ...s, status: newStatus } : s
          )
        : [];
      syncFlowchartSubtasksToMainKanban(currentProject.id, currentFlowchartId, selectedNode.id, updatedSubtasks);
    }
  };

  // --- Add node, connect, create/select flowchart logic (same as before) ---
  const handleAddNode = () => {
    const newNode: Node = {
      id: `${Date.now()}`,
      type: 'default',
      position: { x: 100 + Math.random() * 400, y: 100 + Math.random() * 200 },
      data: { label: 'New Node' },
    };
    setNodes((nds) => [...nds, newNode]);
  };
  const handleConnect = (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds));
  const handleCreateFlowchart = () => {
    if (currentProject) {
      const name = prompt('Enter a name for the new flowchart:') || `Flowchart ${flowcharts.length + 1}`;
      createProjectFlowchart(currentProject.id, name);
    }
  };
  const handleSelectFlowchart = (id: string) => {
    setCurrentFlowchartId(id);
  };

  return (
    <div style={{ width: '100%', height: '80vh' }}>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <Button onClick={handleAddNode} variant="default">Add Node</Button>
          <Button onClick={handleCreateFlowchart} variant="outline">New Flowchart for this Project</Button>
          {flowcharts.length > 0 && (
            <select
              className="ml-4 border rounded px-2 py-1"
              value={selectedFlowchart?.id}
              onChange={e => handleSelectFlowchart(e.target.value)}
            >
              {flowcharts.map(fc => (
                <option key={fc.id} value={fc.id}>{fc.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>
      <ReactFlow
        nodes={nodes.map(n => ({
          ...n,
          type: 'default',
          data: {
            ...n.data,
            editingNodeId,
            editingNodeLabel,
            setEditingNodeId,
            setEditingNodeLabel,
            handleSaveNodeLabel,
            handleNodeDoubleClick,
          },
        }))}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={(_e, node) => { setSelectedNode(node); setSidebarOpen(true); }}
        onNodeDoubleClick={handleNodeDoubleClick}
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
      <Dialog open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <DialogContent className="max-w-3xl w-full">
          <DialogHeader>
            <DialogTitle>
              Node Details
            </DialogTitle>
            <DialogClose onClick={() => setSidebarOpen(false)} />
          </DialogHeader>
          {/* Node renaming in sidebar */}
          {selectedNode && (
            <div className="mb-4 flex gap-2 items-center">
              <Input
                value={editingNodeId === selectedNode.id ? editingNodeLabel : (selectedNode.data.label || '')}
                onChange={e => {
                  setEditingNodeId(selectedNode.id);
                  setEditingNodeLabel(e.target.value);
                }}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveNodeLabel(); }}
                className="flex-1"
              />
              <Button size="sm" onClick={handleSaveNodeLabel} disabled={!editingNodeLabel.trim()}>
                Save
              </Button>
            </div>
          )}
          {/* Subtask Kanban for this node */}
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Add a subtask..."
              value={newSubtask}
              onChange={e => setNewSubtask(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddSubtask(); }}
            />
            <Button onClick={handleAddSubtask} disabled={!newSubtask.trim()}>
              Add
            </Button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={event => {
                const { active, over } = event;
                if (!over) return;
                const activeId = active.id as string;
                const overId = over.id as string;
                // If dropped over a column, update status
                if (activeId && subtaskStatuses.includes(overId as TaskStatus)) {
                  handleSubtaskStatusChange(activeId, overId as TaskStatus);
                }
              }}
            >
              {subtaskStatuses.map(status => (
                <DroppableKanbanColumn key={status} status={status}>
                  <div className="font-semibold mb-2 capitalize" style={{ color: statusColors[status] }}>
                    {statusTitles[status]}
                  </div>
                  <div className="space-y-2 min-h-[60px]">
                    {nodeSubtasks.filter((s: Task) => s.status === status).map((subtask: Task) => (
                      <DraggableSubtaskCard key={subtask.id} subtask={subtask}>
                        <div className="flex flex-col gap-1 p-2 mb-1 bg-white rounded shadow">
                          {editingSubtaskId === subtask.id ? (
                            <form
                              onSubmit={e => { e.preventDefault(); handleSaveEditSubtask(); }}
                              className="space-y-2"
                            >
                              <Input value={editingSubtaskTitle} onChange={e => setEditingSubtaskTitle(e.target.value)} placeholder="Title" />
                              <Textarea value={editingSubtaskDescription} onChange={e => setEditingSubtaskDescription(e.target.value)} placeholder="Description" />
                              <select value={editingSubtaskStatus} onChange={e => setEditingSubtaskStatus(e.target.value as TaskStatus)}>
                                {subtaskStatuses.map((s: TaskStatus) => <option key={s} value={s}>{statusTitles[s]}</option>)}
                              </select>
                              <select value={editingSubtaskPriority} onChange={e => setEditingSubtaskPriority(e.target.value as Priority)}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </select>
                              <Input value={editingSubtaskTags} onChange={e => setEditingSubtaskTags(e.target.value)} placeholder="Tags (comma separated)" />
                              <Input value={editingSubtaskAssignee} onChange={e => setEditingSubtaskAssignee(e.target.value)} placeholder="Assignee" />
                              <Input type="date" value={editingSubtaskDueDate} onChange={e => setEditingSubtaskDueDate(e.target.value)} placeholder="Due Date" />
                              <Textarea value={editingSubtaskNotes} onChange={e => setEditingSubtaskNotes(e.target.value)} placeholder="Notes" />
                              <div className="flex gap-2">
                                <Button type="submit" size="sm">Save</Button>
                                <Button type="button" size="sm" variant="outline" onClick={() => setEditingSubtaskId(null)}>Cancel</Button>
                              </div>
                            </form>
                          ) : (
                            <TaskCard task={subtask} />
                          )}
                        </div>
                      </DraggableSubtaskCard>
                    ))}
                  </div>
                </DroppableKanbanColumn>
              ))}
            </DndContext>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlowchartView; 