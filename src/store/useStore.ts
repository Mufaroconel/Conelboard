import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppState, Project, Module, Task, Subtask, ViewType, TaskStatus } from '../types'
import { generateId, playSound, createConfetti } from '../lib/utils'

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      currentView: 'tree' as ViewType,
      searchQuery: '',
      selectedTags: [],
      currentFlowchartId: undefined,

      createProject: (projectData) => {
        const project: Project = {
          ...projectData,
          id: generateId(),
          modules: [],
          tags: projectData.tags ?? [],
          createdAt: new Date(),
          updatedAt: new Date(),
          flowcharts: [],
        }
        
        set((state) => ({
          projects: [...state.projects, project],
          currentProject: project,
        }))
        
        try {
          try {
          try {
          try {
          playSound('start')
        } catch (error) {
          console.warn('Sound playback failed:', error)
        }
        } catch (error) {
          console.warn('Sound playback failed:', error)
        }
        } catch (error) {
          console.warn('Sound playback failed:', error)
        }
        } catch (error) {
          console.warn('Sound playback failed:', error)
        }
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? { ...project, ...updates, updatedAt: new Date() }
              : project
          ),
          currentProject:
            state.currentProject?.id === id
              ? { ...state.currentProject, ...updates, updatedAt: new Date() }
              : state.currentProject,
        }))
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
          currentProject:
            state.currentProject?.id === id ? null : state.currentProject,
        }))
      },

      setCurrentProject: (project) => {
        set({ currentProject: project })
      },

      createModule: (projectId, moduleData) => {
        const module: Module = {
          ...moduleData,
          id: generateId(),
          tasks: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          projectId,
        }

        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  modules: [...project.modules, module],
                  updatedAt: new Date(),
                }
              : project
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? {
                  ...state.currentProject,
                  modules: [...state.currentProject.modules, module],
                  updatedAt: new Date(),
                }
              : state.currentProject,
        }))
        
        playSound('start')
      },

      updateModule: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            modules: project.modules.map((module) =>
              module.id === id
                ? { ...module, ...updates, updatedAt: new Date() }
                : module
            ),
            updatedAt: new Date(),
          })),
          currentProject: state.currentProject
            ? {
                ...state.currentProject,
                modules: state.currentProject.modules.map((module) =>
                  module.id === id
                    ? { ...module, ...updates, updatedAt: new Date() }
                    : module
                ),
                updatedAt: new Date(),
              }
            : null,
        }))
      },

      deleteModule: (id) => {
        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            modules: project.modules.filter((module) => module.id !== id),
            updatedAt: new Date(),
          })),
          currentProject: state.currentProject
            ? {
                ...state.currentProject,
                modules: state.currentProject.modules.filter(
                  (module) => module.id !== id
                ),
                updatedAt: new Date(),
              }
            : null,
        }))
      },

      createTask: (moduleId, taskData) => {
        const task: Task = {
          ...taskData,
          id: generateId(),
          subtasks: [],
          timeSpent: 0,
          isTimerRunning: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          moduleId,
        }

        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            modules: project.modules.map((module) =>
              module.id === moduleId
                ? {
                    ...module,
                    tasks: [...module.tasks, task],
                    updatedAt: new Date(),
                  }
                : module
            ),
            updatedAt: new Date(),
          })),
          currentProject: state.currentProject
            ? {
                ...state.currentProject,
                modules: state.currentProject.modules.map((module) =>
                  module.id === moduleId
                    ? {
                        ...module,
                        tasks: [...module.tasks, task],
                        updatedAt: new Date(),
                      }
                    : module
                ),
                updatedAt: new Date(),
              }
            : null,
        }))
        
        playSound('start')
      },

      updateTask: (id, updates) => {
        const wasCompleted = updates.status === 'complete'
        
        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            modules: project.modules.map((module) => ({
              ...module,
              tasks: module.tasks.map((task) =>
                task.id === id
                  ? { ...task, ...updates, updatedAt: new Date() }
                  : task
              ),
              updatedAt: new Date(),
            })),
            updatedAt: new Date(),
          })),
          currentProject: state.currentProject
            ? {
                ...state.currentProject,
                modules: state.currentProject.modules.map((module) => ({
                  ...module,
                  tasks: module.tasks.map((task) =>
                    task.id === id
                      ? { ...task, ...updates, updatedAt: new Date() }
                      : task
                  ),
                  updatedAt: new Date(),
                })),
                updatedAt: new Date(),
              }
            : null,
        }))
        
        if (wasCompleted) {
          try {
            playSound('complete')
            createConfetti()
          } catch (error) {
            console.warn('Sound/effect playback failed:', error)
          }
        } else {
          try {
            playSound('move')
          } catch (error) {
            console.warn('Sound playback failed:', error)
          }
        }
      },

      // Add function to sync flowchart subtasks to main project tasks
      syncFlowchartSubtasksToMainKanban: (projectId: string, flowchartId: string, nodeId: string, subtasks: any[]) => {
        set((state) => {
          const project = state.projects.find(p => p.id === projectId);
          if (!project) return state;

          // Find or create a module for flowchart tasks
          let flowchartModule = project.modules.find(m => m.title === 'Flowchart Tasks');
          if (!flowchartModule) {
            flowchartModule = {
              id: generateId(),
              title: 'Flowchart Tasks',
              description: 'Tasks from flowchart nodes',
              color: '#6366F1',
              tasks: [],
              createdAt: new Date(),
              updatedAt: new Date(),
              projectId,
              position: { x: 0, y: 0 }
            };
          }

          // Convert subtasks to main tasks
          const newTasks = subtasks.map((subtask: any) => ({
            id: subtask.id,
            title: subtask.title,
            description: `Subtask from flowchart node: ${nodeId}`,
            status: subtask.status || 'icebox',
            priority: 'medium' as const,
            tags: ['flowchart', 'subtask'],
            subtasks: [],
            timeSpent: 0,
            isTimerRunning: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            moduleId: flowchartModule!.id,
            assignee: undefined,
            notes: ''
          }));

          // Update or add tasks
          const updatedTasks = [...flowchartModule!.tasks];
          newTasks.forEach(newTask => {
            const existingIndex = updatedTasks.findIndex(t => t.id === newTask.id);
            if (existingIndex >= 0) {
              updatedTasks[existingIndex] = newTask;
            } else {
              updatedTasks.push(newTask);
            }
          });

          const updatedModule = { ...flowchartModule!, tasks: updatedTasks, updatedAt: new Date() };

          return {
            projects: state.projects.map((project) =>
              project.id === projectId
                ? {
                    ...project,
                    modules: project.modules.some(m => m.id === flowchartModule!.id)
                      ? project.modules.map(m => m.id === flowchartModule!.id ? updatedModule : m)
                      : [...project.modules, updatedModule],
                    updatedAt: new Date(),
                  }
                : project
            ),
            currentProject: state.currentProject?.id === projectId
              ? {
                  ...state.currentProject,
                  modules: state.currentProject.modules.some(m => m.id === flowchartModule!.id)
                    ? state.currentProject.modules.map(m => m.id === flowchartModule!.id ? updatedModule : m)
                    : [...state.currentProject.modules, updatedModule],
                  updatedAt: new Date(),
                }
              : state.currentProject,
          };
        });
      },

      // Add function to update flowchart subtask status
      updateFlowchartSubtaskStatus: (projectId: string, flowchartId: string, nodeId: string, subtaskId: string, newStatus: TaskStatus) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  flowcharts: (project.flowcharts || []).map((fc) =>
                    fc.id === flowchartId
                      ? {
                          ...fc,
                          nodes: fc.nodes.map((node) =>
                            node.id === nodeId
                              ? {
                                  ...node,
                                  data: {
                                    ...node.data,
                                    subtasks: (node.data.subtasks || []).map((subtask: any) =>
                                      subtask.id === subtaskId
                                        ? { ...subtask, status: newStatus }
                                        : subtask
                                    ),
                                  },
                                }
                              : node
                          ),
                        }
                      : fc
                  ),
                  updatedAt: new Date(),
                }
              : project
          ),
          currentProject: state.currentProject?.id === projectId
            ? {
                ...state.currentProject,
                flowcharts: (state.currentProject.flowcharts || []).map((fc) =>
                  fc.id === flowchartId
                    ? {
                        ...fc,
                        nodes: fc.nodes.map((node) =>
                          node.id === nodeId
                            ? {
                                ...node,
                                data: {
                                  ...node.data,
                                  subtasks: (node.data.subtasks || []).map((subtask: any) =>
                                    subtask.id === subtaskId
                                      ? { ...subtask, status: newStatus }
                                      : subtask
                                  ),
                                },
                              }
                            : node
                        ),
                      }
                    : fc
                ),
                updatedAt: new Date(),
              }
            : state.currentProject,
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            modules: project.modules.map((module) => ({
              ...module,
              tasks: module.tasks.filter((task) => task.id !== id),
              updatedAt: new Date(),
            })),
            updatedAt: new Date(),
          })),
          currentProject: state.currentProject
            ? {
                ...state.currentProject,
                modules: state.currentProject.modules.map((module) => ({
                  ...module,
                  tasks: module.tasks.filter((task) => task.id !== id),
                  updatedAt: new Date(),
                })),
                updatedAt: new Date(),
              }
            : null,
        }))
      },

      createSubtask: (taskId, subtaskData) => {
        const subtask: Subtask = {
          ...subtaskData,
          id: generateId(),
          createdAt: new Date(),
        }

        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            modules: project.modules.map((module) => ({
              ...module,
              tasks: module.tasks.map((task) =>
                task.id === taskId
                  ? {
                      ...task,
                      subtasks: [...(task.subtasks || []), subtask],
                      updatedAt: new Date(),
                    }
                  : task
              ),
              updatedAt: new Date(),
            })),
            updatedAt: new Date(),
          })),
          currentProject: state.currentProject
            ? {
                ...state.currentProject,
                modules: state.currentProject.modules.map((module) => ({
                  ...module,
                  tasks: module.tasks.map((task) =>
                    task.id === taskId
                      ? {
                          ...task,
                          subtasks: [...(task.subtasks || []), subtask],
                          updatedAt: new Date(),
                        }
                      : task
                  ),
                  updatedAt: new Date(),
                })),
                updatedAt: new Date(),
              }
            : null,
        }))
        
        playSound('start')
      },

      updateSubtask: (taskId, subtaskId, updates) => {
        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            modules: project.modules.map((module) => ({
              ...module,
              tasks: module.tasks.map((task) =>
                task.id === taskId
                  ? {
                      ...task,
                      subtasks: (task.subtasks || []).map((subtask) =>
                        subtask.id === subtaskId
                          ? { ...subtask, ...updates }
                          : subtask
                      ),
                      updatedAt: new Date(),
                    }
                  : task
              ),
              updatedAt: new Date(),
            })),
            updatedAt: new Date(),
          })),
          currentProject: state.currentProject
            ? {
                ...state.currentProject,
                modules: state.currentProject.modules.map((module) => ({
                  ...module,
                  tasks: module.tasks.map((task) =>
                    task.id === taskId
                      ? {
                          ...task,
                          subtasks: (task.subtasks || []).map((subtask) =>
                            subtask.id === subtaskId
                              ? { ...subtask, ...updates }
                              : subtask
                          ),
                          updatedAt: new Date(),
                        }
                      : task
                  ),
                  updatedAt: new Date(),
                })),
                updatedAt: new Date(),
              }
            : null,
        }))
        
        if (updates.completed) {
          try {
            playSound('complete')
          } catch (error) {
            console.warn('Sound playback failed:', error)
          }
        }
      },

      deleteSubtask: (taskId, subtaskId) => {
        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            modules: project.modules.map((module) => ({
              ...module,
              tasks: module.tasks.map((task) =>
                task.id === taskId
                  ? {
                      ...task,
                      subtasks: (task.subtasks || []).filter(
                        (subtask) => subtask.id !== subtaskId
                      ),
                      updatedAt: new Date(),
                    }
                  : task
              ),
              updatedAt: new Date(),
            })),
            updatedAt: new Date(),
          })),
          currentProject: state.currentProject
            ? {
                ...state.currentProject,
                modules: state.currentProject.modules.map((module) => ({
                  ...module,
                  tasks: module.tasks.map((task) =>
                    task.id === taskId
                      ? {
                          ...task,
                          subtasks: (task.subtasks || []).filter(
                            (subtask) => subtask.id !== subtaskId
                          ),
                          updatedAt: new Date(),
                        }
                      : task
                  ),
                  updatedAt: new Date(),
                })),
                updatedAt: new Date(),
              }
            : null,
        }))
      },

      startTimer: (taskId) => {
        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            modules: project.modules.map((module) => ({
              ...module,
              tasks: module.tasks.map((task) =>
                task.id === taskId
                  ? {
                      ...task,
                      isTimerRunning: true,
                      timerStartTime: Date.now(),
                      updatedAt: new Date(),
                    }
                  : task
              ),
            })),
          })),
          currentProject: state.currentProject
            ? {
                ...state.currentProject,
                modules: state.currentProject.modules.map((module) => ({
                  ...module,
                  tasks: module.tasks.map((task) =>
                    task.id === taskId
                      ? {
                          ...task,
                          isTimerRunning: true,
                          timerStartTime: Date.now(),
                          updatedAt: new Date(),
                        }
                      : task
                  ),
                })),
              }
            : null,
        }))
        
        playSound('start')
      },

      stopTimer: (taskId) => {
        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            modules: project.modules.map((module) => ({
              ...module,
              tasks: module.tasks.map((task) => {
                if (task.id === taskId && task.isTimerRunning && task.timerStartTime) {
                  const additionalTime = Math.floor(
                    (Date.now() - task.timerStartTime) / 1000
                  )
                  return {
                    ...task,
                    isTimerRunning: false,
                    timerStartTime: undefined,
                    timeSpent: task.timeSpent + additionalTime,
                    updatedAt: new Date(),
                  }
                }
                return task
              }),
            })),
          })),
          currentProject: state.currentProject
            ? {
                ...state.currentProject,
                modules: state.currentProject.modules.map((module) => ({
                  ...module,
                  tasks: module.tasks.map((task) => {
                    if (task.id === taskId && task.isTimerRunning && task.timerStartTime) {
                      const additionalTime = Math.floor(
                        (Date.now() - task.timerStartTime) / 1000
                      )
                      return {
                        ...task,
                        isTimerRunning: false,
                        timerStartTime: undefined,
                        timeSpent: task.timeSpent + additionalTime,
                        updatedAt: new Date(),
                      }
                    }
                    return task
                  }),
                })),
              }
            : null,
        }))
      },

      setCurrentView: (view) => {
        set({ currentView: view })
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query })
      },

      setSelectedTags: (tags) => {
        set({ selectedTags: tags })
      },

      exportProject: (projectId) => {
        const { projects } = get()
        const project = projects.find((p) => p.id === projectId)
        if (!project) return JSON.stringify(null, null, 2)
        return JSON.stringify(project, null, 2)
      },

      importProject: (data) => {
        try {
          const project = JSON.parse(data)
          project.id = generateId() // Generate new ID to avoid conflicts
          set((state) => ({
            projects: [...state.projects, project],
          }))
          return true
        } catch (error) {
          console.error('Failed to import project:', error)
          return false
        }
      },
      createProjectFlowchart: (projectId: string, name: string) => {
        const flowchartId = generateId();
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  flowcharts: [
                    ...(project.flowcharts || []),
                    { id: flowchartId, name, nodes: [], edges: [] },
                  ],
                  updatedAt: new Date(),
                }
              : project
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? {
                  ...state.currentProject,
                  flowcharts: [
                    ...(state.currentProject.flowcharts || []),
                    { id: flowchartId, name, nodes: [], edges: [] },
                  ],
                  updatedAt: new Date(),
                }
              : state.currentProject,
          currentFlowchartId: flowchartId,
        }))
      },

      setProjectFlowchart: (projectId: string, flowchartId: string, nodes: any[], edges: any[]) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  flowcharts: (project.flowcharts || []).map((fc) =>
                    fc.id === flowchartId ? { ...fc, nodes, edges } : fc
                  ),
                  updatedAt: new Date(),
                }
              : project
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? {
                  ...state.currentProject,
                  flowcharts: (state.currentProject.flowcharts || []).map((fc) =>
                    fc.id === flowchartId ? { ...fc, nodes, edges } : fc
                  ),
                  updatedAt: new Date(),
                }
              : state.currentProject,
        }))
      },

      setCurrentFlowchartId: (flowchartId: string) => {
        set({ currentFlowchartId: flowchartId })
      },
    }),
    {
      name: 'modular-project-manager',
    }
  )
)