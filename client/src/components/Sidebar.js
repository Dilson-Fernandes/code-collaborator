import React, { useState } from 'react';
import styled from 'styled-components';
import { Folder, File, Plus, Trash2, FileText, FileCode, FileImage, Download, FolderPlus } from 'lucide-react';

const SidebarContainer = styled.div`
  width: 250px;
  background-color: #252526;
  border-right: 1px solid #3e3e42;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const SidebarHeader = styled.div`
  padding: 15px;
  border-bottom: 1px solid #3e3e42;
  background-color: #2d2d30;
`;

const SidebarTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #cccccc;
`;

const FileTree = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 15px;
  cursor: pointer;
  color: ${props => props.isActive ? '#ffffff' : '#cccccc'};
  background-color: ${props => props.isActive ? '#37373d' : 'transparent'};
  border-left: 3px solid ${props => props.isActive ? '#007acc' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.isActive ? '#37373d' : '#2a2d2e'};
  }
`;

const FileIcon = styled.div`
  margin-right: 8px;
  display: flex;
  align-items: center;
  color: ${props => props.color || '#cccccc'};
`;

const FileName = styled.span`
  font-size: 13px;
  flex: 1;
`;

const FileActions = styled.div`
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${FileItem}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
  
  &:hover {
    color: #fff;
    background-color: #3e3e42;
  }
`;

const CreateFileSection = styled.div`
  padding: 15px;
  border-top: 1px solid #3e3e42;
  background-color: #2d2d30;
`;

const CreateFileButton = styled.button`
  width: 100%;
  padding: 8px 12px;
  background-color: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  
  &:hover {
    background-color: #005a9e;
  }
`;

const CreateFileModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #2d2d30;
  border: 1px solid #3e3e42;
  border-radius: 6px;
  padding: 20px;
  width: 400px;
  max-width: 90vw;
`;

const ModalTitle = styled.h3`
  margin: 0 0 20px 0;
  color: #cccccc;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  color: #cccccc;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  background-color: #3c3c3c;
  border: 1px solid #5a5a5a;
  border-radius: 4px;
  color: #ffffff;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007acc;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  background-color: #3c3c3c;
  border: 1px solid #5a5a5a;
  border-radius: 4px;
  color: #ffffff;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007acc;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &.primary {
    background-color: #007acc;
    color: white;
    
    &:hover {
      background-color: #005a9e;
    }
  }
  
  &.secondary {
    background-color: #5a5a5a;
    color: white;
    
    &:hover {
      background-color: #4a4a4a;
    }
  }
`;

const FolderItem = styled.div`
  margin-left: ${props => props.level * 20}px;
`;

const FolderHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 15px;
  cursor: pointer;
  color: #cccccc;
  background-color: #2a2d2e;
  border-left: 3px solid #4caf50;
  
  &:hover {
    background-color: #37373d;
  }
`;

const FolderIcon = styled.div`
  margin-right: 8px;
  display: flex;
  align-items: center;
  color: #4caf50;
`;

const FolderName = styled.span`
  font-size: 13px;
  flex: 1;
  font-weight: 500;
`;

const FolderActions = styled.div`
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${FolderHeader}:hover & {
    opacity: 1;
  }
`;

const FolderContent = styled.div`
  margin-left: 20px;
