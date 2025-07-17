import React, { useState, useEffect } from 'react'
import { Handle, Position } from 'reactflow'
import { useStore } from '@/store/useStore'
import { Task } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Clock,
  CheckCircle,
  Plus,
  X
} from 'lucide-react'
import { formatTime } from '@/lib/utils'

interface TaskNodeProps {
  data: {
    task: Task
  }
}

export const TaskNode: React.FC<TaskNodeProps> = ({ data }) => {
  const { task } = data
  const { 
    updateTask, 
    deleteTask, 
    startTimer, 
    stopTimer,
    createSubtask,
    updateSubtask,
    deleteSubtask
  } = useStore()
  
  const [showEditTask, setShowEditTask] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [newSubtask, setNewSubtask] = useState('')
  const [editTask, setEditTask] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    tags: task.tags.join(', '),
    notes: task.notes,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
  })

  // Update timer display
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (task.isTimerRunning && task.timerStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - task.timerStartTime!) / 1000)
        setCurrentTime(task.timeSpent + elapsed)
      }, 1000)
    } else {
      setCurrentTime(task.timeSpent)
    }
    return () => clearInterval(interval)
  }, [task.isTimerRunning, task.timerStartTime, task.timeSpent])

  const completedSubtasks = task.subtasks.filter(st => st.completed).length
  const totalSubtasks = task.subtasks.length
  const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'urgent': return '#F44336'
      case 'high': return '#FF9800'
      case 'medium': return '#2196F3'
      case 'low': return '#4CAF50'
      default: return '#9E9E9E'
    }
  }

  const getStatusColor = () => {
    switch (task.status) {
      case 'done': return '#00C853'
      case 'in-progress': return '#FF9800'
      case 'testing': return '#9C27B0'
      case 'todo': return '#2196F3'
      case 'icebox': return '#9E9E9E'
      default: return '#9E9E9E'
    }
  }

  const handleUpdateTask = () => {
    updateTask(task.id, {
      ...editTask,
      tags: editTask.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      dueDate: editTask.dueDate ? new Date(editTask.dueDate) : undefined,
    })
    setShowEditTask(false)
  }

  const handleDeleteTask = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id)
    }
  }

  const handleTimerToggle = () => {
    if (task.isTimerRunning) {
      stopTimer(task.id)
    } else {
      startTimer(task.id)
    }
  }

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      createSubtask(task.id, {
        title: newSubtask,
        completed: false,
      })
      setNewSubtask('')
    }
  }

  const handleToggleSubtask = (subtaskId: string, completed: boolean) => {
    updateSubtask(task.id, subtaskId, { completed })
  }

  return (
    <>
      <div className="relative">
        <Handle type="target" position={Position.Top} className="w-3 h-3" />
        
        <Card className="w-72 shadow-md hover:shadow-lg transition-all duration-200 border-l-4" 
              style={{ borderLeftColor: getStatusColor() }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getPriorityColor() }}
                />
                <CardTitle className="text-sm font-semibold truncate flex-1">
                  {task.title}
                </CardTitle>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowEditTask(true)}
                  className="h-6 w-6 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDeleteTask}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mt-2">
              <Badge 
                variant="outline" 
                className="text-xs"
                style={{ 
                  color: getStatusColor(),
                  borderColor: getStatusColor()
                }}
              >
                {task.status}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {task.priority}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 space-y-3">
            {task.description && (
              <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
            )}
            
            {/* Timer */}
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-mono">{formatTime(currentTime)}</span>
              </div>
              <Button
                size="sm"
                variant={task.isTimerRunning ? "destructive" : "default"}
                onClick={handleTimerToggle}
                className="h-6 px-2"
              >
                {task.isTimerRunning ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
              </Button>
            </div>
            
            {/* Subtasks */}
            {totalSubtasks > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Subtasks</span>
                  <span className="text-xs font-medium">{completedSubtasks}/{totalSubtasks}</span>
                </div>
                <Progress value={progress} className="h-1" />
                
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {task.subtasks.slice(0, 3).map((subtask) => (
                    <div key={subtask.id} className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleSubtask(subtask.id, !subtask.completed)}
                        className={`w-3 h-3 rounded border flex-shrink-0 ${
                          subtask.completed 
                            ? 'bg-primary border-primary' 
                            : 'border-gray-300'
                        }`}
                      >
                        {subtask.completed && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </button>
                      <span className={`text-xs flex-1 truncate ${
                        subtask.completed ? 'line-through text-gray-500' : ''
                      }`}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                  {task.subtasks.length > 3 && (
                    <span className="text-xs text-gray-400">+{task.subtasks.length - 3} more</span>
                  )}
                </div>
              </div>
            )}
            
            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {task.tags.length > 3 && (
                  <span className="text-xs text-gray-400">+{task.tags.length - 3}</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
      </div>

      {/* Edit Task Dialog */}
      <Dialog open={showEditTask} onOpenChange={setShowEditTask}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogClose onClick={() => setShowEditTask(false)} />
          </DialogHeader>
          
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium mb-2">Task Title</label>
              <Input
                placeholder="Enter task title..."
                value={editTask.title}
                onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                placeholder="Describe this task..."
                value={editTask.description}
                onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={editTask.priority}
                  onChange={(e) => setEditTask({ ...editTask, priority: e.target.value as any })}
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
                  value={editTask.status}
                  onChange={(e) => setEditTask({ ...editTask, status: e.target.value as any })}
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
                  value={editTask.dueDate}
                  onChange={e => setEditTask({ ...editTask, dueDate: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
              <Input
                placeholder="tag1, tag2, tag3..."
                value={editTask.tags}
                onChange={(e) => setEditTask({ ...editTask, tags: e.target.value })}
              />
            </div>
            
            {/* Subtasks Management */}
            <div>
              <label className="block text-sm font-medium mb-2">Subtasks</label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add new subtask..."
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                  />
                  <Button onClick={handleAddSubtask} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <button
                        onClick={() => handleToggleSubtask(subtask.id, !subtask.completed)}
                        className={`w-4 h-4 rounded border flex-shrink-0 ${
                          subtask.completed 
                            ? 'bg-primary border-primary' 
                            : 'border-gray-300'
                        }`}
                      >
                        {subtask.completed && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </button>
                      <span className={`flex-1 text-sm ${
                        subtask.completed ? 'line-through text-gray-500' : ''
                      }`}>
                        {subtask.title}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteSubtask(task.id, subtask.id)}
                        className="h-6 w-6 p-0 text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <Textarea
                placeholder="Additional notes..."
                value={editTask.notes}
                onChange={(e) => setEditTask({ ...editTask, notes: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowEditTask(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateTask}>
                Update Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}