import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import Editor from '@monaco-editor/react';
import { Users, Eye } from 'lucide-react';

const EditorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const EditorHeader = styled.div`
  height: 40px;
  background-color: #1e1e1e;
  border-bottom: 1px solid #3e3e42;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FileName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #cccccc;
`;

const FileType = styled.span`
  font-size: 12px;
  color: #888;
  background-color: #3e3e42;
  padding: 2px 6px;
  border-radius: 3px;
`;

const EditorControls = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const CollaboratorsInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #888;
`;

const CollaboratorsCount = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #3e3e42;
  padding: 4px 8px;
  border-radius: 4px;
`;

const CursorIndicator = styled.div`
  position: absolute;
  width: 2px;
  height: 18px;
  background-color: ${props => props.color};
  z-index: 10;
  pointer-events: none;
  
  &::after {
    content: '${props => props.userName}';
    position: absolute;
    top: -20px;
    left: 2px;
    background-color: ${props => props.color};
    color: white;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 11px;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  &:hover::after {
    opacity: 1;
  }
`;

const MonacoWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const getLanguageFromFileName = (fileName) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'js':
      return 'javascript';
    case 'jsx':
      return 'javascript';
    case 'ts':
      return 'typescript';
    case 'tsx':
      return 'typescript';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    case 'py':
      return 'python';
    case 'java':
      return 'java';
    case 'cpp':
    case 'cc':
    case 'cxx':
      return 'cpp';
    case 'c':
      return 'c';
    case 'php':
      return 'php';
    case 'rb':
      return 'ruby';
    case 'go':
      return 'go';
    case 'rs':
      return 'rust';
    default:
      return 'plaintext';
  }
};

const getTheme = () => {
  return {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955' },
      { token: 'keyword', foreground: 'C586C0' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'type', foreground: '4EC9B0' },
      { token: 'function', foreground: 'DCDCAA' },
      { token: 'variable', foreground: '9CDCFE' },
      { token: 'constant', foreground: '4FC1FF' },
      { token: 'operator', foreground: 'D4D4D4' },
    ],
    colors: {
      'editor.background': '#1e1e1e',
      'editor.foreground': '#d4d4d4',
      'editor.lineHighlightBackground': '#2a2d2e',
      'editor.selectionBackground': '#264f78',
      'editor.inactiveSelectionBackground': '#3a3d41',
      'editorCursor.foreground': '#aeafad',
      'editorWhitespace.foreground': '#3e3e42',
      'editorIndentGuide.background': '#3e3e42',
      'editor.selectionHighlightBorder': '#264f78',
    }
  };
};

const CodeEditor = ({ file, socket, users }) => {
  const [content, setContent] = useState(file?.content || '');
  const [collaborators, setCollaborators] = useState([]);
  const [cursors, setCursors] = useState({});
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const lastContentRef = useRef('');

  useEffect(() => {
    if (file) {
      setContent(file.content);
      lastContentRef.current = file.content;
    }
  }, [file]);

  useEffect(() => {
    if (!socket) return;

    // Listen for file updates from other users
    socket.on('fileUpdated', (data) => {
      if (data.fileId === file?.id && data.userId !== socket.id) {
        setContent(data.content);
        lastContentRef.current = data.content;
        
        // Update cursor position
        if (data.cursorPosition) {
          setCursors(prev => ({
            ...prev,
            [data.userId]: {
              position: data.cursorPosition,
              userName: data.userName,
              userColor: data.userColor
            }
          }));
        }
      }
    });

    // Listen for cursor updates
    socket.on('cursorUpdated', (data) => {
      if (data.userId !== socket.id) {
        setCursors(prev => ({
          ...prev,
          [data.userId]: {
            position: data.position,
            userName: data.userName,
            userColor: data.userColor
          }
        }));
      }
    });

    // Listen for users editing the same file
    socket.on('userEditingFile', (data) => {
      if (data.userId !== socket.id) {
        setCollaborators(prev => {
          const existing = prev.find(c => c.userId === data.userId);
          if (!existing) {
            return [...prev, {
              userId: data.userId,
              userName: data.userName,
              userColor: data.userColor
            }];
          }
          return prev;
        });
      }
    });

    return () => {
      socket.off('fileUpdated');
      socket.off('cursorUpdated');
      socket.off('userEditingFile');
    };
  }, [socket, file]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Register custom theme
    monaco.editor.defineTheme('custom-dark', getTheme());
    monaco.editor.setTheme('custom-dark');
    
    // Set initial content
    if (file?.content) {
      editor.setValue(file.content);
    }
    
    // Focus the editor
    editor.focus();
  };

  const handleEditorChange = (value, event) => {
    if (!socket || !file) return;
    
    setContent(value);
    
    // Debounce content updates to avoid too many socket emissions
    clearTimeout(window.contentUpdateTimeout);
    window.contentUpdateTimeout = setTimeout(() => {
      if (value !== lastContentRef.current) {
        const position = editorRef.current?.getPosition();
        socket.emit('editFile', {
          fileId: file.id,
          content: value,
          cursorPosition: position
        });
        lastContentRef.current = value;
      }
    }, 300);
  };

  const handleEditorCursorMove = () => {
    if (!socket || !file) return;
    
    const position = editorRef.current?.getPosition();
    if (position) {
      socket.emit('cursorUpdate', {
        fileId: file.id,
        position
      });
    }
  };

  const renderCursors = () => {
    return Object.entries(cursors).map(([userId, cursorData]) => {
      if (!editorRef.current || !cursorData.position) return null;
      
      try {
        const position = editorRef.current.getPosition();
        const offset = editorRef.current.getOffsetForPosition(cursorData.position);
        const coords = editorRef.current.getScrolledVisiblePosition(cursorData.position);
        
        if (coords) {
          return (
            <CursorIndicator
              key={userId}
              color={cursorData.userColor}
              userName={cursorData.userName}
              style={{
                left: `${coords.left}px`,
                top: `${coords.top}px`
              }}
            />
          );
        }
      } catch (error) {
        // Ignore cursor rendering errors
      }
      return null;
    });
  };

  if (!file) return null;

  const language = getLanguageFromFileName(file.name);
  const activeCollaborators = collaborators.filter(c => c.userId !== socket?.id);

  return (
    <EditorContainer>
      <EditorHeader>
        <FileInfo>
          <FileName>{file.name}</FileName>
          <FileType>{language.toUpperCase()}</FileType>
        </FileInfo>
        
        <EditorControls>
          <CollaboratorsInfo>
            <Eye size={14} />
            <CollaboratorsCount>
              <Users size={12} />
              {activeCollaborators.length + 1}
            </CollaboratorsCount>
            {activeCollaborators.length > 0 && (
              <span>collaborating</span>
            )}
          </CollaboratorsInfo>
        </EditorControls>
      </EditorHeader>
      
      <MonacoWrapper>
        <Editor
          height="100%"
          language={language}
          value={content}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            theme: 'custom-dark',
            fontSize: 14,
            fontFamily: 'Consolas, "Courier New", monospace',
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            cursorStyle: 'line',
            automaticLayout: true,
            minimap: {
              enabled: true,
              side: 'right'
            },
            wordWrap: 'on',
            folding: true,
            showFoldingControls: 'always',
            renderWhitespace: 'selection',
            tabSize: 2,
            insertSpaces: true,
            detectIndentation: true,
            trimAutoWhitespace: true,
            largeFileOptimizations: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            quickSuggestions: true,
            parameterHints: {
              enabled: true
            }
          }}
        />
        {renderCursors()}
      </MonacoWrapper>
    </EditorContainer>
  );
};

export default CodeEditor;
