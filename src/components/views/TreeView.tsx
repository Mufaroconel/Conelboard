import React, { useCallback, useMemo, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useStore } from '@/store/useStore'
import { ModuleNode } from '@/components/nodes/ModuleNode'
import { TaskNode } from '@/components/nodes/TaskNode'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Plus, Zap } from 'lucide-react'
import dagre from 'dagre';

const nodeTypes = {
  module: ModuleNode,
  task: TaskNode,
}

export const TreeView: React.FC = () => {
  const { currentProject, createModule, createTask } = useStore()
  const [showCreateModule, setShowCreateModule] = useState(false)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [selectedModuleId, setSelectedModuleId] = useState<string>('')
  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    color: '#00C853',
  })
  // Fix status for new tasks to use a valid TaskStatus
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'icebox' as const,
    priority: 'medium' as const,
    tags: [] as string[],
    subtasks: [] as any[],
    notes: '',
  })

  // --- FIX: Move hooks to top level ---
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // Add state for manual override
  const [manualLayout, setManualLayout] = useState(false);

  // --- Update nodes/edges when currentProject changes ---
  React.useEffect(() => {
    if (!currentProject) {
      setNodes([])
      setEdges([])
      return
    }
    const initialNodes: Node[] = []
    const initialEdges: Edge[] = []

    // Create project root node
    initialNodes.push({
      id: currentProject.id,
      type: 'default',
      position: { x: 400, y: 50 },
      data: {
        label: (
          <div className="bg-primary text-white p-4 rounded-lg shadow-lg border-2 border-primary-600 min-w-[200px]">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="h-5 w-5" />
              <h3 className="font-bold text-lg">{currentProject.title}</h3>
            </div>
            <p className="text-primary-100 text-sm">{currentProject.description}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-primary-200">
                {currentProject.modules.length} modules
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowCreateModule(true)}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Module
              </Button>
            </div>
          </div>
        ),
      },
      draggable: false,
    })

    // Create module nodes
    currentProject.modules.forEach((module, moduleIndex) => {
      const moduleNode: Node = {
        id: module.id,
        type: 'module',
        position: module.position || { 
          x: 200 + (moduleIndex % 3) * 300, 
          y: 200 + Math.floor(moduleIndex / 3) * 250 
        },
        data: { module },
        draggable: true,
      }
      initialNodes.push(moduleNode)

      // Connect project to module
      initialEdges.push({
        id: `${currentProject.id}-${module.id}`,
        source: currentProject.id,
        target: module.id,
        type: 'smoothstep',
        style: { stroke: '#00C853', strokeWidth: 2 },
        animated: true,
      })

      // Create task nodes
      module.tasks.forEach((task, taskIndex) => {
        const taskNode: Node = {
          id: task.id,
          type: 'task',
          position: {
            x: moduleNode.position.x + (taskIndex % 2) * 200 - 100,
            y: moduleNode.position.y + 150 + Math.floor(taskIndex / 2) * 120,
          },
          data: { task },
          draggable: true,
        }
        initialNodes.push(taskNode)

        // Connect module to task
        initialEdges.push({
          id: `${module.id}-${task.id}`,
          source: module.id,
          target: task.id,
          type: 'smoothstep',
          style: { 
            stroke: (task.status === 'complete') ? '#4CAF50' : '#94A3B8', 
            strokeWidth: 2 
          },
          animated: task.status === 'in-progress',
        })
      })
    })
    // After building nodes/edges, run dagre layout
    let layoutedNodes = getDagreLayoutedNodes(initialNodes, initialEdges, 'TB');
    setNodes(layoutedNodes)
    setEdges(initialEdges)
  }, [currentProject, setNodes, setEdges, manualLayout])

  // Helper: run dagre layout
  function getDagreLayoutedNodes(nodes: Node[], edges: Edge[], direction: 'TB' | 'LR' = 'TB') {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: direction });
    nodes.forEach((node) => {
      // Use a default size or node.data.size if available
      g.setNode(node.id, { width: 220, height: 80 });
    });
    edges.forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });
    dagre.layout(g);
    return nodes.map((node) => {
      const pos = g.node(node.id);
      // Only keep manual position if .position.manual === true
      if (node.position && (node.position as any).manual) {
        return node;
      }
      return {
        ...node,
        position: { x: pos.x - 110, y: pos.y - 40 },
        data: {
          ...node.data,
          manual: false,
        },
      };
    });
  }

  // On node drag, set manual position
  const onNodeDragStop = useCallback((event: React.MouseEvent | React.TouchEvent, node: Node) => {
    setNodes((nds) => nds.map((n) =>
      n.id === node.id
        ? { ...n, position: { ...node.position, manual: true }, data: { ...n.data, manual: true } }
        : n
    ));
    setManualLayout(true);
  }, [setNodes]);

  const handleCreateModule = () => {
    if (currentProject && newModule.title.trim()) {
      createModule(currentProject.id, {
        ...newModule,
        projectId: currentProject.id,
        position: { x: Math.random() * 400 + 200, y: Math.random() * 200 + 300 },
      })
      setNewModule({ title: '', description: '', color: '#00C853' })
      setShowCreateModule(false)
    }
  }

  const handleCreateTask = () => {
    if (selectedModuleId && newTask.title.trim()) {
      createTask(selectedModuleId, {
        ...newTask,
        moduleId: selectedModuleId,
        status: newTask.status as any, // already a valid TaskStatus
      })
      setNewTask({
        title: '',
        description: '',
        status: 'icebox',
        priority: 'medium',
        tags: [],
        subtasks: [],
        notes: '',
      })
      setShowCreateTask(false)
      setSelectedModuleId('')
    }
  }

  if (!currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Project Selected</h3>
          <p className="text-gray-600 mb-4">Create or select a project to start building your modular structure</p>
          <Button onClick={() => setShowCreateModule(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Project
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 bg-gray-50" style={{ height: '100%' }}>
        <ReactFlow style={{ width: '100%', height: '100%' }}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={() => {}}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-50"
          onNodeDragStop={onNodeDragStop}
        >
          <Background color="#e5e7eb" gap={20} />
          <Controls className="bg-white border border-gray-200 rounded-lg shadow-sm" />
          <MiniMap 
            className="bg-white border border-gray-200 rounded-lg shadow-sm"
            nodeColor="#00C853"
            maskColor="rgba(0, 0, 0, 0.1)"
          />
          <Button onClick={() => {
            setNodes(nds => nds.map(n => ({ ...n, position: { x: 0, y: 0 }, data: { ...n.data, manual: false } })));
            setManualLayout(false);
          }} variant="outline" className="ml-2">Reset Layout</Button>
        </ReactFlow>
      </div>

      {/* Create Module Dialog */}
      <Dialog open={showCreateModule} onOpenChange={setShowCreateModule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Module</DialogTitle>
            <DialogClose onClick={() => setShowCreateModule(false)} />
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Module Title</label>
              <Input
                placeholder="Enter module title..."
                value={newModule.title}
                onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                placeholder="Describe this module..."
                value={newModule.description}
                onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <div className="flex space-x-2">
                {['#00C853', '#2196F3', '#FF9800', '#9C27B0', '#F44336'].map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      newModule.color === color ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewModule({ ...newModule, color })}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateModule(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateModule}>
                Create Module
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogClose onClick={() => setShowCreateTask(false)} />
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Task Title</label>
              <Input
                placeholder="Enter task title..."
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                placeholder="Describe this task..."
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateTask(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateTask}>
                Create Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}