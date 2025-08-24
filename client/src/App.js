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

    newSocket.on('fileDeleted', (fileId) => {
      setProject(prev => {
        const newFiles = { ...prev.files };
        delete newFiles[fileId];
        return {
          ...prev,
          files: newFiles
        };
      });
      
      // If deleted file was current file, switch to another file
      if (currentFile && currentFile.id === fileId) {
        const remainingFiles = Object.values(project?.files || {}).filter(f => f.id !== fileId);
        if (remainingFiles.length > 0) {
          setCurrentFile(remainingFiles[0]);
          newSocket.emit('joinFile', remainingFiles[0].id);
        } else {
          setCurrentFile(null);
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
    if (socket && window.confirm('Are you sure you want to delete this file?')) {
      socket.emit('deleteFile', { fileId, folderPath });
    }
  };

  const handleDeleteFolder = (folderName, parentPath = '') => {
    if (socket) {
      socket.emit('deleteFolder', { folderName, parentPath });
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
