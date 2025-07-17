# 🚀 Modular Project Manager

A complete, fully interactive modular project management web application built with React, TypeScript, and Tailwind CSS. Think of it as a fusion between Trello, Notion, Miro, and GitHub Projects, with the chaotic genius energy of the Pied Piper team from Silicon Valley.

## ✨ Features

### 🎯 Core Functionality
- **Modular Structure**: Projects → Modules → Tasks → Subtasks
- **Three Dynamic Views**: Tree (ReactFlow), Kanban (drag & drop), Timeline (Gantt-style)
- **Real-time Timers**: Built-in task timing with play/pause functionality
- **Progress Tracking**: Live progress bars across all levels
- **Search & Filtering**: Powerful search with tag-based filtering

### 🎨 Pied Piper Startup Vibes
- **Green Theme**: Primary color #00C853 with startup-style animations
- **Sound Effects**: Audio feedback for task moves and completions
- **Confetti**: Celebration animations when tasks are completed
- **Pulse Animations**: Startup-style glowing effects
- **Futuristic UI**: Clean, modern design with hover effects

### 🛠 Technical Excellence
- **Modular Architecture**: Clean separation of concerns across 25+ components
- **TypeScript**: Full type safety throughout
- **Zustand Store**: Efficient state management with persistence
- **Responsive Design**: Works perfectly on all screen sizes
- **Production Ready**: Optimized build with proper error handling

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

3. **Open your browser:**
Navigate to `http://localhost:5173`

## 📱 Usage Guide

### Creating Your First Project
1. Click the "Project" button in the header
2. Fill in project details (title, description)
3. Click "Create Project"

### Adding Modules
1. In Tree View, click "Add Module" on the project node
2. Choose a title, description, and color
3. Modules appear as visual nodes in the tree

### Managing Tasks
1. Click "Add Task" on any module
2. Set priority, status, tags, and description
3. Use the built-in timer to track work time
4. Add subtasks for detailed breakdown

### View Switching
- **Tree View**: Visual hierarchy with ReactFlow nodes and connections
- **Kanban Board**: Classic Trello-style with 5 columns (Icebox → Done)
- **Timeline View**: Gantt-style planning with week/month modes

### Drag & Drop
- Drag tasks between Kanban columns
- Visual feedback with sound effects
- Automatic status updates

## 🎮 Key Features in Detail

### ⏱️ Timer System
- Click play/pause on any task
- Real-time tracking with persistent storage
- Visual indicators for active timers

### 🎯 Progress Tracking
- Module progress based on completed tasks
- Project progress across all modules
- Visual progress bars everywhere

### 🔍 Search & Filter
- Global search across tasks and modules
- Tag-based filtering
- Real-time results

### 💾 Data Persistence
- Automatic localStorage saving
- Export/import projects as JSON
- No data loss on refresh

### 🎉 Startup Animations
- Confetti on task completion
- Sound effects for interactions
- Smooth transitions and hover effects
- Pulsing animations for active elements

## 🏗️ Architecture

### Component Structure
```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── layout/       # Header, Sidebar
│   ├── views/        # Tree, Kanban, Timeline
│   ├── nodes/        # ReactFlow nodes
│   └── kanban/       # Kanban-specific components
├── store/            # Zustand state management
├── types/            # TypeScript definitions
└── lib/              # Utilities and helpers
```

### State Management
- **Zustand**: Lightweight, efficient state management
- **Persistence**: Automatic localStorage integration
- **Actions**: Clean separation of state mutations

### Styling
- **Tailwind CSS**: Utility-first styling
- **Custom Theme**: Pied Piper green (#00C853)
- **Responsive**: Mobile-first design
- **Animations**: Custom keyframes and transitions

## 🎨 Customization

### Changing Colors
Update the primary color in `tailwind.config.js`:
```javascript
primary: {
  DEFAULT: "#00C853", // Change this
  // ... other shades
}
```

### Adding Sound Effects
Modify `src/lib/utils.ts` in the `playSound` function:
```javascript
const frequencies = {
  move: 800,     // Task move sound
  complete: 1200, // Task completion
  start: 600     // Timer start
}
```

### Custom Animations
Add new animations in `src/index.css`:
```css
@keyframes yourAnimation {
  /* keyframes */
}
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`

### Deploy to Vercel
1. Connect your GitHub repository
2. Vercel will auto-detect the Vite configuration
3. Deploy with default settings

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features
1. Create components in appropriate directories
2. Add types to `src/types/index.ts`
3. Update store actions in `src/store/useStore.ts`
4. Follow the existing patterns for consistency

## 🎯 Future Enhancements

### Planned Features
- [ ] Real-time collaboration with WebSockets
- [ ] User authentication and teams
- [ ] File attachments and comments
- [ ] Advanced reporting and analytics
- [ ] Mobile app with React Native
- [ ] AI-powered project suggestions
- [ ] Integration with GitHub/GitLab
- [ ] Advanced timeline features
- [ ] Custom themes and branding

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- **React Flow** - For the amazing tree visualization
- **dnd-kit** - For smooth drag and drop
- **Zustand** - For simple state management
- **Tailwind CSS** - For rapid styling
- **Lucide React** - For beautiful icons

---

Built with ❤️ and ⚡ by the Modular PM Team

*"Making project management as addictive as a Silicon Valley startup"*