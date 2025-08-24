# 🚀 Code Collaborator - Real-Time Collaborative Coding Platform

A powerful, real-time collaborative coding platform that allows multiple developers to work on the same codebase simultaneously. Built with React, Node.js, and Socket.io for seamless real-time collaboration.

## ✨ Features

### 🎯 **Real-Time Collaboration**
- **Live Code Editing**: Multiple users can edit the same file simultaneously
- **Instant Sync**: Changes are broadcasted to all collaborators in real-time
- **Cursor Sharing**: See where other users are typing with colored cursor indicators
- **User Awareness**: Know who's online and what files they're editing

### 📁 **File Management**
- **File Explorer**: Navigate through project files with a familiar sidebar
- **Create Files**: Add new files with proper syntax highlighting
- **Delete Files**: Remove files with confirmation dialogs
- **File Types**: Support for HTML, CSS, JavaScript, TypeScript, JSON, Markdown, and more

### 🎨 **Code Editor**
- **Monaco Editor**: Powered by VS Code's editor engine
- **Syntax Highlighting**: Full language support with proper coloring
- **Dark Theme**: Beautiful dark theme optimized for coding
- **Minimap**: Navigate large files easily
- **Auto-completion**: Intelligent code suggestions

### 👥 **User Management**
- **Real-time Presence**: See who's online and collaborating
- **User Avatars**: Color-coded user identification
- **Activity Tracking**: Monitor what files users are editing
- **Connection Status**: Visual indicators for connection health

## 🛠️ Tech Stack

### **Backend**
- **Node.js** - Server runtime
- **Express** - Web framework
- **Socket.io** - Real-time communication
- **UUID** - Unique identifier generation

### **Frontend**
- **React 18** - UI framework
- **Monaco Editor** - Code editor (VS Code's editor)
- **Styled Components** - CSS-in-JS styling
- **Socket.io Client** - Real-time client communication
- **Lucide React** - Beautiful icons

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd code-collaborator
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

This will start both the backend server (port 5000) and frontend client (port 3000).

### Manual Setup (Alternative)

If you prefer to run servers separately:

1. **Install backend dependencies**
   ```bash
   npm install
   ```

2. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Start backend server**
   ```bash
   npm run server
   ```

4. **Start frontend client** (in a new terminal)
   ```bash
   cd client
   npm start
   ```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📖 Usage Guide

### **Getting Started**
1. Open the application in your browser
2. You'll automatically connect to the default project
3. Start editing files in the sidebar
4. Invite others to join by sharing the URL

### **Collaborating**
1. **Join a File**: Click on any file in the sidebar to start editing
2. **Real-time Editing**: Type in the editor and see changes sync instantly
3. **User Cursors**: See colored cursors showing where others are typing
4. **User Panel**: Monitor who's online and what they're working on

### **File Operations**
1. **Create Files**: Click "New File" button in the sidebar
2. **Delete Files**: Hover over a file and click the trash icon
3. **File Types**: Choose from various programming languages when creating files

### **Best Practices**
- **Communication**: Use the user panel to see who's working on what
- **File Coordination**: Avoid editing the same file simultaneously for complex changes
- **Save Regularly**: Changes are auto-saved, but coordinate major changes with your team

## 🔧 Configuration

### **Environment Variables**
Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
```

### **Customization**
- **Ports**: Modify ports in `server/index.js` and `client/package.json`
- **Theme**: Customize the editor theme in `client/src/components/Editor.js`
- **File Types**: Add new file type support in the file creation modal

## 🚀 Deployment

### **Production Build**
1. **Build the frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

### **Docker Deployment**
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN cd client && npm install && npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

### **Manual Testing**
1. Open multiple browser tabs/windows
2. Navigate to the same URL
3. Start editing files simultaneously
4. Verify real-time synchronization

### **Automated Testing**
```bash
# Run frontend tests
cd client
npm test

# Run backend tests (when implemented)
npm test
```

## 🔒 Security Considerations

- **Input Validation**: All user inputs are validated
- **Rate Limiting**: Consider implementing rate limiting for production
- **Authentication**: Add user authentication for production use
- **HTTPS**: Use HTTPS in production environments

## 🚧 Known Limitations

- **File Size**: Large files may impact performance
- **Concurrent Edits**: Complex concurrent edits may cause conflicts
- **Offline Support**: No offline editing capabilities
- **File History**: No version control or change history

## 🎯 Roadmap

### **Phase 2 Features**
- [ ] User authentication and authorization
- [ ] Project creation and management
- [ ] File versioning and history
- [ ] Conflict resolution algorithms
- [ ] Real-time chat and comments

### **Phase 3 Features**
- [ ] Git integration
- [ ] Code review tools
- [ ] Performance monitoring
- [ ] Mobile responsive design
- [ ] Plugin system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Monaco Editor** - VS Code's editor engine
- **Socket.io** - Real-time communication library
- **React Team** - Amazing frontend framework
- **Node.js Community** - Robust backend runtime

## 📞 Support

- **Issues**: Report bugs and feature requests on GitHub
- **Discussions**: Join community discussions
- **Documentation**: Check the docs folder for detailed guides

---

**Happy Coding Together! 🎉**

Built with ❤️ by the Code Collaborator Team
