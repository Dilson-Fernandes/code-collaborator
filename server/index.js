const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from build folder if it exists, otherwise serve from public
const buildPath = path.join(__dirname, '../client/build');
const publicPath = path.join(__dirname, '../client/public');

if (require('fs').existsSync(buildPath)) {
  app.use(express.static(buildPath));
} else {
  app.use(express.static(publicPath));
}

// In-memory storage (in production, use a database)
let projects = {
  'default': {
    id: 'default',
    name: 'Default Project',
    files: {},
    folders: {
      'src': {
        id: 'src',
        name: 'src',
        type: 'folder',
        children: {
          'index.html': {
            id: 'index.html',
            name: 'index.html',
            content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Collaborative Coding</title>\n</head>\n<body>\n  <h1>Welcome to Code Collaborator!</h1>\n  <p>Start coding together in real-time!</p>\n</body>\n</html>',
            type: 'html',
            lastModified: Date.now(),
            path: 'src/index.html'
          },
          'style.css': {
            id: 'style.css',
            name: 'style.css',
            content: 'body {\n  font-family: Arial, sans-serif;\n  margin: 40px;\n  background-color: #f5f5f5;\n}\n\nh1 {\n  color: #333;\n}\n\np {\n  color: #666;\n}',
            type: 'css',
            lastModified: Date.now(),
            path: 'src/style.css'
          },
          'script.js': {
            id: 'script.js',
            name: 'script.js',
            content: 'console.log("Hello from Code Collaborator!");\n\n// Add your JavaScript code here\nfunction greet() {\n  alert("Welcome to collaborative coding!");\n}',
            type: 'javascript',
            lastModified: Date.now(),
            path: 'src/script.js'
          }
        }
      }
    }
  }
};

let users = new Map(); // socketId -> user info
let fileEditors = new Map(); // fileId -> Set of socketIds editing

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Generate random user info
  const user = {
    id: socket.id,
    name: `User_${Math.floor(Math.random() * 1000)}`,
    color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
    currentFile: null
  };
  
  users.set(socket.id, user);
  
  // Broadcast user joined
  io.emit('userJoined', {
    users: Array.from(users.values()),
    totalUsers: users.size
  });

  // Join project
  socket.on('joinProject', (projectId) => {
    socket.join(projectId);
    console.log(`User ${user.name} joined project ${projectId}`);
    
    // Send project structure
    const project = projects[projectId] || projects['default'];
    socket.emit('projectLoaded', project);
  });

  // Join file for editing
  socket.on('joinFile', (fileId) => {
    user.currentFile = fileId;
    
    if (!fileEditors.has(fileId)) {
      fileEditors.set(fileId, new Set());
    }
    fileEditors.get(fileId).add(socket.id);
    
    socket.join(fileId);
    
    // Send current file content
    const project = projects['default'];
    let file = project.files[fileId];
    
    // If not found in root files, search in folders
    if (!file) {
      const findFileInFolders = (folders) => {
        for (const folder of Object.values(folders)) {
          if (folder.type === 'folder') {
            if (folder.children[fileId]) {
              return folder.children[fileId];
            }
            const found = findFileInFolders(folder.children);
            if (found) return found;
          }
        }
        return null;
      };
      
      file = findFileInFolders(project.folders);
    }
    
    if (file) {
      socket.emit('fileLoaded', file);
    }
    
    // Broadcast user editing file
    socket.to(fileId).emit('userEditingFile', {
      userId: socket.id,
      userName: user.name,
      userColor: user.color
    });
  });

  // Handle file edits
  socket.on('editFile', (data) => {
    const { fileId, content, cursorPosition } = data;
    
    // Update file content in root files
    if (projects['default'].files[fileId]) {
      projects['default'].files[fileId].content = content;
      projects['default'].files[fileId].lastModified = Date.now();
    } else {
      // Search and update in folders
      const updateFileInFolders = (folders) => {
        for (const folder of Object.values(folders)) {
          if (folder.type === 'folder') {
            if (folder.children[fileId]) {
              folder.children[fileId].content = content;
              folder.children[fileId].lastModified = Date.now();
              return true;
            }
            if (updateFileInFolders(folder.children)) {
              return true;
            }
          }
        }
        return false;
      };
      
      updateFileInFolders(projects['default'].folders);
    }
    
    // Broadcast to other users editing the same file
    socket.to(fileId).emit('fileUpdated', {
      fileId,
      content,
      cursorPosition,
      userId: socket.id,
      userName: user.name,
      userColor: user.color
    });
  });

  // Handle cursor position updates
  socket.on('cursorUpdate', (data) => {
    const { fileId, position } = data;
    socket.to(fileId).emit('cursorUpdated', {
      userId: socket.id,
      userName: user.name,
      userColor: user.color,
      position
    });
  });

  // Create new file
  socket.on('createFile', (data) => {
    const { name, type, content = '', folderPath = '' } = data;
    const fileId = uuidv4();
    
    const newFile = {
      id: fileId,
      name,
      content,
      type,
      lastModified: Date.now(),
      path: folderPath ? `${folderPath}/${name}` : name
    };
    
    if (folderPath && projects['default'].folders[folderPath]) {
      // Add to specific folder
      projects['default'].folders[folderPath].children[name] = newFile;
    } else {
      // Add to root
      projects['default'].files[name] = newFile;
    }
    
    // Broadcast to all users in project
    io.to('default').emit('fileCreated', newFile);
  });

  // Create new folder
  socket.on('createFolder', (data) => {
    const { name, parentPath = '' } = data;
    const folderId = uuidv4();
    
    const newFolder = {
      id: folderId,
      name,
      type: 'folder',
      children: {},
      path: parentPath ? `${parentPath}/${name}` : name
    };
    
    if (parentPath && projects['default'].folders[parentPath]) {
      // Add to specific parent folder
      projects['default'].folders[parentPath].children[name] = newFolder;
    } else {
      // Add to root
      projects['default'].folders[name] = newFolder;
    }
    
    // Broadcast to all users in project
    io.to('default').emit('folderCreated', newFolder);
  });

  // Delete file
  socket.on('deleteFile', (data) => {
    const { fileId, folderPath = '' } = data;
    
    if (folderPath && projects['default'].folders[folderPath]?.children[fileId]) {
      delete projects['default'].folders[folderPath].children[fileId];
    } else if (projects['default'].files[fileId]) {
      delete projects['default'].files[fileId];
    }
    
    // Broadcast to all users in project
    io.to('default').emit('fileDeleted', fileId);
  });

  // Delete folder
  socket.on('deleteFolder', (data) => {
    const { folderName, parentPath = '' } = data;
    
    if (parentPath && projects['default'].folders[parentPath]?.children[folderName]) {
      delete projects['default'].folders[parentPath].children[folderName];
    } else if (projects['default'].folders[folderName]) {
      delete projects['default'].folders[folderName];
    }
    
    // Broadcast to all users in project
    io.to('default').emit('folderDeleted', folderName);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove from file editors
    if (user.currentFile && fileEditors.has(user.currentFile)) {
      fileEditors.get(user.currentFile).delete(socket.id);
    }
    
    // Remove user
    users.delete(socket.id);
    
    // Broadcast user left
    io.emit('userLeft', {
      users: Array.from(users.values()),
      totalUsers: users.size
    });
  });
});

