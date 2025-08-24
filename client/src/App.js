import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { io } from 'socket.io-client';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import UserPanel from './components/UserPanel';
import { GlobalStyle } from './styles/GlobalStyle';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #1e1e1e;
  color: #ffffff;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.div`
  height: 50px;
  background-color: #2d2d30;
  border-bottom: 1px solid #3e3e42;
  display: flex;
  align-items: center;
  padding: 0 20px;
  justify-content: space-between;
`;

const Logo = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #007acc;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
`;

const ConnectionStatus = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.connected ? '#4caf50' : '#f44336'};
`;

function App() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(window.location.origin);
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      
      // Join default project
      newSocket.emit('joinProject', 'default');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('projectLoaded', (projectData) => {
      console.log('Project loaded:', projectData);
      setProject(projectData);
      
      // Set first file as current file (search in root and folders)
      let firstFile = Object.values(projectData.files)[0];
      
      if (!firstFile) {
        // Search in folders for first file
        const findFirstFile = (folders) => {
          for (const folder of Object.values(folders)) {
            if (folder.type === 'folder') {
              const files = Object.values(folder.children || {}).filter(item => item.type !== 'folder');
              if (files.length > 0) {
                return files[0];
              }
              const found = findFirstFile(folder.children);
              if (found) return found;
            }
          }
          return null;
        };
        
        firstFile = findFirstFile(projectData.folders);
      }
      
      if (firstFile) {
        setCurrentFile(firstFile);
        newSocket.emit('joinFile', firstFile.id);
      }
    });

    newSocket.on('userJoined', (data) => {
      setUsers(data.users);
      setTotalUsers(data.totalUsers);
    });

    newSocket.on('userLeft', (data) => {
      setUsers(data.users);
      setTotalUsers(data.totalUsers);
    });

    newSocket.on('fileCreated', (newFile) => {
      setProject(prev => ({
        ...prev,
        files: {
          ...prev.files,
          [newFile.name]: newFile
        }
      }));
    });

    newSocket.on('fileDeleted', ({ fileId, folderPath }) => {
      console.log('\n[CLIENT APP] Received fileDeleted event:', {
        fileId,
        folderPath: folderPath || 'root',
        timestamp: new Date().toISOString()
      });

      setProject(prev => {
        console.log('[CLIENT APP] Current project state:', {
          rootFiles: Object.keys(prev.files || {}),
          rootFolders: Object.keys(prev.folders || {})
        });

        const newProject = { ...prev };
        
        if (folderPath) {
          console.log('[CLIENT APP] Attempting to delete file from folder:', folderPath);
          // File is in a folder
          const pathParts = folderPath.split('/').filter(Boolean);
          console.log('[CLIENT APP] Folder path parts:', pathParts);

          let current = newProject.folders;
          let parent = null;
          
          // Navigate to the correct folder
          for (const part of pathParts) {
            console.log(`[CLIENT APP] Navigating to folder: ${part}`, {
              available: Object.keys(current),
              hasFolder: !!current[part],
              hasChildren: current[part] ? !!current[part].children : false
            });

            parent = current;
            if (!current[part]) {
              console.log(`[CLIENT APP] ❌ Folder not found: ${part}`);
              break;
            }
            if (!current[part].children) {
              console.log(`[CLIENT APP] Creating children object for folder: ${part}`);
              current[part].children = {};
            }
            current = current[part].children;
          }
          
          // Delete the file from the folder
          if (current && current[fileId]) {
            console.log('[CLIENT APP] Found file in folder, deleting:', {
              fileId,
              fileName: current[fileId].name,
              folderPath
            });
            const deepClone = JSON.parse(JSON.stringify(current[fileId]));
            delete current[fileId];
            console.log('[CLIENT APP] File deleted successfully from folder');
            // Deep clone and return to ensure React re-renders
            return JSON.parse(JSON.stringify(newProject));
          } else {
            console.log('[CLIENT APP] ❌ File not found in specified folder:', {
              fileId,
              folderPath,
              currentFolder: current ? Object.keys(current) : null
            });
          }
        } else {
          console.log('[CLIENT APP] Attempting to delete file from root');
          // File is in root
          if (newProject.files[fileId]) {
            console.log('[CLIENT APP] Found file in root, deleting:', {
              fileId,
              fileName: newProject.files[fileId].name
            });
            delete newProject.files[fileId];
            console.log('[CLIENT APP] File deleted successfully from root');
            // Deep clone and return to ensure React re-renders
            return JSON.parse(JSON.stringify(newProject));
          } else {
            console.log('[CLIENT APP] ❌ File not found in root:', {
              fileId,
              availableFiles: Object.keys(newProject.files)
            });
          }
        }
        
        return newProject;
      });
      
      // If deleted file was current file, switch to another file
      if (currentFile && currentFile.id === fileId) {
        // Try to find another file to show
        const findFirstAvailableFile = (project) => {
          // Check root files first
          const rootFiles = Object.values(project?.files || {});
          if (rootFiles.length > 0) return rootFiles[0];
          
          // Then check folders
          const findInFolders = (folders) => {
            for (const folder of Object.values(folders)) {
              if (folder.type === 'folder' && folder.children) {
                const files = Object.values(folder.children).filter(item => item.type !== 'folder');
                if (files.length > 0) return files[0];
                const found = findInFolders(folder.children);
                if (found) return found;
              }
            }
            return null;
          };
          
          return findInFolders(project?.folders || {});
        };
        
        const nextFile = findFirstAvailableFile(project);
        if (nextFile) {
          setCurrentFile(nextFile);
          newSocket.emit('joinFile', nextFile.id);
        } else {
          setCurrentFile(null);
        }
      }
    });

    newSocket.on('folderDeleted', ({ folderName, parentPath }) => {
      setProject(prev => {
        const newProject = { ...prev };
        
        if (parentPath) {
          // Folder is nested
          const pathParts = parentPath.split('/').filter(Boolean);
          let current = newProject.folders;
          
          // Navigate to the parent folder
          for (const part of pathParts) {
            if (!current[part] || !current[part].children) break;
            current = current[part].children;
          }
          
          // Delete the folder
          if (current[folderName]) {
            delete current[folderName];
          }
        } else {
          // Folder is in root
          if (newProject.folders[folderName]) {
            delete newProject.folders[folderName];
          }
        }
        
        return newProject;
      });
      
      // If current file was in the deleted folder, switch to another file
      if (currentFile) {
        const currentFilePath = currentFile.path || '';
        const deletedFolderPath = parentPath ? `${parentPath}/${folderName}` : folderName;
        
        if (currentFilePath.startsWith(deletedFolderPath)) {
          // Current file was in the deleted folder, find another file
          const findFirstAvailableFile = (project) => {
            // Check root files first
            const rootFiles = Object.values(project?.files || {});
            if (rootFiles.length > 0) return rootFiles[0];
            
            // Then check folders
            const findInFolders = (folders) => {
              for (const folder of Object.values(folders)) {
                if (folder.type === 'folder' && folder.children) {
                  const files = Object.values(folder.children).filter(item => item.type !== 'folder');
                  if (files.length > 0) return files[0];
                  const found = findInFolders(folder.children);
                  if (found) return found;
                }
              }
              return null;
            };
            
            return findInFolders(project?.folders || {});
          };
          
          const nextFile = findFirstAvailableFile(project);
          if (nextFile) {
            setCurrentFile(nextFile);
            newSocket.emit('joinFile', nextFile.id);
          } else {
            setCurrentFile(null);
          }
        }
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleFileSelect = (file) => {
    if (socket && file) {
      setCurrentFile(file);
      socket.emit('joinFile', file.id);
    }
  };

  const handleCreateFile = (fileName, fileType, folderPath = '') => {
    if (socket) {
      socket.emit('createFile', {
        name: fileName,
        type: fileType,
        content: '',
        folderPath
      });
    }
  };

  const handleCreateFolder = (folderName, parentPath = '') => {
    if (socket) {
      socket.emit('createFolder', {
        name: folderName,
        parentPath
      });
    }
  };

  const handleDeleteFile = (fileId, folderPath = '') => {
    console.log('\n[CLIENT APP] Handling file deletion request:', {
      fileId,
      folderPath: folderPath || 'root',
      hasSocket: !!socket,
      timestamp: new Date().toISOString()
    });

    if (socket && window.confirm('Are you sure you want to delete this file?')) {
      console.log('[CLIENT APP] User confirmed file deletion, emitting deleteFile event');
      socket.emit('deleteFile', { fileId, folderPath });
    } else {
      console.log('[CLIENT APP] File deletion cancelled:', {
        reason: !socket ? 'No socket connection' : 'User cancelled',
        fileId,
        folderPath: folderPath || 'root'
      });
    }
  };

  const handleDeleteFolder = (folderName, parentPath = '') => {
    console.log('\n[CLIENT APP] Handling folder deletion request:', {
      folderName,
      parentPath: parentPath || 'root',
      hasSocket: !!socket,
      timestamp: new Date().toISOString()
    });

    if (socket) {
      console.log('[CLIENT APP] Emitting deleteFolder event to server');
      socket.emit('deleteFolder', { folderName, parentPath });
    } else {
      console.error('[CLIENT APP] Socket not available for folder deletion');
    }
  };

  if (!connected) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#1e1e1e',
        color: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Connecting to Code Collaborator...</h2>
          <p>Please wait while we establish the connection.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Sidebar
          project={project}
          currentFile={currentFile}
          onFileSelect={handleFileSelect}
          onCreateFile={handleCreateFile}
          onCreateFolder={handleCreateFolder}
          onDeleteFile={handleDeleteFile}
          onDeleteFolder={handleDeleteFolder}
        />
        <MainContent>
          <TopBar>
            <Logo>Code Collaborator</Logo>
            <StatusIndicator>
              <ConnectionStatus connected={connected} />
              <span>{connected ? 'Connected' : 'Disconnected'}</span>
              <span>•</span>
              <span>{totalUsers} user{totalUsers !== 1 ? 's' : ''} online</span>
            </StatusIndicator>
          </TopBar>
          {currentFile ? (
            <Editor
              file={currentFile}
              socket={socket}
              users={users}
            />
          ) : (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '18px',
              color: '#888'
            }}>
              Select a file to start coding
            </div>
          )}
        </MainContent>
        <UserPanel users={users} />
      </AppContainer>
    </>
  );
}

export default App;
