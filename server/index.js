const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const archiver = require('archiver');

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

// Helper function to find file by ID
const findFileById = (items, targetId) => {
  for (const key in items) {
    const item = items[key];
    if (item.id === targetId) {
      return item;
    }
    if (item.type === 'folder' && item.children) {
      const found = findFileById(item.children, targetId);
      if (found) return found;
    }
  }
  return null;
};

// Helper function to delete file by ID
const deleteFileById = (items, targetId) => {
  for (const key in items) {
    const item = items[key];
    if (item.id === targetId) {
      delete items[key];
      return true;
    }
    if (item.type === 'folder' && item.children) {
      if (deleteFileById(item.children, targetId)) {
        return true;
      }
    }
  }
  return false;
};

// Helper function to delete folder by ID
const deleteFolderById = (items, targetId) => {
  for (const key in items) {
    const item = items[key];
    if (item.id === targetId) {
      delete items[key];
      return true;
    }
    if (item.type === 'folder' && item.children) {
      if (deleteFolderById(item.children, targetId)) {
        return true;
      }
    }
  }
  return false;
};

// Helper function to find folder by path
const findFolderByPath = (folders, targetPath) => {
  for (const folderName in folders) {
    const folder = folders[folderName];
    if (folder.path === targetPath) {
      return folder;
    }
    if (folder.type === 'folder' && folder.children) {
      const found = findFolderByPath(folder.children, targetPath);
      if (found) return found;
    }
  }
  return null;
};

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
    const file = findFileById({ ...project.files, ...project.folders }, fileId);
    
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
    
    // Find and update file content
    const updateFileInStructure = (items) => {
      for (const key in items) {
        const item = items[key];
        if (item.id === fileId) {
          item.content = content;
          item.lastModified = Date.now();
          return true;
        }
        if (item.type === 'folder' && item.children) {
          if (updateFileInStructure(item.children)) {
            return true;
          }
        }
      }
      return false;
    };
    
    updateFileInStructure({ ...projects['default'].files, ...projects['default'].folders });
    
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
    
    if (folderPath) {
      // Find the target folder by path
      const targetFolder = findFolderByPath(projects['default'].folders, folderPath);
      if (targetFolder) {
        targetFolder.children[name] = newFile;
      } else {
        // If folder not found, add to root
        projects['default'].files[name] = newFile;
      }
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
    
    if (parentPath) {
      // Find the parent folder by path
      const parentFolder = findFolderByPath(projects['default'].folders, parentPath);
      if (parentFolder) {
        parentFolder.children[name] = newFolder;
      } else {
        // If parent not found, add to root
        projects['default'].folders[name] = newFolder;
      }
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
    
    // Try to delete from files first
    let deleted = deleteFileById(projects['default'].files, fileId);
    
    // If not found in files, try folders
    if (!deleted) {
      deleted = deleteFileById(projects['default'].folders, fileId);
    }
    
    if (deleted) {
      // Broadcast to all users in project
      io.to('default').emit('fileDeleted', fileId);
    }
  });

  // Delete folder
  socket.on('deleteFolder', (data) => {
    const { folderId } = data;
    
    // Delete folder from structure
    const deleted = deleteFolderById(projects['default'].folders, folderId);
    
    if (deleted) {
      // Broadcast to all users in project
      io.to('default').emit('folderDeleted', folderId);
    }
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
  const file = findFileById({ ...projects['default'].files, ...projects['default'].folders }, fileId);
  if (file) {
    res.json(file);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Download single file
app.get('/api/download/:fileId', (req, res) => {
  const fileId = req.params.fileId;
  console.log('Download request for file ID:', fileId);
  
  const file = findFileById({ ...projects['default'].files, ...projects['default'].folders }, fileId);
  
  if (!file) {
    console.log('File not found for ID:', fileId);
    return res.status(404).json({ error: 'File not found' });
  }
  
  const contentTypes = {
    'javascript': 'application/javascript',
    'html': 'text/html',
    'css': 'text/css',
    'json': 'application/json'
  };
  
  res.setHeader('Content-Type', contentTypes[file.type] || 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
  res.send(file.content);
});

// Download project as ZIP
app.get('/api/download-project', (req, res) => {
  try {
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="project.zip"');
    
    archive.pipe(res);
    
    // Helper function to add files to archive recursively
    const addFilesToArchive = (items, basePath = '') => {
      for (const key in items) {
        const item = items[key];
        if (item.type === 'folder' && item.children) {
          // Add folder and its contents
          const folderPath = basePath + item.name + '/';
          addFilesToArchive(item.children, folderPath);
        } else if (item.content) {
          // Add file
          const filePath = basePath + item.name;
          archive.append(item.content, { name: filePath });
        }
      }
    };
    
    // Add all files and folders to archive
    addFilesToArchive({ ...projects['default'].files, ...projects['default'].folders });
    
    // Handle archive errors
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to create archive' });
      }
    });
    
    archive.finalize();
  } catch (error) {
    console.error('Download project error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to create project archive' });
    }
  }
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