// API endpoints
app.get('/api/projects/:projectId', (req, res) => {
  const projectId = req.params.projectId;
  const project = projects[projectId] || projects['default'];
  res.json(project);
});

app.get('/api/files/:fileId', (req, res) => {
  const fileId = req.params.fileId;
  const file = projects['default'].files[fileId];
  if (file) {
    res.json(file);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Download single file
app.get('/api/download/:fileId', (req, res) => {
  const fileId = req.params.fileId;
  
  // Search in root files
  let file = projects['default'].files[fileId];
  
  // If not found in root, search in folders
  if (!file) {
    const searchInFolders = (folders) => {
      for (const folder of Object.values(folders)) {
        if (folder.type === 'folder') {
          if (folder.children[fileId]) {
            return folder.children[fileId];
          }
          const found = searchInFolders(folder.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    file = searchInFolders(projects['default'].folders);
  }
  
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
  res.send(file.content);
});

// Download project as ZIP
app.get('/api/download-project', (req, res) => {
  const archiver = require('archiver');
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="project.zip"');
  
  archive.pipe(res);
  
  // Add files to archive
  const addFilesToArchive = (files, folders, prefix = '') => {
    // Add root files
    Object.values(files).forEach(file => {
      archive.append(file.content, { name: prefix + file.name });
    });
    
    // Add folder contents recursively
    Object.values(folders).forEach(folder => {
      if (folder.type === 'folder') {
        addFilesToArchive(folder.children, {}, prefix + folder.name + '/');
      }
    });
  };
  
  addFilesToArchive(projects['default'].files, projects['default'].folders);
  archive.finalize();
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../client/build/index.html');
  const publicIndexPath = path.join(__dirname, '../client/public/index.html');
  
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else if (require('fs').existsSync(publicIndexPath)) {
    res.sendFile(publicIndexPath);
  } else {
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Code Collaborator - Development Mode</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #1e1e1e; color: #fff; }
          .container { max-width: 600px; margin: 0 auto; }
          .warning { background: #ff9800; color: #000; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .success { background: #4caf50; color: #fff; padding: 15px; border-radius: 5px; margin: 20px 0; }
          code { background: #333; padding: 2px 6px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 Code Collaborator</h1>
          <div class="warning">
            <strong>⚠️ Development Mode Active</strong><br>
            The React app is running in development mode on port 3000
          </div>
          <div class="success">
            <strong>✅ Server is Running!</strong><br>
            Your collaborative coding platform is ready for local network collaboration.
          </div>
          <h3>🌐 How to Connect:</h3>
          <ol>
            <li><strong>For Local Network:</strong> Share your IP address with friends on the same WiFi</li>
            <li><strong>For Internet:</strong> Use localtunnel or ngrok to create a public URL</li>
          </ol>
          <h3>🔧 Quick Setup:</h3>
          <p><strong>Option 1 - Local Network:</strong></p>
          <code>http://YOUR_IP_ADDRESS:5000</code>
          <p><strong>Option 2 - Internet (localtunnel):</strong></p>
          <code>npx localtunnel --port 5000</code>
          <p><strong>Option 3 - Internet (ngrok):</strong></p>
          <code>ngrok http 5000</code>
          <h3>📱 For Your Friend:</h3>
          <p>Once you have a public URL, your friend can connect from anywhere!</p>
        </div>
      </body>
      </html>
    `);
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Collaborative coding platform ready!`);
  console.log(`🌐 Open http://localhost:${PORT} to start coding together`);
});
