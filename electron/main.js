const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let serverProcess;
const BACKEND_PORT = 3000;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false, // Wait until backend is ready
    titleBarStyle: 'hiddenInset', // macOS style
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    }
  });

  // Application Menu
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startSpeaking' },
              { role: 'stopSpeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Security: Prevent navigation to outside URLs
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (!parsedUrl.origin.includes('localhost') && !parsedUrl.protocol.includes('file:')) {
      event.preventDefault();
      shell.openExternal(navigationUrl); // Open in default browser instead
    }
  });

  // Security: Prevent new windows
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
  }
}

function startBackend() {
  return new Promise((resolve, reject) => {
    const isDev = !app.isPackaged;
    const scriptPath = isDev 
      ? path.join(__dirname, '../dist/server.js')
      : path.join(process.resourcesPath, 'app/dist/server.js');
      
    console.log('Starting backend:', scriptPath);
    const env = { ...process.env, PORT: BACKEND_PORT };
    
    if (!isDev) {
      const dbPath = path.join(app.getPath('userData'), 'dev.db');
      if (!fs.existsSync(dbPath)) {
        const templatePath = path.join(process.resourcesPath, 'dev.db');
        if (fs.existsSync(templatePath)) {
          fs.copyFileSync(templatePath, dbPath);
        }
      }
      env.DATABASE_URL = `file:${dbPath}`;
      console.log('Using DB at:', dbPath);
    } else {
      env.DATABASE_URL = `file:./dev.db`;
    }

    serverProcess = spawn('node', [scriptPath], { env });
    
    let backendStarted = false;

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Backend] ${output}`);
      // Wait for server to start listening
      if (!backendStarted && output.includes(`Server running on http://localhost:${BACKEND_PORT}`)) {
        backendStarted = true;
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`[Backend Error] ${data}`);
    });

    serverProcess.on('close', (code) => {
      console.log(`Backend exited with code ${code}`);
      if (!backendStarted) {
        reject(new Error(`Backend failed to start with code ${code}`));
      }
    });
  });
}

app.whenReady().then(async () => {
  try {
    await startBackend();
    createWindow();
    mainWindow.show();
  } catch (err) {
    console.error('Failed to start application:', err);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      mainWindow.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    console.log('Gracefully stopping backend...');
    serverProcess.kill();
  }
});
