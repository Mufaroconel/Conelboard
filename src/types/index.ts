export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'icebox' | 'todo' | 'in-progress' | 'testing' | 'done'
export type ViewType = 'tree' | 'kanban' | 'timeline'

export interface Subtask {
  id: string
  title: string
  completed: boolean
  createdAt: Date
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  tags: string[]
  subtasks: Subtask[]
  timeSpent: number
  isTimerRunning: boolean
  timerStartTime?: number
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
  moduleId: string
  assignee?: string
  notes: string
}

export interface Module {
  id: string
  title: string
  description: string
  color: string
  tasks: Task[]
  createdAt: Date
  updatedAt: Date
  projectId: string
  position: { x: number; y: number }
}

export interface Project {
  id: string
  title: string
  description: string
  modules: Module[]
  createdAt: Date
  updatedAt: Date
  tags: string[]
  deadline?: Date
}

export interface AppState {
  projects: Project[]
  currentProject: Project | null
  currentView: ViewType
  searchQuery: string
  selectedTags: string[]
  
  // Actions
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'modules'>) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  setCurrentProject: (project: Project | null) => void
  
  createModule: (projectId: string, module: Omit<Module, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>) => void
  updateModule: (id: string, updates: Partial<Module>) => void
  deleteModule: (id: string) => void
  
  createTask: (moduleId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeSpent' | 'isTimerRunning'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  
  createSubtask: (taskId: string, subtask: Omit<Subtask, 'id' | 'createdAt'>) => void
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<Subtask>) => void
  deleteSubtask: (taskId: string, subtaskId: string) => void
  
  startTimer: (taskId: string) => void
  stopTimer: (taskId: string) => void
  
  setCurrentView: (view: ViewType) => void
  setSearchQuery: (query: string) => void
  setSelectedTags: (tags: string[]) => void
  
  exportProject: (projectId: string) => string
  importProject: (data: string) => void
}

export interface NodeData {
  id: string
  title: string
  type: 'project' | 'module' | 'task'
  status?: TaskStatus
  priority?: Priority
  progress?: number
  color?: string
}