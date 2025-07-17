import React, { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/Dialog'
import { Textarea } from '@/components/ui/Textarea'
import { 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Settings,
  Zap,
  TreePine,
  Kanban,
  Calendar
} from 'lucide-react'

export const Header: React.FC = () => {
  const {
    currentProject,
    currentView,
    searchQuery,
    setCurrentView,
    setSearchQuery,
    createProject,
    exportProject,
    importProject,
  } = useStore()

  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    tags: [] as string[],
  })
  const [importData, setImportData] = useState('')

  const handleCreateProject = () => {
    if (newProject.title.trim()) {
      createProject(newProject)
      setNewProject({ title: '', description: '', tags: [] })
      setShowCreateProject(false)
    }
  }

  const handleExport = () => {
    if (currentProject) {
      const data = exportProject(currentProject.id)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentProject.title}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleImport = () => {
    if (importData.trim()) {
      importProject(importData)
      setImportData('')
      setShowImport(false)
    }
  }

  const viewIcons = {
    tree: TreePine,
    kanban: Kanban,
    timeline: Calendar,
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-primary animate-pulse" />
              <h1 className="text-2xl font-bold text-gray-900">
                Conelboard
              </h1>
            </div>
            
            {currentProject && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>/</span>
                <span className="font-medium">{currentProject.title}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks, modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* View Switcher */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              {(['tree', 'kanban', 'timeline'] as const).map((view) => {
                const Icon = viewIcons[view]
                return (
                  <Button
                    key={view}
                    variant={currentView === view ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentView(view)}
                    className="capitalize"
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {view}
                  </Button>
                )
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateProject(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Project
              </Button>
              
              {currentProject && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImport(true)}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Create Project Dialog */}
      <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogClose onClick={() => setShowCreateProject(false)} />
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Project Title</label>
              <Input
                placeholder="Enter project title..."
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                placeholder="Describe your project..."
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateProject(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateProject}>
                Create Project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Project</DialogTitle>
            <DialogClose onClick={() => setShowImport(false)} />
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Project Data (JSON)</label>
              <Textarea
                placeholder="Paste your project JSON data here..."
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                rows={8}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowImport(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleImport}>
                Import Project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}