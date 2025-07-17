import React, { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  Target,
  Zap
} from 'lucide-react'
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core'
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, startOfMonth, endOfMonth } from 'date-fns'
import { useState as useToastState } from 'react';

type ViewMode = 'week' | 'month'

// Draggable Task component
const DraggableTask = ({ task, children }: { task: any, children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id })
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {children}
    </div>
  )
}

// Droppable Day component
const DroppableDay = ({ day, children }: { day: Date, children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({ id: day.toISOString() })
  return (
    <div ref={setNodeRef} style={{ background: isOver ? '#e0f2fe' : undefined }}>
      {children}
    </div>
  )
}

// Simple toast component
const Toast = ({ message, show }: { message: string, show: boolean }) => (
  <div
    style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#333',
      color: '#fff',
      padding: '8px 24px',
      borderRadius: 8,
      opacity: show ? 1 : 0,
      transition: 'opacity 0.3s',
      zIndex: 1000,
    }}
  >
    {message}
  </div>
)

// Track which day is being hovered for drop highlight
const useDropHighlight = () => {
  const [highlightDay, setHighlightDay] = useToastState<string | null>(null);
  return { highlightDay, setHighlightDay };
};

export const TimelineView: React.FC = () => {
  const { currentProject, updateTask } = useStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [toast, setToast] = useToastState<{ show: boolean; message: string }>({ show: false, message: '' })
  const { highlightDay, setHighlightDay } = useDropHighlight();

  const timelineData = useMemo(() => {
    if (!currentProject) return { days: [], tasks: [] }

    const start = viewMode === 'week'
      ? startOfWeek(currentDate)
      : startOfWeek(startOfMonth(currentDate));
    const end = viewMode === 'week'
      ? endOfWeek(currentDate)
      : endOfWeek(endOfMonth(currentDate));
    const days = eachDayOfInterval({ start, end });
    
    const tasks = currentProject.modules.flatMap(module =>
      module.tasks.map(task => ({
        ...task,
        moduleName: module.title,
        moduleColor: module.color,
      }))
    )

    return { days, tasks }
  }, [currentProject, currentDate, viewMode])

  const navigateTime = (direction: 'prev' | 'next') => {
    if (viewMode === 'week') {
      setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1))
    } else {
      const newDate = new Date(currentDate)
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
      setCurrentDate(newDate)
    }
  }

  const getTasksForDay = (day: Date) => {
    return timelineData.tasks.filter(task => {
      if (!task.dueDate) return false
      return isSameDay(new Date(task.dueDate), day)
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'text-green-600 bg-green-100'
      case 'in-progress': return 'text-orange-600 bg-orange-100'
      case 'testing': return 'text-purple-600 bg-purple-100'
      case 'todo': return 'text-blue-600 bg-blue-100'
      case 'icebox': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const calculateProjectProgress = () => {
    if (!currentProject) return 0
    const allTasks = currentProject.modules.flatMap(m => m.tasks)
    if (allTasks.length === 0) return 0
    const completedTasks = allTasks.filter(t => t.status === 'done')
    return Math.round((completedTasks.length / allTasks.length) * 100)
  }

  // Refined drop handler for rescheduling
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTaskId(null)
    setHighlightDay(null)
    if (!over) return
    const taskId = active.id as string
    const dayISO = over.id as string
    const newDate = new Date(dayISO)
    // Only update if dropped on a new day
    const task = timelineData.tasks.find((t) => t.id === taskId)
    if (task && (!task.dueDate || (new Date(task.dueDate)).toDateString() !== newDate.toDateString())) {
      updateTask(taskId, { dueDate: newDate })
      setToast({ show: true, message: 'Task rescheduled!' })
      setTimeout(() => setToast({ show: false, message: '' }), 1200)
    }
  }

  if (!currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Project Selected</h3>
          <p className="text-gray-600">Select a project to view the timeline</p>
        </div>
      </div>
    )
  }

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragStart={e => setActiveTaskId(e.active.id as string)}
      onDragOver={e => setHighlightDay(e.over?.id as string || null)}
    >
      <div className="flex-1 bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentProject.title}</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {currentProject.modules.length} modules
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {currentProject.modules.reduce((acc, m) => acc + m.tasks.length, 0)} tasks
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Progress:</span>
              <Progress value={calculateProjectProgress()} className="w-32" />
              <span className="text-sm font-medium">{calculateProjectProgress()}%</span>
            </div>
          </div>
        </div>

        {/* Timeline Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateTime('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h3 className="text-lg font-semibold min-w-[200px] text-center">
                {viewMode === 'week' 
                  ? `Week of ${format(startOfWeek(currentDate), 'MMM dd, yyyy')}`
                  : format(currentDate, 'MMMM yyyy')
                }
              </h3>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateTime('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Month
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="grid gap-4 overflow-y-auto" style={{ gridTemplateColumns: viewMode === 'week' ? 'repeat(7, 1fr)' : 'repeat(7, 1fr)', maxHeight: '70vh' }}>
        {timelineData.days.map((day) => {
          const tasksForDay = getTasksForDay(day)
          const isToday = isSameDay(day, new Date())
          const isHighlighted = highlightDay === day.toISOString();
          return (
            <DroppableDay key={day.toISOString()} day={day}>
              <Card className={`min-h-[200px] ${isToday ? 'ring-2 ring-primary' : ''} ${isHighlighted ? 'ring-2 ring-blue-400' : ''}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className={isToday ? 'text-primary font-bold' : ''}>
                      {format(day, viewMode === 'week' ? 'EEE dd' : 'dd')}
                    </span>
                    {tasksForDay.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {tasksForDay.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {tasksForDay.map((task) => (
                      <DraggableTask key={task.id} task={task}>
                        <div
                          className="p-2 rounded-md border border-gray-200 bg-white hover:shadow-sm transition-shadow cursor-pointer group"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="text-xs font-medium truncate flex-1">
                              {task.title}
                            </h4>
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ml-1 ${getPriorityColor(task.priority)}`} />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: task.moduleColor }}
                              />
                              <span className="text-xs text-gray-500 truncate">
                                {task.moduleName}
                              </span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getStatusColor(task.status)}`}
                            >
                              {task.status}
                            </Badge>
                          </div>
                          {task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {task.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {task.tags.length > 2 && (
                                <span className="text-xs text-gray-400">+{task.tags.length - 2}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </DraggableTask>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </DroppableDay>
          )
        })}
      </div>

      {/* Module Legend */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Modules</h4>
        <div className="flex flex-wrap gap-3">
          {currentProject.modules.map((module) => (
            <div key={module.id} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: module.color }}
              />
              <span className="text-sm text-gray-700">{module.title}</span>
              <Badge variant="secondary" className="text-xs">
                {module.tasks.length} tasks
              </Badge>
            </div>
          ))}
        </div>
      </div>
      </div>
      <Toast message={toast.message} show={toast.show} />
      <DragOverlay>
        {activeTaskId ? (
          (() => {
            const task = timelineData.tasks.find(t => t.id === activeTaskId)
            if (!task) return null
            return (
              <div className="p-2 rounded-md border border-gray-200 bg-white shadow-lg">
                <h4 className="text-xs font-medium truncate flex-1">{task.title}</h4>
              </div>
            )
          })()
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}