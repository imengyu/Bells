const electron = require('electron')
const path = require("path")
const url = require('url')

const { app,BrowserWindow,globalShortcut,dialog } = require('electron')
 
let mainWindow = null
let helpWindow = null

const Menu = electron.Menu;
const Tray = electron.Tray;
const ipc = electron.ipcMain;
const exec = require('child_process').exec;

//托盘对象
var appTray = null;
var appQuit = false

function createWindow () {

  mainWindow = new BrowserWindow({
    minWidth: 780,
    minHeight: 560,
    width: 960, 
    height: 660,
    frame: false,
    transparent: true,
    maximizable: false,
    fullscreen: false,
    show: false,
    icon: path.join(__dirname, '/assets/images/logo.ico'),
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true
    },
  })
  mainWindow.setMenu(null)
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  mainWindow.webContents.openDevTools();
 
  mainWindow.on('closed', function () {
    if(helpWindow != null)
      helpWindow.close();
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
  mainWindow.on('close',(e) => {  
    if(!appQuit){
      e.preventDefault();
      mainWindow.hide();
    } 
  });
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })


  var trayMenuTemplate = [
    {
      label: '显示主界面',
      click: function () { mainWindow.show(); mainWindow.focus();  }
    },
    {
      label: '退出',
      click: function () { 
        mainWindow.show(); 
        mainWindow.webContents.send('main-window-act', 'show-exit-dialog');
      }
    }
  ];
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);

  appTray = new Tray(path.join(__dirname, 'assets/images/logo.ico'));
  appTray.setToolTip('铃声自动播放系统');
  appTray.setContextMenu(contextMenu);
  appTray.on('click',function(){
    mainWindow.show();
  })
}
function createAndShowHelpWindow(anchorPos) {
  if(anchorPos) anchorPos = '#' + anchorPos;
  else anchorPos = '';
  if(helpWindow == null){
    helpWindow = new BrowserWindow({
      minWidth: 510,
      minHeight: 460,
      width: 960, 
      height: 660,
      frame: true,
      show: false,
      icon: path.join(__dirname, '/assets/images/logo.ico'),
      webPreferences: {
        webSecurity: false,
        nodeIntegration: false
      },
    })
    helpWindow.setMenu(null)
    helpWindow.loadURL(`file:///${__dirname}/docs/index.html${anchorPos}`);
    helpWindow.webContents.openDevTools();
    helpWindow.on('closed', function () {
      helpWindow = null
    })
    helpWindow.once('ready-to-show', () => {
      helpWindow.show()
    })
  }else{
    helpWindow.loadURL(`file:///${__dirname}/docs/index.html${anchorPos}`);
    helpWindow.show();
    helpWindow.focus();
  }
}
 
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function(){
  createWindow();
})
 
// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
 
app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
 
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipc.on('main-open-file-dialog', function (event, arg) {
  var properties = ['openFile'];
  if(arg.type == 'addMusicsToHistoryList')
    properties.push('multiSelections');
  dialog.showOpenDialog(mainWindow, {
    properties: properties,
    title: '选择音乐文件',
    filters: [
      { name: '音乐文件', extensions: ['mp3', 'wav', 'wma', 'ogg', 'flac'] },
      { name: '所有文件', extensions: ['*'] }
    ],
  }, function (files) {
    if (files) event.sender.send('selected-music', arg, files)
  })
})
ipc.on('main-act-quit', function (event, arg) {
  appQuit = true; app.quit();
});
ipc.on('main-act-run-shell', function (event, arg) {
  let workerProcess
  console.log('run command : ' + arg);

  workerProcess = exec(arg)
  workerProcess.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });
});
ipc.on('main-act-shutdown', function (event) {
  if(process.platform == 'win32')
    exec("shutdown -s -t 0")
  else 
    exec("shutdown -t 0")
  appQuit = true; app.quit();
});
ipc.on('main-act-reboot', function (event) {
  if(process.platform == 'win32')
    exec("shutdown -r -t 0")
  else 
    exec("reboot")
  appQuit = true; app.quit();
});
ipc.on('main-act-show-help-window', function (event, arg) {
  createAndShowHelpWindow(arg);
});
ipc.on('main-act-window-control', function (event, arg) {
  switch (arg) {
    case 'close': if (mainWindow) mainWindow.close(); break;
    case 'show': if (mainWindow) { mainWindow.show(); mainWindow.focus(); } break;
    case 'minimize': if (mainWindow) mainWindow.minimize(); break;
    case 'maximize': if (mainWindow) mainWindow.maximize(); break;
    case 'unmaximize': if (mainWindow) mainWindow.restore(); break;
  }
});