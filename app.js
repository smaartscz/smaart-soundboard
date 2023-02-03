const { app, BrowserWindow } = require('electron')
const appVersion = app.getVersion();

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1892,
    height: 301,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true, // <--- flag
      nodeIntegrationInWorker: true, // <---  for web workers
      contextIsolation: false
   }
  })
  win.loadFile('./src/index.html')
}

app.whenReady().then(() => {
  createWindow()
})