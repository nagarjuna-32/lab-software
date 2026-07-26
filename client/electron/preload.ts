import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  setKioskMode: (flag: boolean) => ipcRenderer.send('set-kiosk-mode', flag),
  onWindowBlur: (callback: () => void) => ipcRenderer.on('window-blur', callback),
  onWindowFocus: (callback: () => void) => ipcRenderer.on('window-focus', callback),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info')
});
