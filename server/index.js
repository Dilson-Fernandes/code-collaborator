const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const archiver = require('archiver');
const fs = require('fs');

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
    console.log('Deleting file:', { fileId, folderPath });
    
    let deleted = false;
    
    const deleteFileFromLocation = (files, folders, targetFileId, targetPath) => {
      console.log('Attempting to delete from location:', { targetFileId, targetPath });
      
      if (!targetPath) {
        // Try to delete from root level
        for (const [name, file] of Object.entries(files)) {
          if (file.id === targetFileId) {
            console.log('Found file in root, deleting:', name);
            delete files[name];
            return true;
          }
        }
        return false;
      }
      
      // Find the target folder by path
      const pathParts = targetPath.split('/').filter(Boolean);
      let current = folders;
      let fileParent = null;
      let fileName = null;
      
      // Navigate to the correct folder
      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        if (!current[part] || !current[part].children) {
          console.log('Folder not found or has no children:', part);
          return false;
        }
        
        if (i === pathParts.length - 1) {
          // We're at the parent folder, search its children
          for (const [name, item] of Object.entries(current[part].children)) {
            if (item.id === targetFileId) {
              fileParent = current[part].children;
              fileName = name;
              break;
            }
          }
        }
        current = current[part].children;
      }
      
      // Try to delete the file from this folder
      if (fileParent && fileName) {
        console.log('Found file in folder, deleting:', fileName);
        delete fileParent[fileName];
        return true;
      }
      
      return false;
    };
    
    // First try to delete from the specified folder path
    if (folderPath) {
      deleted = deleteFileFromLocation(
        projects['default'].files,
        projects['default'].folders,
        fileId,
        folderPath
      );
    }
    
    // If not found in folders or no folder path specified, try root files
    if (!deleted) {
      deleted = deleteFileFromLocation(
        projects['default'].files,
        projects['default'].folders,
        fileId,
        ''
      );
    }
    
    if (deleted) {
      console.log('File deleted successfully');
      // Broadcast to all users in project with complete info
      io.to('default').emit('fileDeleted', { fileId, folderPath });
    } else {
      console.log('File not found for deletion');
    }
  });

  // Delete folder
  socket.on('deleteFolder', (data) => {
    const { folderName, parentPath = '' } = data;
    console.log('Deleting folder:', folderName, 'from path:', parentPath);
    
    const deleteFolderInPath = (folders, path) => {
      if (!path) {
        if (folders[folderName]) {
          delete folders[folderName];
          return true;
        }
        return false;
      }
      
      const pathParts = path.split('/').filter(Boolean);
      let current = folders;
      
      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        if (!current[part] || current[part].type !== 'folder') {
          return false;
        }
        
        if (i === pathParts.length - 1) {
          if (current[part].children && current[part].children[folderName]) {
            delete current[part].children[folderName];
            return true;
          }
        }
        current = current[part].children;
      }
      return false;
    };
    
    const deleted = deleteFolderInPath(projects['default'].folders, parentPath);
    
    if (deleted) {
      console.log('Folder deleted successfully');
      io.to('default').emit('folderDeleted', { folderName, parentPath });
    } else {
      console.log('Folder not found for deletion');
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

// Download single file
app.get('/api/download/:fileId', (req, res) => {
  const fileId = req.params.fileId;
  console.log('\n[Download] File download request received:', { fileId });
  
  // Log the current state of files and folders
  console.log('[Download] Current root files:', Object.keys(projects['default'].files));
  console.log('[Download] Current root folders:', Object.keys(projects['default'].folders));
  
  // Helper function to find a file by ID in the project structure
  const findFileInFolders = (folders) => {
    console.log('[Download] Searching folders:', Object.keys(folders));
    
    for (const folder of Object.values(folders)) {
      if (folder.type === 'folder' && folder.children) {
        console.log('[Download] Checking folder:', folder.name);
        console.log('[Download] Folder children:', Object.keys(folder.children));
        
        for (const item of Object.values(folder.children)) {
          if (item.id === fileId) {
            console.log('[Download] Found file in folder:', folder.name);
            return item;
          }
          if (item.type === 'folder' && item.children) {
            console.log('[Download] Recursing into subfolder:', item.name);
            const found = findFileInFolders({ [item.name]: item });
            if (found) return found;
          }
        }
      }
    }
    return null;
  };

  // Check in root files first
  console.log('[Download] Checking root files...');
  let file = Object.values(projects['default'].files).find(f => f.id === fileId);
  
  // If not found in root, search folders recursively
  if (!file) {
    console.log('[Download] File not found in root, searching folders...');
    file = findFileInFolders(projects['default'].folders);
  }
  
  if (!file) {
    console.log('File not found:', fileId);
    return res.status(404).json({ error: 'File not found' });
  }
  
  console.log('Found file:', file.name);
  
  // Set appropriate headers
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
  console.log('\n[Download] Project download request received');
  console.log('[Download] Current project structure:', {
    rootFiles: Object.keys(projects['default'].files),
    rootFolders: Object.keys(projects['default'].folders)
  });
  
  try {
    console.log('[Download] Creating ZIP archive...');
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });
    
    // Set headers
    console.log('[Download] Setting response headers');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="code-collaborator-project.zip"');
    
    // Pipe archive data to the response
    console.log('[Download] Piping archive to response');
    archive.pipe(res);
    
    // Helper function to add files and folders to archive
    const addFilesToArchive = (files, folders, basePath = '') => {
      try {
        console.log(`\n[Download] Processing path: ${basePath || 'root'}`);
        
        // Add root files
        if (files && typeof files === 'object') {
          const fileNames = Object.keys(files);
          console.log(`[Download] Found ${fileNames.length} files in ${basePath || 'root'}:`, fileNames);
          
          Object.values(files).forEach(file => {
            if (file && file.name) {
              const filePath = path.join(basePath, file.name).replace(/\\/g, '/');
              console.log(`[Download] Adding file: ${filePath}`);
              console.log(`[Download] File details:`, {
                name: file.name,
                type: file.type,
                hasContent: !!file.content,
                contentLength: file.content ? file.content.length : 0
              });
              archive.append(file.content || '', { name: filePath });
            } else {
              console.log(`[Download] Invalid file object:`, file);
            }
          });
        } else {
          console.log(`[Download] No files found in ${basePath || 'root'}`);
        }
        
        // Add folders recursively
        if (folders && typeof folders === 'object') {
          const folderNames = Object.keys(folders);
          console.log(`[Download] Found ${folderNames.length} folders in ${basePath || 'root'}:`, folderNames);
          
          Object.values(folders).forEach(folder => {
            if (folder && folder.type === 'folder' && folder.name) {
              const folderPath = path.join(basePath, folder.name).replace(/\\/g, '/');
              console.log(`\n[Download] Processing folder: ${folderPath}`);
              console.log(`[Download] Folder details:`, {
                name: folder.name,
                type: folder.type,
                hasChildren: !!folder.children,
                childrenCount: folder.children ? Object.keys(folder.children).length : 0
              });
              
              // Create empty folder in zip
              console.log(`[Download] Creating folder in ZIP: ${folderPath}/`);
              archive.append(null, { name: `${folderPath}/` });
              
              if (folder.children && typeof folder.children === 'object') {
                const children = Object.values(folder.children);
                console.log(`[Download] Processing ${children.length} children in folder ${folder.name}`);
                
                children.forEach(item => {
                  if (item.type === 'folder') {
                    console.log(`[Download] Found nested folder: ${item.name}`);
                    // Recursively add nested folder
                    addFilesToArchive({}, { [item.name]: item }, folderPath);
                  } else if (item.name) {
                    // Add file from folder
                    const itemPath = path.join(folderPath, item.name).replace(/\\/g, '/');
                    console.log(`[Download] Adding file from folder: ${itemPath}`);
                    console.log(`[Download] File details:`, {
                      name: item.name,
                      type: item.type,
                      hasContent: !!item.content,
                      contentLength: item.content ? item.content.length : 0
                    });
                    archive.append(item.content || '', { name: itemPath });
                  }
                });
              } else {
                console.log(`[Download] No children found in folder: ${folder.name}`);
              }
            } else {
              console.log(`[Download] Invalid folder object:`, folder);
            }
          });
        } else {
          console.log(`[Download] No folders found in ${basePath || 'root'}`);
        }
      } catch (err) {
        console.error('Error while adding files to archive:', err);
        throw err;
      }
    };
    
    console.log('Starting archive creation...');
    
    // Add all files and folders to archive
    addFilesToArchive(projects['default'].files, projects['default'].folders);
    
    // Handle archive warnings
    archive.on('warning', (err) => {
      console.warn('Archive warning:', err);
    });

    // Handle archive errors
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to create archive' });
      }
    });

    // Finalize the archive
    console.log('Finalizing archive...');
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