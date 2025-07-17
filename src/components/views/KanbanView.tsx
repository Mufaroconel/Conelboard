import React from 'react'
import { useStore } from '@/store/useStore'
import { KanbanColumn } from '@/components/kanban/KanbanColumn'
import { TaskStatus } from '@/types'
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { TaskCard } from '@/components/kanban/TaskCard'
import { useState } from 'react'
import { Task } from '@/types'
import { Zap } from 'lucide-react'

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'icebox', title: 'Ice box', color: '#94A3B8' },
  { id: 'emergency', title: 'Emergency', color: '#F44336' },
  { id: 'in-progress', title: 'In progress', color: '#F59E0B' },
  { id: 'testing', title: 'Testing', color: '#8B5CF6' },
  { id: 'complete', title: 'Complete', color: '#00C853' },
]

const columnIds = columns.map(col => col.id);

export const KanbanView: React.FC = () => {
  const { currentProject, updateTask, searchQuery, selectedTags } = useStore()
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = findTaskById(active.id as string)
    setActiveTask(task)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    let newStatus: TaskStatus | undefined;
    if (columnIds.includes(over.id as TaskStatus)) {
      // Dropped on a column
      newStatus = over.id as TaskStatus;
    } else {
      // Dropped on a task: find that task's status
      const targetTask = findTaskById(over.id as string);
      newStatus = targetTask?.status;
    }
    if (newStatus) {
      const task = findTaskById(taskId);
      if (task && task.status !== newStatus) {
        updateTask(taskId, { status: newStatus });
      }
    }
  }

  const findTaskById = (taskId: string): Task | null => {
    if (!currentProject) return null
    
    for (const module of currentProject.modules) {
      const task = module.tasks.find(t => t.id === taskId)
      if (task) return task
    }
    return null
  }

  const priorityOrder = { urgent: 1, high: 2, medium: 3, low: 4 };

  function sortByPriority(tasks: Task[]) {
    return tasks.slice().sort((a, b) => {
      return (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
    });
  }

  const getTasksForColumn = (status: TaskStatus): Task[] => {
    if (!currentProject) return []

    let tasks = currentProject.modules.flatMap(module => 
      module.tasks.filter(task => task.status === status)
    )

    // Apply search filter
    if (searchQuery) {
      tasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      tasks = tasks.filter(task =>
        task.tags.some(tag => selectedTags.includes(tag))
      )
    }

    return sortByPriority(tasks)
  }

  if (!currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Project Selected</h3>
          <p className="text-gray-600">Select a project to view the Kanban board</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentProject.title}</h2>
        <p className="text-gray-600">{currentProject.description}</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-6 overflow-x-auto pb-6">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              tasks={getTasksForColumn(column.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3 opacity-90">
              <TaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}