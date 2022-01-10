const { ipcRenderer, contextBridge, } = require('electron')
contextBridge.exposeInMainWorld('electron', {
    auth: {
       reload(){
           ipcRenderer.send("reload")
       }
    },
    notificationApi: {
        sendNotification(message) {
            ipcRenderer.send('notify', message);
        }
    },
    appApi: {
        quitApp() {
            ipcRenderer.send('app-quit');
        }
    },
    batteryApi: {

    },
    fileApi: {

    },
    openExternalLink:{
        open(link){
            ipcRenderer.send('open-link',link);
        }
    }
})