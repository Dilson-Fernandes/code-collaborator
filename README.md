# 🚀 Code Collaborator

A **real-time collaborative coding platform** that lets multiple developers work on the same codebase simultaneously, just like Google Docs for code!

## ✨ Features

- 🔄 **Real-time Collaboration** - Multiple users can edit the same file simultaneously
- 📁 **File & Folder Management** - Create, organize, and manage project structure
- 👥 **User Presence** - See who's online and what files they're editing
- 🖱️ **Cursor Sharing** - View other users' cursor positions in real-time
- 💾 **Download Support** - Download individual files or entire project as ZIP
- 🌐 **Local Network Ready** - Perfect for team collaboration on same WiFi/LAN
- 🎨 **VS Code-like Interface** - Familiar coding experience with Monaco Editor
- ⚡ **Instant Updates** - Changes sync instantly across all connected users

## 🛠️ Tech Stack

- **Frontend**: React 18 + Styled Components + Monaco Editor
- **Backend**: Node.js + Express.js + Socket.io
- **Real-time**: WebSocket communication via Socket.io
- **Styling**: Modern dark theme with VS Code aesthetics

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/code-collaborator.git
   cd code-collaborator
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the platform**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - **Local**: http://localhost:5000
   - **Network**: http://YOUR_IP_ADDRESS:5000

## 🌐 Collaboration Setup

### Local Network (Same WiFi)
1. **Find your IP address**: Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. **Share the URL**: `http://YOUR_IP:5000` with your team
3. **Start coding together** instantly!

### Internet Collaboration
For remote collaboration, you can use:
- **ngrok**: `ngrok http 5000`
- **localtunnel**: `npx localtunnel --port 5000`
- **Cloud deployment** (Heroku, Vercel, etc.)

## 📁 Project Structure

```
code-collaborator/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── styles/        # Global styles
│   │   └── App.js         # Main app component
│   └── public/            # Static assets
├── server/                 # Node.js backend
│   └── index.js           # Express server + Socket.io
├── package.json            # Project dependencies
└── README.md              # This file
```

## 🎯 Usage

### Creating Files
1. Click **"New File"** button in sidebar
2. Enter filename and select type
3. Choose parent folder (optional)
4. Start coding!

### Creating Folders
1. Click **"New Folder"** button
2. Enter folder name
3. Select parent folder (optional)
4. Organize your project structure

### Collaboration
1. **Share your IP address** with team members
2. **Team joins** using your IP address
3. **Real-time editing** begins automatically
4. **See live updates** as others code

### Downloading
- **Individual files**: Click download icon next to file
- **Entire project**: Click "Download Project" button

## 🔧 Development

### Available Scripts
- `npm run dev` - Start both client and server
- `npm run server` - Start only the backend server
- `npm run client` - Start only the React frontend
- `npm run build` - Build React app for production
- `npm run install-all` - Install all dependencies

### Project Structure
- **Monaco Editor** for code editing
- **Socket.io** for real-time communication
- **In-memory storage** (can be extended to database)
- **Modular component architecture**

## 🌟 Use Cases

- **Team coding sessions** and pair programming
- **Code reviews** with live collaboration
- **Educational coding** and workshops
- **Remote team development**
- **Open source collaboration**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Powered by [Socket.io](https://socket.io/)
- Code editing by [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- Styled with [Styled Components](https://styled-components.com/)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/code-collaborator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/code-collaborator/discussions)

---

**Happy Collaborative Coding! 🎉**
