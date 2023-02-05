const { app, BrowserWindow, remote } = require('electron')
const appVersion = app.getVersion();
require('@electron/remote/main').initialize()

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1892,
    height: 301,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true, // <--- flag
      nodeIntegrationInWorker: true, // <---  for web workers
      contextIsolation: false,
      webSecurity: false
   }
  })
  win.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'downloads') {
      callback(true)
    } else {
      callback(false)
    }
  }) 
  require("@electron/remote/main").enable(win.webContents)
  win.loadFile('./src/index.html')
}

app.whenReady().then(() => {
  createWindow()
})