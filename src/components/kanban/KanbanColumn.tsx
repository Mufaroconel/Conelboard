import React, { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from './TaskCard'
import { Task, TaskStatus } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useStore } from '@/store/useStore'
import { Plus } from 'lucide-react'

interface KanbanColumnProps {
  id: TaskStatus
  title: string
  color: string
  tasks: Task[]
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  color,
  tasks,
}) => {
  const { currentProject, createTask } = useStore()
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    tags: [] as string[],
    subtasks: [] as any[],
    notes: '',
    moduleId: '',
  })

  const { setNodeRef } = useDroppable({
    id,
  })

  const handleCreateTask = () => {
    if (newTask.title.trim() && newTask.moduleId) {
      createTask(newTask.moduleId, {
        ...newTask,
        status: id,
      })
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        tags: [],
        subtasks: [],
        notes: '',
        moduleId: '',
      })
      setShowCreateTask(false)
    }
  }

  const getColumnStyle = () => {
    switch (id) {
      case 'icebox':
        return 'bg-gray-50 border-gray-200'
      case 'todo':
        return 'bg-blue-50 border-blue-200'
      case 'in-progress':
        return 'bg-orange-50 border-orange-200'
      case 'testing':
        return 'bg-purple-50 border-purple-200'
      case 'done':
        return 'bg-green-50 border-green-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <>
      <Card className={`w-80 flex-shrink-0 ${getColumnStyle()} border-2`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-sm">
                {tasks.length}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowCreateTask(true)}
                className="h-6 w-6 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div
            ref={setNodeRef}
            className="space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto"
          >
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </SortableContext>
            
            {tasks.length === 0 && (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                Drop tasks here or click + to add
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Task Dialog */}
      <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task in {title}</DialogTitle>
            <DialogClose onClick={() => setShowCreateTask(false)} />
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Module</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newTask.moduleId}
                onChange={(e) => setNewTask({ ...newTask, moduleId: e.target.value })}
              >
                <option value="">Select a module...</option>
                {currentProject?.modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.title}
                  </option>
                ))}
              </select>
            </div>
            
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
            
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
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