const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Minimal bridge. E.g., for showing dialogs or IPC messages.
});
