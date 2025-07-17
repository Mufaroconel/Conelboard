import React, { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { 
  FolderOpen, 
  Plus, 
  MoreHorizontal, 
  Calendar,
  Users,
  Target,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'

export const Sidebar: React.FC = () => {
  const {
    projects,
    currentProject,
    setCurrentProject,
    selectedTags,
    setSelectedTags,
  } = useStore()

  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId)
    } else {
      newExpanded.add(projectId)
    }
    setExpandedProjects(newExpanded)
  }

  const calculateProjectProgress = (project: any) => {
    const allTasks = project.modules.flatMap((m: any) => m.tasks)
    if (allTasks.length === 0) return 0
    const completedTasks = allTasks.filter((t: any) => t.status === 'complete')
    return Math.round((completedTasks.length / allTasks.length) * 100)
  }

  const getAllTags = () => {
    const tags = new Set<string>()
    projects.forEach(project => {
      project.modules.forEach(module => {
        module.tasks.forEach(task => {
          task.tags.forEach(tag => tags.add(tag))
        })
      })
      project.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags)
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  return (
    <aside className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Projects Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Projects</h2>
          <Button size="sm" variant="ghost">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {projects.map((project) => {
            const progress = calculateProjectProgress(project)
            const isExpanded = expandedProjects.has(project.id)
            const isActive = currentProject?.id === project.id
            
            return (
              <div key={project.id} className="space-y-2">
                <div
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all hover:bg-white ${
                    isActive ? 'bg-primary/10 border border-primary/20' : 'bg-white'
                  }`}
                  onClick={() => {
                    setCurrentProject(project)
                    toggleProject(project.id)
                  }}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <FolderOpen className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isActive ? 'text-primary' : 'text-gray-900'}`}>
                        {project.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress value={progress} className="h-1 flex-1" />
                        <span className="text-xs text-gray-500">{progress}%</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                
                {isExpanded && isActive && (
                  <div className="ml-7 space-y-1 animate-slide-in-up">
                    {project.modules.map((module) => (
                      <div key={module.id} className="flex items-center space-x-2 p-2 text-sm text-gray-600">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: module.color }}
                        />
                        <span className="truncate">{module.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {module.tasks.length}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Project Stats */}
      {currentProject && (
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">Project Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-gray-500" />
                <span>Modules</span>
              </div>
              <Badge variant="secondary">{currentProject.modules.length}</Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Total Tasks</span>
              </div>
              <Badge variant="secondary">
                {currentProject.modules.reduce((acc, m) => acc + m.tasks.length, 0)}
              </Badge>
            </div>
            
            {currentProject.deadline && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Deadline</span>
                </div>
                <span className="text-xs text-gray-600">
                  {format(new Date(currentProject.deadline), 'MMM dd')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tags Filter */}
      <div className="p-4 flex-1">
        <h3 className="font-medium text-gray-900 mb-3">Filter by Tags</h3>
        <div className="flex flex-wrap gap-2">
          {getAllTags().map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? 'default' : 'outline'}
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </aside>
  )
}