const { app, BrowserWindow } = require('electron')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1892,
    height: 301,
    autoHideMenuBar: true,
  })

  win.loadFile('./src/index.html')
}

app.whenReady().then(() => {
  createWindow()
})