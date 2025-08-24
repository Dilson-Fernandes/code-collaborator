import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #1e1e1e;
    color: #ffffff;
    overflow: hidden;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #2d2d30;
  }

  ::-webkit-scrollbar-thumb {
    background: #5a5a5a;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #6a6a6a;
  }

  /* Monaco Editor custom scrollbar */
  .monaco-editor .scrollbar .slider {
    background: #5a5a5a !important;
  }

  .monaco-editor .scrollbar .slider:hover {
    background: #6a6a6a !important;
  }

  .monaco-editor .scrollbar .slider.active {
    background: #007acc !important;
  }

  /* Focus styles */
  *:focus {
    outline: 2px solid #007acc;
    outline-offset: 2px;
  }

  /* Button focus styles */
  button:focus {
    outline: 2px solid #007acc;
    outline-offset: 2px;
  }

  /* Input focus styles */
  input:focus,
  select:focus {
    outline: 2px solid #007acc;
    outline-offset: 2px;
  }

  /* Selection styles */
  ::selection {
    background-color: #264f78;
    color: #ffffff;
  }

  /* Placeholder styles */
  ::placeholder {
    color: #888;
    opacity: 1;
  }

  /* Disabled state styles */
  button:disabled,
  input:disabled,
  select:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Animation utilities */
  .fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }

  .slide-in {
    animation: slideIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      transform: translateX(-20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  /* Tooltip styles */
  [data-tooltip] {
    position: relative;
  }

  [data-tooltip]:before {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #333;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
    z-index: 1000;
  }

  [data-tooltip]:hover:before {
    opacity: 1;
  }

  /* Responsive utilities */
  @media (max-width: 768px) {
    .sidebar {
      width: 200px;
    }
    
    .user-panel {
      width: 150px;
    }
  }

  @media (max-width: 480px) {
    .sidebar {
      width: 180px;
    }
    
    .user-panel {
      width: 120px;
    }
  }
`;
