import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1024,
    minHeight: 700,
    title: 'CodeLock - Secure Examination Environment',
    autoHideMenuBar: true,
    fullscreen: false, // Can be set to true in production
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load Vite dev server URL
  const devUrl = 'http://localhost:5173';
  mainWindow.loadURL(devUrl);

  // Monitor Window Focus & Blur Events (Module 7)
  mainWindow.on('blur', () => {
    if (mainWindow) {
      mainWindow.webContents.send('window-blur');
    }
  });

  mainWindow.on('focus', () => {
    if (mainWindow) {
      mainWindow.webContents.send('window-focus');
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handler for Kiosk Mode
ipcMain.on('set-kiosk-mode', (event, flag: boolean) => {
  if (mainWindow) {
    mainWindow.setKiosk(flag);
    mainWindow.setFullScreen(flag);
  }
});
