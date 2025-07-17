import React from 'react'
import { useStore } from './store/useStore'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { TreeView } from './components/views/TreeView'
import { KanbanView } from './components/views/KanbanView'
import { TimelineView } from './components/views/TimelineView'

function App() {
  const { currentView } = useStore()

  const renderCurrentView = () => {
    switch (currentView) {
      case 'tree':
        return <TreeView />
      case 'kanban':
        return <KanbanView />
      case 'timeline':
        return <TimelineView />
      default:
        return <TreeView />
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  )
}

export default App