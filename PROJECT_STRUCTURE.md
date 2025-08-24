# 📁 Code Collaborator - Project Structure

## 🏗️ Overall Architecture

```
code_collaborator/
├── 📁 server/                 # Backend Node.js server
├── 📁 client/                 # Frontend React application
├── 📄 package.json            # Root package configuration
├── 📄 README.md               # Comprehensive documentation
├── 📄 demo.html               # Interactive demo page
├── 📄 start.bat               # Windows startup script
├── 📄 start.ps1               # PowerShell startup script
└── 📄 PROJECT_STRUCTURE.md    # This file
```

## 🔧 Backend Structure (`/server`)

```
server/
└── 📄 index.js                # Main Express + Socket.io server
```

### **Server Features:**
- **Express.js** web server
- **Socket.io** real-time communication
- **File management** (create, read, update, delete)
- **User tracking** and presence management
- **Real-time collaboration** coordination
- **Project structure** management

### **Key Endpoints:**
- `GET /api/projects/:projectId` - Get project data
- `GET /api/files/:fileId` - Get file content
- `GET /*` - Serve React app

### **Socket Events:**
- `joinProject` - User joins a project
- `joinFile` - User starts editing a file
- `editFile` - File content changes
- `cursorUpdate` - User cursor position
- `createFile` - Create new file
- `deleteFile` - Delete existing file

## 🎨 Frontend Structure (`/client`)

```
client/
├── 📁 public/
│   └── 📄 index.html          # Main HTML template
├── 📁 src/
│   ├── 📄 index.js            # React entry point
│   ├── 📄 App.js              # Main application component
│   ├── 📁 components/         # React components
│   │   ├── 📄 Sidebar.js      # File explorer sidebar
│   │   ├── 📄 Editor.js       # Monaco code editor
│   │   └── 📄 UserPanel.js    # User collaboration panel
│   └── 📁 styles/
│       └── 📄 GlobalStyle.js  # Global CSS styles
└── 📄 package.json            # Frontend dependencies
```

### **Component Architecture:**

#### **App.js** - Main Application
- **State Management**: Socket connection, current file, project data
- **Layout**: Three-panel design (Sidebar + Editor + UserPanel)
- **Real-time Updates**: Handles all Socket.io events

#### **Sidebar.js** - File Management
- **File Tree**: Display project files and folders
- **File Operations**: Create, delete, navigate files
- **File Icons**: Visual file type indicators
- **Create Modal**: New file creation interface

#### **Editor.js** - Code Editing
- **Monaco Editor**: VS Code-powered code editor
- **Real-time Sync**: Live collaboration with other users
- **Cursor Sharing**: Show other users' cursor positions
- **Language Support**: Multiple programming languages
- **Custom Theme**: Dark theme optimized for coding

#### **UserPanel.js** - Collaboration
- **User List**: Show all online collaborators
- **User Avatars**: Color-coded user identification
- **Activity Tracking**: Monitor user actions
- **Connection Status**: Real-time presence indicators

## 🚀 Quick Start Commands

### **Installation:**
```bash
npm run install-all
```

### **Development:**
```bash
npm run dev          # Start both servers
npm run server       # Start backend only
npm run client       # Start frontend only
```

### **Production:**
```bash
npm run build        # Build frontend
npm start            # Start production server
```

## 🔌 Key Dependencies

### **Backend:**
- `express` - Web framework
- `socket.io` - Real-time communication
- `cors` - Cross-origin resource sharing
- `uuid` - Unique identifier generation

### **Frontend:**
- `react` - UI framework
- `@monaco-editor/react` - Code editor
- `socket.io-client` - Real-time client
- `styled-components` - CSS-in-JS styling
- `lucide-react` - Icon library

## 🌐 Network Configuration

### **Ports:**
- **Backend**: Port 5000 (http://localhost:5000)
- **Frontend**: Port 3000 (http://localhost:3000)
- **Proxy**: Frontend proxies API calls to backend

### **CORS:**
- Backend configured to accept frontend requests
- Socket.io CORS enabled for real-time communication

## 📊 Data Flow

```
User Action → React Component → Socket.io → Backend Server
                ↓
Real-time Update ← Socket.io ← Backend Server ← File System
                ↓
React Component ← State Update ← Socket.io Event
```

## 🎯 Key Features Implementation

### **1. Real-time Collaboration**
- **Socket.io rooms** for file-based collaboration
- **Event-driven updates** for instant synchronization
- **Debounced content updates** to prevent spam

### **2. File Management**
- **In-memory storage** (easily replaceable with database)
- **File type detection** for proper syntax highlighting
- **CRUD operations** with real-time broadcasting

### **3. User Management**
- **Unique user identification** with random names and colors
- **Presence tracking** for online status
- **Activity monitoring** for collaboration awareness

### **4. Code Editor**
- **Monaco Editor integration** with custom theme
- **Language support** for multiple file types
- **Cursor position sharing** for collaboration
- **Performance optimizations** for large files

## 🔒 Security Considerations

- **Input validation** on all user inputs
- **CORS configuration** for controlled access
- **Rate limiting** ready for production
- **Authentication system** ready for implementation

## 🚧 Development Notes

### **Current Limitations:**
- In-memory storage (not persistent)
- No user authentication
- Basic conflict resolution
- No file versioning

### **Future Enhancements:**
- Database integration (MongoDB/PostgreSQL)
- User authentication and authorization
- Advanced conflict resolution (CRDTs)
- File history and versioning
- Real-time chat and comments

## 📝 Code Quality

- **ES6+ syntax** throughout
- **Component-based architecture**
- **Styled-components** for maintainable CSS
- **Proper error handling** and user feedback
- **Responsive design** considerations
- **Accessibility** features included

## 🎨 UI/UX Features

- **Dark theme** optimized for coding
- **Responsive layout** for different screen sizes
- **Smooth animations** and transitions
- **Intuitive navigation** and file management
- **Visual feedback** for all user actions
- **Professional appearance** similar to VS Code

---

**This structure provides a solid foundation for a collaborative coding platform that can be easily extended and customized for specific needs.**