`;

const getFileIcon = (fileName, type) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (type === 'folder') return <Folder size={16} />;
  
  switch (extension) {
    case 'html':
      return <FileText size={16} color="#e34c26" />;
    case 'css':
      return <FileCode size={16} color="#1572b6" />;
    case 'js':
      return <FileCode size={16} color="#f7df1e" />;
    case 'jsx':
    case 'tsx':
      return <FileCode size={16} color="#61dafb" />;
    case 'ts':
      return <FileCode size={16} color="#3178c6" />;
    case 'json':
      return <FileCode size={16} color="#f7df1e" />;
    case 'md':
      return <FileText size={16} color="#ff6b6b" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return <FileImage size={16} color="#4caf50" />;
    default:
      return <File size={16} />;
  }
};

const Sidebar = ({ project, currentFile, onFileSelect, onCreateFile, onDeleteFile, onCreateFolder, onDeleteFolder }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState('javascript');
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFolder = (folder, level = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    
    return (
      <FolderItem key={folder.id} level={level}>
        <FolderHeader onClick={() => toggleFolder(folder.id)}>
          <FolderIcon>
            <Folder size={16} />
          </FolderIcon>
          <FolderName>{folder.name}</FolderName>
          <FolderActions>
            <ActionButton
              onClick={(e) => handleDeleteFolder(e, folder.id)}
              title="Delete folder"
            >
              <Trash2 size={14} />
            </ActionButton>
          </FolderActions>
        </FolderHeader>
        
        {isExpanded && (
          <FolderContent>
            {/* Render files in this folder */}
            {Object.values(folder.children || {}).map((item) => {
              if (item.type === 'folder') {
                return renderFolder(item, level + 1);
              } else {
                return (
                  <FileItem
                    key={item.id}
                    isActive={currentFile?.id === item.id}
                    onClick={() => onFileSelect(item)}
                  >
                    <FileIcon>
                      {getFileIcon(item.name, item.type)}
                    </FileIcon>
                    <FileName>{item.name}</FileName>
                    <FileActions>
                      <ActionButton
                        onClick={(e) => handleDownloadFile(e, item.id, item.name)}
                        title="Download file"
                      >
                        <Download size={14} />
                      </ActionButton>
                      <ActionButton
                        onClick={(e) => handleDeleteFile(e, item.id, folder.path)}
                        title="Delete file"
                      >
                        <Trash2 size={14} />
                      </ActionButton>
                    </FileActions>
                  </FileItem>
                );
              }
            })}
          </FolderContent>
        )}
      </FolderItem>
    );
  };

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim(), newFileType, selectedFolder);
      setNewFileName('');
      setSelectedFolder('');
      setShowCreateModal(false);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), selectedFolder);
      setNewFolderName('');
      setSelectedFolder('');
      setShowCreateFolderModal(false);
    }
  };

  const handleDeleteFile = (e, fileId, folderPath = '') => {
    e.stopPropagation();
    onDeleteFile(fileId, folderPath);
  };

  const handleDeleteFolder = (e, folderId) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete this folder and all its contents?`)) {
      onDeleteFolder(folderId, '');
    }
  };

  const handleDownloadFile = async (e, fileId, fileName) => {
    e.stopPropagation();
    console.log('[Download] Starting file download:', { fileId, fileName });
    
    try {
      const link = document.createElement('a');
      link.href = `/api/download/${fileId}`;
      link.download = fileName;
      console.log('[Download] Created download link:', link.href);
      
      // Add error handling for the download
      const response = await fetch(link.href);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Download failed: ${error}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      
      document.body.appendChild(link);
      console.log('[Download] Triggering download...');
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log('[Download] File download completed');
    } catch (error) {
      console.error('[Download] Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const handleDownloadProject = async () => {
    console.log('[Download] Starting project download');
    
    try {
      console.log('[Download] Fetching project ZIP...');
      const response = await fetch('/api/download-project');
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Download failed: ${error}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'code-collaborator-project.zip';
      
      document.body.appendChild(link);
      console.log('[Download] Triggering ZIP download...');
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log('[Download] Project download completed');
    } catch (error) {
      console.error('[Download] Error downloading project:', error);
      alert('Failed to download project. Please try again.');
    }
  };

  if (!project) return null;

  return (
    <>
      <SidebarContainer>
        <SidebarHeader>
          <SidebarTitle>EXPLORER</SidebarTitle>
        </SidebarHeader>
        
        <FileTree>
          {/* Render root files */}
          {Object.values(project.files).map((file) => (
            <FileItem
              key={file.id}
              isActive={currentFile?.id === file.id}
              onClick={() => onFileSelect(file)}
            >
              <FileIcon>
                {getFileIcon(file.name, file.type)}
              </FileIcon>
              <FileName>{file.name}</FileName>
              <FileActions>
                <ActionButton
                  onClick={(e) => handleDownloadFile(e, file.id, file.name)}
                  title="Download file"
                >
                  <Download size={14} />
                </ActionButton>
                <ActionButton
                  onClick={(e) => handleDeleteFile(e, file.id)}
                  title="Delete file"
                >
                  <Trash2 size={14} />
                </ActionButton>
              </FileActions>
            </FileItem>
          ))}
          
          {/* Render folders recursively */}
          {Object.values(project.folders || {}).map((folder) => 
            renderFolder(folder, 0)
          )}
        </FileTree>
        
        <CreateFileSection>
          <CreateFileButton onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            New File
          </CreateFileButton>
          <CreateFileButton onClick={() => setShowCreateFolderModal(true)} style={{ marginTop: '8px', backgroundColor: '#4caf50' }}>
            <FolderPlus size={16} />
            New Folder
          </CreateFileButton>
          <CreateFileButton onClick={handleDownloadProject} style={{ marginTop: '8px', backgroundColor: '#ff9800' }}>
            <Download size={16} />
            Download Project
          </CreateFileButton>
        </CreateFileSection>
      </SidebarContainer>

      {showCreateModal && (
        <CreateFileModal onClick={() => setShowCreateModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Create New File</ModalTitle>
            
            <FormGroup>
              <Label>File Name</Label>
              <Input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter file name (e.g., app.js)"
                autoFocus
              />
            </FormGroup>
            
            <FormGroup>
              <Label>File Type</Label>
              <Select
                value={newFileType}
                onChange={(e) => setNewFileType(e.target.value)}
              >
                <option value="javascript">JavaScript (.js)</option>
                <option value="html">HTML (.html)</option>
                <option value="css">CSS (.css)</option>
                <option value="json">JSON (.json)</option>
                <option value="markdown">Markdown (.md)</option>
                <option value="typescript">TypeScript (.ts)</option>
                <option value="jsx">React JSX (.jsx)</option>
                <option value="tsx">React TSX (.tsx)</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label>Parent Folder (Optional)</Label>
              <Select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
              >
                <option value="">Root Level</option>
                {Object.values(project?.folders || {}).map((folder) => (
                  <option key={folder.id} value={folder.path}>{folder.name}</option>
                ))}
              </Select>
            </FormGroup>
            
            <ButtonGroup>
              <Button
                className="secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="primary"
                onClick={handleCreateFile}
                disabled={!newFileName.trim()}
              >
                Create File
              </Button>
            </ButtonGroup>
          </ModalContent>
        </CreateFileModal>
      )}

      {showCreateFolderModal && (
        <CreateFileModal onClick={() => setShowCreateFolderModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Create New Folder</ModalTitle>
            
            <FormGroup>
              <Label>Folder Name</Label>
              <Input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name (e.g., components)"
                autoFocus
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Parent Folder (Optional)</Label>
              <Select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
              >
                <option value="">Root Level</option>
                {Object.values(project?.folders || {}).map((folder) => (
                  <option key={folder.id} value={folder.path}>{folder.name}</option>
                ))}
              </Select>
            </FormGroup>
            
            <ButtonGroup>
              <Button
                className="secondary"
                onClick={() => setShowCreateFolderModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="primary"
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
              >
                Create Folder
              </Button>
            </ButtonGroup>
          </ModalContent>
        </CreateFileModal>
      )}
    </>
  );
};

export default Sidebar;