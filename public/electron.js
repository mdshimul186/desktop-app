const { app, BrowserWindow, ipcMain, Notification, Menu,shell } = require('electron')
const isDev = require("electron-is-dev");
const path = require("path");


let win


let deeplinkingUrl;

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('ts4u-app', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('ts4u-app')
}

// Force Single Instance Application
const gotTheLock = app.requestSingleInstanceLock()
if (gotTheLock) {
  app.on('second-instance', (e, argv) => {
    // Someone tried to run a second instance, we should focus our window.

    // Protocol handler for win32
    // argv: An array of the second instance’s (command line / deep linked) arguments
    if (process.platform == 'win32') {
      // Keep only command line / deep linked arguments
      deeplinkingUrl = argv.slice(1)
    }
    logDeepLink(deeplinkingUrl)

    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })
} else {
  app.quit()
  return
}
function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1300,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, "preload.js")
    }
  })

  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const template = require('./menu').createTemplate(app);
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  createWindow()


  // const myApiOauth = new ElectronGoogleOAuth2(
  //   '596070014453-t0ihbklarpuvtaqam39qj8n53l2nkhn6.apps.googleusercontent.com',
  //   '6Ld1uO8cAAAAAL9w_XzXzqWjAgAjJZDh1li8Tffo',
  //   ['https://www.googleapis.com/auth/drive.metadata.readonly'],
  //   { successRedirectURL: 'https://ts4u.us/auth' }
  // );

  // myApiOauth.openAuthWindowAndGetTokens()
  //   .then(token => {
  //     // use your token.access_token
  //   });

})
  // Protocol handler for win32
  if (process.platform == 'win32') {
    // Keep only command line / deep linked arguments
    deeplinkingUrl = process.argv.slice(1)
  }
  //logDeepLink(deeplinkingUrl)



app.on('logout', () => {
  win.webContents
    .executeJavaScript('localStorage.removeItem("token");', true)
    .then(result => {
      win.reload()
    });

})
ipcMain.on("reload", () => {

  win.reload()
})
// ipcMain.on("logout", () => {
//   localStorage.removeItem('token')
//   win.reload()
// })

ipcMain.on("notify", (_, message) => {
  new Notification({ title: "Notification", body: message }).show()
})
ipcMain.on("open-link", (_, link) => {
 shell.openExternal(link)
})
ipcMain.on("app-quit", () => {
  app.quit()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


// Log both at dev console and at running node console instance
function logDeepLink(urls) {
  //console.log(urls)
  let url = urls.find(u=>u.startsWith("ts4u-app://"))
  let token = url.replace("ts4u-app://","")
  if(token){
    win.webContents
    .executeJavaScript(`localStorage.setItem("token","Bearer ${token.replace("/","")}");`, true)
    .then(result => {
      win.reload()
    });
  }
  
  // if (win && win.webContents) {
  //   win.webContents.executeJavaScript(`console.log("${s}")`)
  // }
}