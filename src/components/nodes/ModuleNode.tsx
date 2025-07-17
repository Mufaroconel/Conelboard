import React, { useState } from 'react'
import { Handle, Position } from 'reactflow'
import { useStore } from '@/store/useStore'
import { Module } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Target,
  Clock,
  CheckCircle
} from 'lucide-react'

interface ModuleNodeProps {
  data: {
    module: Module
  }
}

export const ModuleNode: React.FC<ModuleNodeProps> = ({ data }) => {
  const { module } = data
  const { createTask, updateModule, deleteModule } = useStore()
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showEditModule, setShowEditModule] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'icebox' as const,
    priority: 'medium' as const,
    tags: [] as string[],
    subtasks: [] as any[],
    notes: '',
    dueDate: '',
  })
  const [editModule, setEditModule] = useState({
    title: module.title,
    description: module.description,
    color: module.color,
  })

  const completedTasks = module.tasks.filter(task => task.status === 'done').length
  const totalTasks = module.tasks.length
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const handleCreateTask = () => {
    if (newTask.title.trim()) {
      createTask(module.id, {
        ...newTask,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
      })
      setNewTask({
        title: '',
        description: '',
        status: 'icebox',
        priority: 'medium',
        tags: [],
        subtasks: [],
        notes: '',
        dueDate: '',
      })
      setShowCreateTask(false)
    }
  }

  const handleUpdateModule = () => {
    updateModule(module.id, editModule)
    setShowEditModule(false)
  }

  const handleDeleteModule = () => {
    if (confirm('Are you sure you want to delete this module and all its tasks?')) {
      deleteModule(module.id)
    }
  }

  return (
    <>
      <div className="relative">
        <Handle type="target" position={Position.Top} className="w-3 h-3" />
        
        <Card className="w-80 shadow-lg hover:shadow-xl transition-all duration-200 border-2 glow-green">
          <CardHeader 
            className="pb-3"
            style={{ backgroundColor: `${module.color}15`, borderBottom: `2px solid ${module.color}` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: module.color }}
                />
                <CardTitle className="text-lg font-bold">{module.title}</CardTitle>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowEditModule(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDeleteModule}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {module.description && (
              <p className="text-sm text-gray-600 mt-2">{module.description}</p>
            )}
          </CardHeader>
          
          <CardContent className="pt-4">
            <div className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="flex items-center justify-center">
                    <Target className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="text-lg font-bold text-gray-900">{totalTasks}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-center">
                    <Clock className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="text-lg font-bold text-orange-600">
                    {module.tasks.filter(t => t.status === 'in-progress').length}
                  </div>
                  <div className="text-xs text-gray-500">Active</div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-lg font-bold text-green-600">{completedTasks}</div>
                  <div className="text-xs text-gray-500">Done</div>
                </div>
              </div>
              
              {/* Recent Tasks */}
              {module.tasks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Recent Tasks</h4>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {module.tasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-center justify-between text-xs">
                        <span className="truncate flex-1">{task.title}</span>
                        <Badge 
                          variant="outline" 
                          className="ml-2 text-xs"
                          style={{ 
                            color: task.status === 'done' ? '#00C853' : '#666',
                            borderColor: task.status === 'done' ? '#00C853' : '#ccc'
                          }}
                        >
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex justify-between items-center pt-2 border-t">
                <Button
                  size="sm"
                  onClick={() => setShowCreateTask(true)}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
      </div>

      {/* Create Task Dialog */}
      <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task in {module.title}</DialogTitle>
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
            
            <div className="grid grid-cols-2 gap-4">
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
              
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value as any })}
                >
                  <option value="icebox">Ice box</option>
                  <option value="emergency">Emergency</option>
                  <option value="in-progress">In progress</option>
                  <option value="testing">Testing</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Due Date</label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newTask.dueDate}
                  onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
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

      {/* Edit Module Dialog */}
      <Dialog open={showEditModule} onOpenChange={setShowEditModule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
            <DialogClose onClick={() => setShowEditModule(false)} />
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Module Title</label>
              <Input
                placeholder="Enter module title..."
                value={editModule.title}
                onChange={(e) => setEditModule({ ...editModule, title: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                placeholder="Describe this module..."
                value={editModule.description}
                onChange={(e) => setEditModule({ ...editModule, description: e.target.value })}
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
                      editModule.color === color ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setEditModule({ ...editModule, color })}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowEditModule(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateModule}>
                Update Module
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}