import React, { useState, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { useStore } from '@/store/useStore'
import { 
  Clock, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertCircle,
  User,
  MessageSquare
} from 'lucide-react'
import { formatTime } from '@/lib/utils'

interface TaskCardProps {
  task: Task
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { startTimer, stopTimer, currentProject } = useStore()
  const [currentTime, setCurrentTime] = useState(0)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

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

  const module = currentProject?.modules.find(m => m.id === task.moduleId)
  const completedSubtasks = task.subtasks.filter(st => st.completed).length
  const totalSubtasks = task.subtasks.length
  const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'urgent': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-blue-600 bg-blue-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityIcon = () => {
    switch (task.priority) {
      case 'urgent':
      case 'high':
        return <AlertCircle className="h-3 w-3" />
      default:
        return null
    }
  }

  const handleTimerToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (task.isTimerRunning) {
      stopTimer(task.id)
    } else {
      startTimer(task.id)
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md ${
        isDragging ? 'opacity-50 rotate-3 scale-105' : ''
      } ${task.isTimerRunning ? 'ring-2 ring-primary animate-pulse' : ''}`}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-sm leading-tight flex-1 pr-2">
            {task.title}
          </h4>
          <div className="flex items-center space-x-1">
            {getPriorityIcon()}
            <Badge variant="outline" className={`text-xs ${getPriorityColor()}`}>
              {task.priority}
            </Badge>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-gray-600 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Module */}
        {module && (
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: module.color }}
            />
            <span className="text-xs text-gray-500 truncate">{module.title}</span>
          </div>
        )}

        {/* Subtasks Progress */}
        {totalSubtasks > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Subtasks</span>
              <span className="text-xs text-gray-600">{completedSubtasks}/{totalSubtasks}</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}

        {/* Timer */}
        <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
          <div className="flex items-center space-x-2">
            <Clock className="h-3 w-3 text-gray-500" />
            <span className="text-xs font-mono">{formatTime(currentTime)}</span>
          </div>
          <Button
            size="sm"
            variant={task.isTimerRunning ? "destructive" : "default"}
            onClick={handleTimerToggle}
            className="h-5 w-5 p-0"
          >
            {task.isTimerRunning ? (
              <Pause className="h-2 w-2" />
            ) : (
              <Play className="h-2 w-2" />
            )}
          </Button>
        </div>

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

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            {task.assignee && (
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">{task.assignee}</span>
              </div>
            )}
            {task.notes && (
              <MessageSquare className="h-3 w-3 text-gray-400" />
            )}
          </div>
          
          {task.status === 'done' && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}