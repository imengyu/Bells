
//import css


import 'vue-happy-scroll/docs/happy-scroll.css'
import "./lib/FontAwesome/css/font-awesome.css";
import "./lib/pagewalkthrough/css/jquery.pagewalkthrough.css";
import "./lib/flipcountdown/jquery.flipcountdown.css";
import 'element-ui/lib/theme-chalk/index.css';
import 'animate.css/animate.css'
import "./assets/css/main/main.scss";

//import scripts

const electron = require("electron");
const fs = require("fs");
const path = require("path");
const ipc = electron.ipcRenderer;
const remote = electron.remote;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
const process = electron.remote.process;

import jQuery from "jquery";
import "./lib/pagewalkthrough/js/jquery.pagewalkthrough.js";
import "./lib/flipcountdown/jquery.flipcountdown.js";

import Vue from 'vue';
import ElementUI from 'element-ui';
import DateUtils from './dateutils'
import Utils from './utils'
import WorkerUtils from './workerutils'
import HappyScroll from 'vue-happy-scroll'

//设置Vue

Vue.use(ElementUI);
Vue.use(HappyScroll)

var $ = jQuery;


function hideFirstLoad() {
  $('#first-loading').addClass(['animated','zoomOut','anim-fast']);
  $('#first-loading').on('animationend', function() {
    $('#main-window').fadeIn(600, function() {
      $('#intro img').show().addClass(['animated','bounceInUp']);
      $('#intro h3').show().addClass(['animated','bounceInUp']);
    });
  });
}
function hideIntro() {
  $('#intro').prop('class', 'intro hidding');
  setTimeout(function () { $('#intro').prop('class', 'intro hidden'); }, 1000);
}
function exitHide(callback){
  $('body').addClass(['animated','zoomOut']);
  $('body').on('animationend', function() {
    callback();
  });
}
function initVue() {
  main = new Vue({
    el: '#app',
    data: function () {
      var validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.managerPasswordEditor.new) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      };
      return {

        /*日期显示*/
        currentDateStr: '-',
        currentDate: null,
        displayTimer: null,
        process: null,

        calendarLoaded: false,
        calendarLoading: false,
        leftAreaScrollColor: 'rgba(0,0,0,0.08)',
        mainTableHeight: 0,
        testJSONData: '',
        shutdownTimer: null,
        shutdownTick: 30,
        settingsActiveTab: 'general',
        weekLabels: [
          {
            label: '星期日',
            value: 0
          },
          {
            label: '星期一',
            value: 1
          },
          {
            label: '星期二',
            value: 2
          },
          {
            label: '星期三',
            value: 3
          },
          {
            label: '星期四',
            value: 4
          },
          {
            label: '星期无',
            value: 5
          },
          {
            label: '星期六',
            value: 6
          },
        ],
        managerPasswordAddRules: {
          new: [
            { required: true, message: '请输入新密码', trigger: 'blur' },
            { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
          ],
          newCheck: [
            { validator: validatePass2, trigger: 'blur' }
          ],
        },
        managerPasswordChangeRules: {
          old: [
            { required: true, message: '请输入旧密码', trigger: 'blur' },
            { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
          ],
          new: [
            { required: true, message: '请输入新密码', trigger: 'blur' },
            { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
          ],
          newCheck: [
            { validator: validatePass2, trigger: 'blur' }
          ],
        },
        developModeTestCkick: 0,
        mainSelection: [],
        timeDelayMainSwitch: null,
        timeDelayLeftSwitch: null,
        chooseTargetCallback: null,
        chooseTargetText: '',
        chooseTargetType: null,
        chooseTargetValue: 0,
        autoStartStatus: '',

        /*标题栏*/
        isMax: false,
        /*对话框控制*/
        showExitDialog: false,
        showEditSeasonDialog: false,
        showEditTableDialog: false,
        showEditTaskDialog: false,
        showEditConditionDialog: false,
        showEditManagerPasswordDialog: false,
        showFastAddListMusicDialog: false,
        showShutdownDialog: false,
        showSettingsDialog: false,
        showLoginHelpDialog: false,
        showLogDialog: false,
        showFirstIntroDialog: false,
        showCalendarDialog: false,
        showChooseTargetDialog: false,

        currentIsAddSeason: false,
        currentIsAddTable: false,
        currentIsAddTask: false,
        currentIsAddCondition: false,
        currentIsAddManagerPassword: false,

        /*菜单*/
        menuSettings: null,
        menuItemDeveloper: null,
        menuSeason: null,
        menuTable: null,
        menuTask: null,
        menuInput: null,
        menuCopy: null,
        menuTaskDeleteSelect: null,
        menuTaskCopySelect: null,

        /*主控数据*/

        currentSeason: null,

        currentShowSeason: null,
        currentShowTable: null,
        currentShowData: null,
        currentShowDataLoading: false,
        currentShowSeasonLoading: false,

        currentEditSeasonBackup: null,
        currentEditSeason: null,
        currentEditTable: null,
        currentEditTableBackup: null,
        currentEditConditionBackup: null,
        currentEditCondition: null,
        currentEditConditionList: null,
        currentEditConditionAllowTypes: null,
        currentEditTaskBackup: null,
        currentEditTask: null,

        /** 全局数据入口 */
        data:[],
        dataLastSaveDate: null,

        /** 全局时钟 */
        timeNow: null,
        timerSecCorrected: false,
        timerMinuteCorrected: false,
        timerHourCorrected: false,
        timerMinuteWkCurrent: 0,
        timerHourWkCurrent: 0,
        timerCorrectSec: null,
        timerSec: null,
        timerMinute: null,
        timerHour: null,

        thisHourPlayTask: [],
        thisMinutePlayTask: [],

        /*日志*/
        logData: [],
        logShowPageData: [],
        logShowPageIndex: 1,
        logShowPageAll: 1,
        logShowPageSize: 30,


        runDay: 0,

        /*音乐播放*/
        playingMusic: [],
        playingMusicPaths: [],
        playingMusicId: 0,
        playingMusicVolume: 50,
        /*音乐列表*/
        musicHistoryList: [],
        musicHistoryListShow: false,
        musicPlayingListShow: true,

        chooseMusicCommandIndex: 0,
        systemLocked: false,
        systemLockEnterPassword: '',
        managerPasswordEditor: {
          old: '',
          new: '',
          newCheck: '',
        },

        /*程序设置*/
        appSettingsDef: {
          preventSleep: true,
          preventAnymouseUse: false,
          autoLock: true,
          autoHide: false,
          managerPassword: '',
          lockedNote: '为了保证数据安全，软件已锁定，请联系管理员了解更多信息',
          appTitle: '校园铃声自动播放系统',
          appFirstLoad: true,
          appBackground: '',
          autoUpdate: true,
          autoSaveDataMaxDay: 15,
          autoLockMaxMinute: 10,
          maxPlayingMusic: 3,
          playingMusicVolume: 50,
          musicPlayingListShow: true,
          developerMode: false,
          idStorage: {
            tid: 0,
            bid: 0,
            sid: 0
          },
        },
        appSettings: null,
        appSettingsBackup: null,
        appVesrsion: '1.0.0',
        appBuildDate: '20190806',
      }
    },
    watch: {
      playingMusicVolume(newVal, oldVal) {
        this.resetAllPlayMusicVolume(newVal);
      },
      currentShowTable(val){
        if(val)
          this.currentShowData = val.tasks;
        else
          this.currentShowData = null;
      },
    },
    methods: {

      /*日期显示*/
      loadDisplayTimer() {
        this.currentDate = new Date();
        var yy = this.currentDate.getFullYear();
        var mm = this.currentDate.getMonth() + 1;
        var dd = this.currentDate.getDate();
        this.currentDateStr = Utils.prefixInteger(yy, 4) + '/' + Utils.prefixInteger(mm, 2) + '/' + Utils.prefixInteger(dd, 2) +
          ' ' + Utils.getWeekString(this.currentDate.getDay()) + ' ' + DateUtils.getLunarDay(yy, mm, dd);
      },
      loadBaiduCalender(){
        if(!this.calendarLoaded){
          setTimeout(function(){ 
            var calendar = document.getElementById('baidu-calendar');
            var loading = main.$loading({
              lock: true,
              text: '正在加载日历，请稍后',
              background: 'rgba(255, 255, 255, 0.8)',
              target: document.getElementById('baidu-calendar-outer'),
            });
            
            if (navigator.onLine) {
              calendar.src = 'http://47.102.215.131/calendar.php';
              //calendar.src = 'http://localhost/calendar.php';
            }else{
              calendar.src = 'no-interenet.html';
            }
            calendar.onload = function(){
              loading.close();
            }
            setTimeout(function(){ 
              loading.close();
            },3000)
          },600)
          this.calendarLoaded = true;
        }
      },
      loadBaseUI(){
        //时钟以及高度初始化
        $("#clock").flipcountdown({ size: "sm" });
        this.mainTableHeight = task_area.offsetHeight - 55;
      },
      
      /*标题栏操作*/
      minWindow() { ipc.send('main-act-window-control', 'minimize'); },
      maxRestoreWindow() { this.isMax = !this.isMax; ipc.send('main-act-window-control', this.isMax ? 'maximize' : 'unmaximize'); },
      closeWindow() { 
        $('#main-window').fadeOut(300, () => { ipc.send('main-act-window-control', 'close');$('#main-window').show(); })
      },

      /*退出对话框控制*/
      showDialogExit() { 
        if(this.systemLocked) this.closeWindow();
        else this.showExitDialog = true; 
      },

      /*时钟主控*/
      loadTimer() {
        console.log('Start timer at : ' + new Date().format('yyyy-MM-dd HH:ii:ss'));
        //校准秒时钟
        this.timerSecCorrected = false;
        this.timerMinuteCorrected = false;
        this.timerHourCorrected = false;
        this.timerCorrectSec = setInterval(() => {
          this.timeNow = new Date();
          var milliseconds = this.timeNow.getMilliseconds();
          if(milliseconds >= 950 || milliseconds <= 50){
            clearInterval(this.timerCorrectSec);
            this.timerCorrectSec = null;
            this.timerSecCorrected = true;
            //时钟开始时运行一次检查，因为分钟和小时时钟没有启动，没有数据
            this.taskTickLateUpdate();
            //运行秒时钟
            this.timerMinuteWkCurrent = this.timeNow.getMinutes();
            this.timerTickSec();
            this.timerSec = setInterval(this.timerTickSec, 1000);
            console.log('Timer second start at : ' + new Date().format('HH:ii:ss'));
            console.log('Correct timer second at : ' + new Date().format('HH:ii:ss'));
          }
        }, 50);
      },
      stopTimer() {
        if(this.timerCorrectSec){
          clearInterval(this.timerCorrectSec);
          this.timerCorrectSec = null;
        }
        if(this.timerSec){
          clearInterval(this.timerSec);
          this.timerSec = null;
        }
        if(this.timerMinute){
          clearInterval(this.timerMinute);
          this.timerMinute = null;
        }
        if(this.timerHour){
          clearInterval(this.timerHour);
          this.timerMintimerHourute = null;
        }
      },
      timerTickSec() {
        this.timeNow = new Date();
        var seconds = this.timeNow.getSeconds();
        var minute = this.timeNow.getMinutes();
        if(!this.timerMinuteCorrected){
          if(seconds == 0){
            clearInterval(this.timerSec);
            this.timerSec = null;
            this.timerMinuteCorrected = true;
            //启动分时钟
            this.timerHourWkCurrent = this.timeNow.getHours();
            this.timerTickMinute();
            this.timerMinute = setInterval(this.timerTickMinute, 60000);
            console.log('Correct timer minute at : ' + new Date().format('HH:ii:ss'));
            console.log('Timer minute start at : ' + new Date().format('HH:ii:ss'));
          }
        }
        if(minute == this.timerMinuteWkCurrent){
          this.taskTick('second');
        }else if(this.timerMinuteCorrected) {
          clearInterval(this.timerSec);
          this.timerSec = null;
          console.log('Timer second stop at : ' + new Date().format('HH:ii:ss'));
        }
      },
      timerTickMinute(){
        this.timeNow = new Date();

        var hour = this.timeNow.getHours();
        var minute = this.timeNow.getMinutes();
        if(!this.timerHourCorrected){
          if(minute == 0){
            clearInterval(this.timerSec);
            this.timerSec = null;
            this.timerMinuteCorrected = true;

            this.timerTickHour();
            this.timerHour = setInterval(this.timerTickHour, 3600000);
            console.log('Correct timer hour at : ' + new Date().format('HH:ii:ss'));
            console.log('Timer hour start at : ' + new Date().format('HH:ii:ss'));
          }
          //0 点需要重新切换列表状态
          if(hour == 0 && minute == 0){
            this.switchCurrentSeason();
          }
        }
        if(hour == this.timerHourWkCurrent){
          if(this.taskTick('minute')){
            //当前分钟存在任务，启动秒时钟

            this.timerMinuteWkCurrent = this.timeNow.getMinutes();
            if(!this.timerSec){
              this.timerTickSec();
              this.timerSec = setInterval(this.timerTickSec, 1000);
            }
            console.log('Timer second start at : ' + new Date().format('HH:ii:ss'));
          }
        }else if(this.timerHourCorrected) {
          clearInterval(this.timerMinute);
          console.log('Timer minute stop at : ' + new Date().format('HH:ii:ss'));
          this.timerMinute = null;
        }
      },
      timerTickHour(){
        this.timeNow = new Date();

        var hour = this.timeNow.getHours();
        if(this.taskTick('hour')){
          //当前小时存在任务，启动分钟时钟

          this.timerHourWkCurrent = hour;
          if(!this.timerMinute) {
            this.timerTickMinute();
            this.timerMinute = setInterval(this.timerTickMinute, 60000);
          }
          console.log('Timer minute start at : ' + new Date().format('HH:ii:ss'));
        }
        //0 点需要重新切换列表状态，和执行数据保存任务
        if(hour == 0){
          this.switchCurrentSeason();
          //刷新页面上的日期
          this.loadDisplayTimer();
          this.updateDisplayTime();

          //计算上次保存数据相差几天
          if(this.dataLastSaveDate && this.appSettings.autoSaveDataMaxDay > 0){
          var day=(new Date().getTime()-this.dataLastSaveDate.getTime())/(1000*60*60*24);
            if(day > this.appSettings.autoSaveDataMaxDay){
              //保存数据
              this.saveAndReloadData();
              this.log('自动播放数据保存数据已超时 ' + day + ' 天，重新保存数据', {modulname: '自动执行器'});
            }
          }
        }
      },
      /*任务自动检测主控*/
      taskTickHour(){
        this.thisHourPlayTask = [];
        
        var result = false;
        for (var i = 0, c = this.data.length; i < c; i++) {
          //正在播放的季节
          var season = this.data[i];
          if(season.playing){
            for (var j = 0, d = season.tables.length; j < d; j++) {
              //正在播放的时间表
              var table = season.tables[j];
              if(table.status == 'playing'){
                for (var k = 0, f = table.tasks.length; k < f; k++){
                  if(table.tasks[k].isPlayingInThisHours()){
                    this.thisHourPlayTask.push(table.tasks[k]);
                    result = true;
                  }
                  else if(table.tasks[k].isStoppingInThisHours()){
                    this.thisHourPlayTask.push(table.tasks[k]);
                    result = true;
                  }
                }
              }
            }
          }
        }
        return result
      },
      taskTickMinute(){
        this.thisMinutePlayTask = [];

        var result = false;
        //搜索当前小时播放的任务
        for (var k = 0, f = this.thisHourPlayTask.length; k < f; k++){
          if(this.thisHourPlayTask[k].isPlayingInThisMinute()){
            this.thisMinutePlayTask.push(this.thisHourPlayTask[k]);
            result = true;
          }
          else if(this.thisHourPlayTask[k].isStoppingInThisMinute()){
            this.thisMinutePlayTask.push(this.thisHourPlayTask[k]);
            result = true;
          }
        }
        return result
      },
      taskThisHourFind(task){
        for (var k = 0, f = this.thisHourPlayTask.length; k < f; k++){
          if(this.thisHourPlayTask[k].tid==task.tid)
            return this.thisHourPlayTask[k]
        }
        return false
      },
      taskThisMinuteFind(task){
        for (var k = 0, f = this.thisMinutePlayTask.length; k < f; k++){
          if(this.thisMinutePlayTask[k].tid==task.tid)
            return this.thisMinutePlayTask[k]
        }
        return false
      },
      taskTick(type){

        var rs = false;
        
        //小时， 全局检索
        if(type == 'hour')
          rs = this.taskTickHour();
        else if(type == 'minute')
          rs = this.taskTickMinute();
        else if(type == 'second') {
          for (var k = 0, f = this.thisMinutePlayTask.length; k < f; k++){
            if(this.thisMinutePlayTask[k].isPlayingTime()){
              this.playTask(this.thisMinutePlayTask[k]);
              rs = true;
            }
            if(this.thisMinutePlayTask[k].isStoppingTime()){
              this.stopTask(this.thisMinutePlayTask[k]);
              rs = true;
            }
          }
        } 

        //console.log('taskTick : ' + type + '('+ rs +') at : ' + new Date().format('HH:ii:ss'));

        return rs;
      }, 
      taskTickLateUpdate(){
        var needStartSec = false;
        if(this.taskTick('hour')){
          //认为修改数据，导致时钟需要重新启动
          if(this.timerMinuteCorrected && !this.timerMinute==null){
            this.timerMinuteCorrected = false;
            needStartSec = true;
          }
        }
        if(this.taskTick('minute'))
          needStartSec = true;

        if(needStartSec){
          this.timerMinuteWkCurrent = this.timeNow.getMinutes();
          this.timerTickSec();
          this.timerSec = setInterval(this.timerTickSec, 1000);
          console.log('Timer second start at : ' + new Date().format('HH:ii:ss'));
        }
      },

      /*日志主控*/
      log(content, opinion){
        var newLogObj = {
          content: content,
          datetime: new Date().format('MM-dd HH:ii:ss'),
          fileline: '',
          modulname: '',
          level: '信息',
          table: '',
          season: '',
        };
        if(opinion) Utils.cloneValueForce(newLogObj, opinion);
        this.logData.splice(0, 0, newLogObj);
      },
      logError(content, fileline, modulname){
        var newLogObj = {
          content: content,
          datetime: new Date().format('MM-dd HH:ii:ss'),
          fileline: fileline,
          modulname: modulname ? modulname : '未知模块',
          level: '错误',
        };
        this.logData.splice(0, 0, newLogObj);
      },
      showLog(page){
        if(page && page !=this.logShowPageIndex) this.logShowPageIndex = page;

        this.logShowPageData.length = 0;

        var pageSize = this.logShowPageSize;
        var start = (this.logShowPageIndex - 1) * pageSize;
        var end = start + pageSize;

        for(var i = start, c = this.logData.length; i < c && i < end; i++)
          this.logShowPageData.push(this.logData[i]);

      },
      handleLogPageSizeChange(val){
        this.logShowPageSize = val;
        this.showLog();
      },
      handleLogPageCurrentChange(val){
        this.showLog(val);
      },


      /*菜单主控*/
      loadMenus() {
        this.menuSettings = new Menu();
        
        this.menuSettings.append(new MenuItem({ label: '锁定软件', click: () => { this.switchSystemLock(true); } }));
        this.menuSettings.append(new MenuItem({ type: 'separator' }))
        this.menuSettings.append(new MenuItem({ label: '数据导出与导入', click: () => { this.editSetings('data'); } }));
        this.menuSettings.append(new MenuItem({ label: '手动保存数据', click: () => { this.saveAndReloadData(); } }));
        this.menuSettings.append(new MenuItem({ label: '查看日志', click: () => { this.showLogDialog =true;this.showLog(0); } }));
        this.menuSettings.append(new MenuItem({ type: 'separator' }))
        this.menuSettings.append(new MenuItem({ label: '入门', click: () => { this.showFirstView(); } }));

        var developerSubMenu = new Menu();
        developerSubMenu.append(new MenuItem({ label: '强制清除数据', click: () => { this.forceClearData() } }));
        developerSubMenu.append(new MenuItem({ label: '切换开发者工具', click: () => { ipc.send('main-act-window-control', 'switchDevTools'); } }));
        developerSubMenu.append(new MenuItem({ label: '打开进程管理器', click: () => { ipc.send('main-act-window-control', 'openProcessManager'); } }));

        this.menuItemDeveloper = new MenuItem({ label: '开发者选项', submenu: developerSubMenu });
        this.menuItemDeveloper.visible = false;
        this.menuSettings.append(this.menuItemDeveloper);
        
        var powerSubMenu = new Menu();
        powerSubMenu.append(new MenuItem({ label: '关闭计算机', click: () => { this.shutdownByUser(); } }));
        powerSubMenu.append(new MenuItem({ label: '重启计算机', click: () => { this.rebootByUser(); } }));
        powerSubMenu.append(new MenuItem({ label: '关闭显示器', click: () => { this.closeMointor(); } }));
        this.menuSettings.append(new MenuItem({ label: '软件设置', click: () => { this.editSetings('general'); } }));
        this.menuSettings.append(new MenuItem({ label: '系统电源', submenu: powerSubMenu }));
        this.menuSettings.append(new MenuItem({ type: 'separator' }))
        this.menuSettings.append(new MenuItem({ label: '关于软件', click: () => { this.editSetings('about'); } }));    
        this.menuSettings.append(new MenuItem({ label: '退出程序', click: () => { this.showDialogExit(); } }));

        this.menuSeason = new Menu();
        this.menuSeason.append(new MenuItem({ label: '编辑时令', click: () => { this.editSeason(); } }));
        this.menuSeason.append(new MenuItem({ label: '删除时令', click: () => { this.deleteSeason(); } }))
        this.menuSeason.append(new MenuItem({ type: 'separator' }))
        this.menuSeason.append(new MenuItem({ label: '手动设为当前时令', click: () => { this.manualSetToCurrent(); } }))
        this.menuSeason.append(new MenuItem({ label: '清除手动设置的时令', click: () => { this.manualSetSeasonClear(); } }))

        this.menuTable = new Menu();
        this.menuTable.append(new MenuItem({ label: '编辑时间表', click: () => { this.editTable(); } }));
        this.menuTable.append(new MenuItem({ label: '删除时间表', click: () => { this.deleteTable(); } }))
        this.menuTable.append(new MenuItem({ type: 'separator' }))
        this.menuTable.append(new MenuItem({ label: '复制时间表', click: () => { this.copyTable() } }))
        this.menuTable.append(new MenuItem({ label: '移动时间表', click: () => { this.moveTable() } }))

        this.menuTask = new Menu();
        this.menuTaskDeleteSelect = new MenuItem({ label: '复制选中的任务至', click: () => { this.copyCheckedTask() } });
        this.menuTaskCopySelect = new MenuItem({ label: '删除选中的任务', click: () => { this.deleteCheckedTask() } });
        this.menuTaskCopySelect.enabled = false;
        this.menuTaskDeleteSelect.enabled = false;
        this.menuTask.append(new MenuItem({ label: '编辑任务', click: () => { this.editTask(); } }));
        this.menuTask.append(new MenuItem({ label: '删除任务', click: () => { this.deleteTask(); } }))
        this.menuTask.append(new MenuItem({ label: '复制任务', click: () => { this.copyTask() } }));
        this.menuTask.append(new MenuItem({ label: '移动任务', click: () => { this.moveTask() } }));
        this.menuTask.append(new MenuItem({ type: 'separator' }))
        this.menuTask.append(this.menuTaskDeleteSelect)
        this.menuTask.append(this.menuTaskCopySelect)
        this.menuTask.append(new MenuItem({ type: 'separator' }))
        this.menuTask.append(new MenuItem({ label: '立即播放任务', click: () => { this.playTaskUser(); } }))

        this.menuInput = new Menu();
        this.menuInput.append(new MenuItem({ label:'剪切', role: 'cut' }));
        this.menuInput.append(new MenuItem({ label:'复制', role: 'copy' }));
        this.menuInput.append(new MenuItem({ label:'粘贴', role: 'paste' }));
        this.menuInput.append(new MenuItem({ label:'删除', role: 'delete' }));
        this.menuInput.append(new MenuItem({ label:'全选', role: 'selectall' }));

        this.menuCopy = new Menu();
        this.menuCopy.append(new MenuItem({ label:'复制', role: 'copy' }));
        this.menuCopy.append(new MenuItem({ label:'全选', role: 'selectall' }));
      },
      showMenuSettings() { this.menuSettings.popup(remote.getCurrentWindow()); },
      showMenuSeason(season) { this.currentEditSeason = season; if(Utils.isNullOrEmpty(window.getSelection())) this.menuSeason.popup(remote.getCurrentWindow()); },
      showMenuTable(table) { this.currentEditTable = table; if(Utils.isNullOrEmpty(window.getSelection())) this.menuTable.popup(remote.getCurrentWindow()); },
      showMenuTask(task) { this.currentEditTask = task; if(Utils.isNullOrEmpty(window.getSelection()))this.menuTask.popup(remote.getCurrentWindow()); },
      mainListItemRightClick(row, column, event){
        this.showMenuTask(row);
      },
      mainListItemDoubleClick(row, column, event){
        this.currentEditTask = row;
        this.playTaskUser();
      },
      mainListHandleSelectionChange(val) {
        var b = (val && val.length > 0)
        this.menuTaskCopySelect.enabled = b;
        this.menuTaskDeleteSelect.enabled = b;

        this.mainSelection = val;
      },

      /*数据主控*/
      initDatabase(callback){
        console.log('Load Database file: ' + dbPath);
        db.loadDatabase(function (err) {
          console.log('Load Database file ' + (err ? err : 'success'));
          callback();
        });
      },
      loadAllData(callback) {

        //加载应用程序设置
        db.find({ type: 'main-settings-data' }, function (err, docs) {
          if(docs != null || docs.length != 0){
            var json = null;
            try{
              json= JSON.parse(docs[0].data);
              main.appSettings = json;

              console.log('Data setting load success, last data save date : ' + docs[0].lastSaveDate);
              main.log('程序设置数据加载成功', { modulname: '数据控制' })
            }
            catch(e){
              console.log('Data setting load failed, use default settings : ' + e);
              main.appSettings = {};
              Utils.cloneValueForce(main.appSettings, main.appSettingsDef);

              //检查以前是否运行过
              if(localStorage.getItem("appVersion") != main.appVesrsion)
                main.appSettings.appFirstLoad = true
              
              main.log('程序设置数据加载失败，使用默认设置', { modulname: '数据控制', level: '错误' })
            }

            //检查是否有空缺的设置
            Object.keys(main.appSettingsDef).forEach(function(key){
              if(typeof main.appSettings[key] == 'undefined') 
                main.appSettings[key] = main.appSettingsDef[key];
            });

            if(main.appSettings.preventAnymouseUse && main.appSettings.managerPassword != '')
              main.systemLocked = true;
            main.loadSettings();
          }

          //应用存储
          localStorage.setItem("appVersion", main.appVesrsion);

          //加载数据
          db.find({ type: 'main-data' }, function (err, docs) {
            if(docs == null || docs.length == 0){
              if(!main.appSettings.appFirstLoad)
                main.$message('软件无法读取数据，可能是数据文件丢失', '提示', { type: 'error', duration: 10000 });
              main.log('没有播放数据，使用默认数据', { modulname: '数据控制', level: '错误' })

              console.log('Data load empty');
            }else{
              var json = null;
              try{
                json= JSON.parse(docs[0].data);
              }
              catch(e){
                main.$message('软件无法读取数据，发生了异常', '提示', { type: 'error', duration: 10000 });
                main.log('播放数据加载失败，' + e, { modulname: '数据控制', level: '错误' })

                console.log('Data load success, but parse json failed : ' + e);
                return;
              }
              main.loadJsonData(json);
              main.log('播放数据加载成功', { modulname: '数据控制' })
              main.dataLastSaveDate = docs[0].lastSaveDate;

              console.log('Data load success, last data save date : ' + docs[0].lastSaveDate);
            }
    
            if(callback)callback();

          });

        });
        
        //加载音乐列表数据
        this.loadMusicList();
      },
      loadMusicList()
      {
        //加载musics文件夹中的音乐
        var dirName = this.process.cwd()  + '\\musics\\';
        fs.readdir(dirName, (err, files) => {
          if(files){
            (function iterator(i){
              if(i == files.length)
                return ;
              fs.stat(path.join(dirName, files[i]), function(err, data){     
                if(data.isFile())            
                  main.musicHistoryList.push(dirName + files[i]);
                iterator(i+1);
              });   
            })(0);
          }
        });
        //加载音乐列表数据
        db.find({ type: 'main-musics-data' }, function (err, docs) {
          if(docs != null || docs.length != 0){
            var json = null;
            try{
              json= JSON.parse(docs[0].data);
            }
            catch(e){
              console.log('Data musics load success, but parse json failed : ' + e);
              main.log('音乐列表数据加载失败，' + e, { modulname: '数据控制', level: '警告' })
              return;
            }
            console.log('Data musics load success, last data save date : ' + docs[0].lastSaveDate);
            json.forEach((k) => {
              main.musicHistoryList.push(k);
            })
          }
        });
      },
      saveAllData(callback){

        //将数据转为可保存JSON
        var data2 = Utils.clone(this.data);
        for (var i = 0, c = data2.length; i < c; i++) {
          var season = data2[i];
          for (var j = 0, d = season.tables.length; j < d; j++) {
            var table = season.tables[j];
            this.clearDataParentTable(table);
          }
        }
        var data3 = JSON.stringify(data2);

        this.log('保存数据', { modulname: '数据控制' })

        //保存数据  
        db.find({ type: 'main-data' }, function (err, docs) {//是否存在旧数据
          if(docs == null || docs.length == 0){
            //插入数据
            db.insert({ type: 'main-data', lastSaveDate: new Date().format('yyyy-MM-dd HH:ii:ss'), data: data3 }, function (err, newDocs) {
              console.log('Save data main-data insert : ' + (err ? err : 'success'));
              main.log('保存播放数据:' + (err ? '失败：' + err : '成功'), { modulname: '数据控制', level: (err ? '错误' : '信息') })
              main.saveAllDataSettings(() => {
                main.saveAllDataList(callback);
              });
            });
          }else{
            //更新数据
            db.update({ type: 'main-data' }, { type: 'main-data', lastSaveDate: new Date().format('yyyy-MM-dd HH:ii:ss'), data: data3 }, function (err, newDocs) {
              console.log('Save data main-data update : ' + (err ? err : 'success'));
              main.log('保存播放数据:' + (err ? '失败：' + err : '成功'), { modulname: '数据控制', level: (err ? '错误' : '信息') })
              main.saveAllDataSettings(() => {
                main.saveAllDataList(callback);
              });
            });
          }
        });
      },
      saveAllDataSettings(callback){

        this.saveSettings();
        var dataSettings = JSON.stringify(this.appSettings);

        //保存系统设置数据
        db.find({ type: 'main-settings-data' }, function (err, docs) {//是否存在旧数据
          if(docs == null || docs.length == 0){
            //插入数据
            db.insert({ type: 'main-settings-data', lastSaveDate: new Date().format('yyyy-MM-dd HH:ii:ss'), data: dataSettings }, function (err, newDocs) {
              console.log('Save data main-settings-data insert : ' + (err ? err : 'success'));
              if(callback)callback();
            });
          }else{
            //更新数据
            db.update({ type: 'main-settings-data' }, { type: 'main-settings-data', lastSaveDate: new Date().format('yyyy-MM-dd HH:ii:ss'), data: dataSettings }, function (err, newDocs) {
              console.log('Save data main-settings-data update : ' + (err ? err : 'success'));
              if(callback)callback();
            });
          }
        });
      },
      saveAllDataList(callback){

        var data = Utils.clone(this.musicHistoryList);
        var data2 = [];

        var dirName = this.process.cwd()  + '\\musics\\';
        data.forEach((item) => {
          if(item.indexOf(dirName) != 0) data2.push(item);
        });

        var dataMusic = JSON.stringify(data2);

        //保存音乐列表数据
        db.find({ type: 'main-musics-data' }, function (err, docs) {//是否存在旧数据
          if(docs == null || docs.length == 0){
            //插入数据
            db.insert({ type: 'main-musics-data', lastSaveDate: new Date().format('yyyy-MM-dd HH:ii:ss'), data: dataMusic }, function (err, newDocs) {
              console.log('Save data main-musics-data insert : ' + (err ? err : 'success'));
              if(callback)callback();
            });
          }else{
            //更新数据
            db.update({ type: 'main-musics-data' }, { type: 'main-musics-data', lastSaveDate: new Date().format('yyyy-MM-dd HH:ii:ss'), data: dataMusic }, function (err, newDocs) {
              console.log('Save data main-musics-data update : ' + (err ? err : 'success'));
              if(callback)callback();
            });
          }
        });
      },
      saveAndReloadData(){
        try{
          var loading = this.$loading({
            lock: true,
            text: '正在保存数据，请稍后',
            spinner: 'el-icon-loading',
            background: 'rgba(255, 255, 255, 0.8)'
          });
          this.saveAllData(()=>{
            loading.close();
            this.loadJsonData(this.data);
            this.$message({
              message: '数据保存成功',
              type: 'success'
            });
          });
        }catch(e){
          this.$alert('数据保存失败。' + e, '提示', {
            confirmButtonText: '确定',
            type: 'warning'
          });
        }
      },
      forceClearData(){
        this.$confirm('您真的要清除数据? 此操作不可恢复！', '提示', {
          confirmButtonText: '清除',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loadJsonData([]);
          this.$message('强制清除数据成功');
        }).catch(() => {});
      },
      loadSettings() {
        if(this.appSettings.appFirstLoad){
          this.appSettings.appFirstLoad = false;
          this.showFirstView();
        }
        this.playingMusicVolume = this.appSettings.playingMusicVolume;
        this.musicPlayingListShow = this.appSettings.musicPlayingListShow;
        maxUserOutTime = this.appSettings.autoLockMaxMinute;
        if(this.appSettings.developerMode)
          this.turnOnDeveloperMode();
        //Title
        if(!Utils.isNullOrEmpty(this.appSettings.appTitle)){
          document.getElementsByTagName('title')[0].innerText = this.appSettings.appTitle;
          document.getElementById('login-app-title').innerText = this.appSettings.appTitle;
        }
        bellsWin32.setPowerStateEnable(this.appSettings.preventSleep);
        globalTid = this.appSettings.idStorage.tid;
        globalBid = this.appSettings.idStorage.bid;
        globalSid = this.appSettings.idStorage.sid;
      },
      saveSettings(){
        this.appSettings.playingMusicVolume = this.playingMusicVolume;
        this.appSettings.musicPlayingListShow = this.musicPlayingListShow;
        this.appSettings.idStorage.tid = globalTid;
        this.appSettings.idStorage.bid = globalBid;
        this.appSettings.idStorage.sid = globalSid;
      },
      displayJsonData(){
        //将数据转为可保存JSON
        var data2 = Utils.clone(this.data);
        for (var i = 0, c = data2.length; i < c; i++) {
          var season = data2[i];
          for (var j = 0, d = season.tables.length; j < d; j++) {
            var table = season.tables[j];
            this.clearDataParentTable(table);
          }
        }
        this.testJSONData = JSON.stringify(data2);
      },
      loadJsonData(json){
        if(!json){
          console.log('Data failed empty data');
          return;
        }
        this.data = json;
        //转 某些 json 属性为类
        for (var i = 0, c = this.data.length; i < c; i++) {
          var season = this.data[i];
          season.playTime = WorkerUtils.PlayDate.fromJsonObject(season.playTime);
          if(globalSid < season.sid) globalSid = season.sid;
          for (var j = 0, d = season.tables.length; j < d; j++) {
            var table = season.tables[j];
            var tableOldplayConditions = table.playConditions;
            table.playConditions = [];//新条件数组
            for (var k = 0, e = tableOldplayConditions.length; k < e; k++)
              table.playConditions.push(WorkerUtils.PlayContidion.fromJsonObject(tableOldplayConditions[k]));//类
            var tableOldtasks = table.tasks;
            table.tasks = [];//新任务数组
            for (var k = 0, e = tableOldtasks.length; k < e; k++)
              table.tasks.push(WorkerUtils.PlayTask.fromJsonObject(tableOldtasks[k]));//转换后类
            this.setDataParentTable(season, table);
          }
        }
        mainAppRunning = true;
        this.currentShowSeason = null;
        this.currentShowTable = null;
        this.switchCurrentSeason();
      },
      
      setDataParentTable(season, table){
        table.season = season;
        table.playedTasks = 0;
        if(globalBid < table.tid) globalBid = table.tid;
        for (var k = 0, e = table.playConditions.length; k < e; k++)
          table.playConditions[k].parent = table;
        for (var k = 0, e = table.tasks.length; k < e; k++){
          table.tasks[k].parent = table;
          table.tasks[k].status = 'notplay';
          if(globalTid < table.tasks[k].sid) globalTid = table.tasks[k].tid;
          for (var j = 0, f = table.tasks[k].playConditions.length; j < f; j++)
            table.tasks[k].playConditions[j].parent = table.tasks[k];
          for (var j = 0, f = table.tasks[k].stopConditions.length; j < f; j++)
            table.tasks[k].stopConditions[j].parent = table.tasks[k];
        }
      },
      clearDataParentTable(table){
        table.season = undefined;
        for (var k = 0, e = table.playConditions.length; k < e; k++)
          table.playConditions[k].parent = undefined;
        for (var k = 0, e = table.tasks.length; k < e; k++){
          table.tasks[k].parent = undefined;
          table.tasks[k].status = undefined;
          table.tasks[k].playedCommands = undefined;
          table.tasks[k].playeError = undefined;
          table.tasks[k].playingMid = undefined;
          for (var j = 0, f = table.tasks[k].playConditions.length; j < f; j++)
            table.tasks[k].playConditions[j].parent = undefined;
          for (var j = 0, f = table.tasks[k].stopConditions.length; j < f; j++)
            table.tasks[k].stopConditions[j].parent = undefined;
        }
      },

      /*锁定解锁 */
      switchSystemLock(byUser){
        if(this.systemLocked) {
          this.systemLocked = false;
          return true
        }
        else{
          if(this.appSettings.preventAnymouseUse 
            && !Utils.isNullOrEmpty(this.appSettings.managerPassword)){
            this.systemLocked = true;
            return true
          }else if(byUser){
            this.$alert("看起来您没有设置管理员密码，您需要设置管理员密码才能使用锁定功能<br>" + 
            "您可以转到 设置><a href=\"javascript:;\" onclick=\"main.editSetings('security')\">安全</a> 来设置管理员密码。", '锁定提示',{dangerouslyUseHTMLString:true});
          }
        }
      },
      doLogin(){
        if(this.systemLockEnterPassword == this.appSettings.managerPassword){
          this.systemLockEnterPassword = '';
          this.switchSystemLock();
        }
        else{
          this.$alert('管理员密码不正确', '锁定提示', { type: 'error' });
          this.log('验证登录密码错误', { modulname: '安全控制' })
        }
      },
      
      /*初始欢迎界面和引导 */
      showFirstView(){
        this.showFirstIntroDialog = true;
      },
      closeIntroDialog(){
        this.showFirstIntroDialog = false;
        this.runTour();
      },
      runTour(){
        //load data for tour
        if(!this.data || this.data.length == 0){
          this.data = require('./assets/data/data-example.json');
          this.loadJsonData(this.data);
        }
        // Show the tour
        $('#walkthrough-content').prop('style','');
        $('body').pagewalkthrough({
          name: 'introduction',
          steps: [
          { popup: {content: '#walkthrough-1', type: 'modal',width:'370px' }
          }, {wrapper: '#side_top',popup: {content: '#walkthrough-2', type: 'tooltip',position: 'right', offsetVertical: 20,}
          }, {wrapper: '#table_area',popup: {content: '#walkthrough-3', type: 'tooltip',position: 'right', offsetVertical: 200 }
          }, {wrapper: '#main_area',popup: {content: '#walkthrough-4', type: 'tooltip',position: 'left', width: '150px', offsetVertical: 200, offsetHorizontal: 25, offsetArrowHorizontal: 25 }
          }, {wrapper: '#side_bottom',popup: {content: '#walkthrough-5', type: 'tooltip',position: 'right'}
          }, {wrapper: '#btn-help',popup: {content: '#walkthrough-6', type: 'tooltip',position: 'right'}
          }, {wrapper: '#music_player_controls_area',popup: {content: '#walkthrough-7', type: 'tooltip', position: 'left', width: '300px', offsetVertical: -50, offsetHorizontal: -15 }
          }, { popup: {content: '#walkthrough-8', type: 'modal' }
          }],
          buttons: {
            jpwClose: {
              i18n: "点击关闭"
            },
            jpwNext: {
              i18n: "下一步 &rarr;"
            },
            jpwPrevious: {
              i18n: "&larr; 上一步"
            },
            jpwFinish: {
              i18n: "完成 &#10004;"
            }
          }
        });
        $('body').pagewalkthrough('show');
      },
      closeTour(){
        $('body').pagewalkthrough('close');
      },

      /*状态控制 */
      switchShowCurrentSeason(season) {
        if (season != this.currentShowSeason){
          if(this.currentShowTable && this.currentShowTable.season == this.currentShowSeason)
            this.currentShowTable = null;

          this.currentShowSeasonLoading = true;
          this.timeDelayLeftSwitch = setTimeout(() => {
            this.currentShowSeasonLoading = false;
            this.currentShowSeason = season;
            this.switchSeasonTablesStatus(season);
            this.timeDelayLeftSwitch = null
          }, 200)
        }
      },
      switchShowCurrentTable(table){
        if(!this.timeDelayMainSwitch && table != this.currentShowTable){
          this.currentShowTable = null;
          this.currentShowDataLoading = true;
          this.timeDelayMainSwitch = setTimeout(() => {
            this.currentShowDataLoading = false;
            this.currentShowTable = table;
            this.timeDelayMainSwitch = null
          }, 200)
        }
      },
      switchCurrentSeason() {
        for (var i = 0, c = this.data.length; i < c; i++) {
          var season = this.data[i];
          if (season.enabled && (season.manualPlay || season.playTime.isPlayingTime())) {
            season.playing = true;
            if(this.currentShowSeason == null)
              this.currentShowSeason = season;
          }else season.playing = false;
          this.switchSeasonTablesStatus(season);
        }
      },
      switchSeasonTablesStatus(season) {
        for (var i = 0, c = season.tables.length; i < c; i++) {
          var table = season.tables[i];
          this.switchTableStatus(table);
        }
      },
      switchTableStatus(table) {
        var playing = false;
        if (table.season.playing) {
          if (!table.enabled) {
            table.status = 'disabled'
            table.playedTasks = 0;
          }else if (table.alwaysPlay) {
            playing = true;
          }else for (var j = 0, d = table.playConditions.length; j < d; j++) {
            if (table.playConditions[j].isPlayingTime()) {
              playing = true;
              break;
            }
          }   
        }    

        if (playing) {
          table.status = 'playing'
          if(table.season == this.currentShowSeason && this.currentShowTable == null)
            this.currentShowTable = table;
        }
        else {
          table.status = 'notplay';
          table.playedTasks = 0;
        }
        //更新时钟列表
        this.taskTickLateUpdate();
      },


      /*设置操作事件*/
      switchAutoStart(enable){
        var rs = bellsWin32.setAutoStartEnable(enable);
        this.autoStartStatus = this.getAutoStartStatus();
        this.$message((enable ? '设置' : '取消') + '开机启动' + (rs ? '成功' : '失败'), {
          type: rs ? 'success' : 'error'
        })
      },
      getAutoStartStatus(){
        try{
          return bellsWin32.getAutoStartEnabled() ? '已设置开机启动' : '未设置开机启动';
        }catch{
          return '未知';
        }
      },
      editManagerPassword(isAdd){
        this.currentIsAddManagerPassword = isAdd;
        this.showEditManagerPasswordDialog = true;
      },
      editManagerFinish(save){
        if(save){
          this.$refs['formPassword'].validate((valid) => {
            if (valid) {
              if(this.currentIsAddManagerPassword){
                this.appSettingsBackup.managerPassword = this.managerPasswordEditor.new;
                this.appSettings.managerPassword = this.managerPasswordEditor.new;
                this.managerPasswordEditor.old = '';
                this.managerPasswordEditor.new = '';
                this.managerPasswordEditor.newCheck = '';
                this.showEditManagerPasswordDialog = false;
                this.$message('修改管理员密码成功', {
                  type: 'success'
                })
              }else {
                if(this.appSettingsBackup.managerPassword == this.managerPasswordEditor.old){
                  this.appSettingsBackup.managerPassword = this.managerPasswordEditor.new;
                  this.appSettings.managerPassword = this.managerPasswordEditor.new;
                  this.managerPasswordEditor.old = '';
                  this.managerPasswordEditor.new = '';
                  this.managerPasswordEditor.newCheck = '';
                  this.$message('修改管理员密码成功', {
                    type: 'success'
                  })
                  this.showEditManagerPasswordDialog = false;
                }else{
                  this.$message('无法修改管理员密码，旧密码错误', {
                    type: 'erroe'
                  })
                }
              }
            } else {
              this.$message('请完善信息', {
                type: 'warning'
              })
              return false;
            }
          });
        }else this.showEditManagerPasswordDialog = false;
      },
      clearManagerPassword(){
        this.$confirm('您真的要删除已设置的管理员密码? 删除管理员密码以后将不能使用安全功能！', '提示', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$prompt('请输入原密码', '提示', {
            inputType: 'password',
            inputValidator: function(t){
              if(t=='')return '请输入密码'
              else if(t.length < 6)return '密码长度必须大于等于 6 位'
              return true
            },
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
          }).then(({ value }) => {
            if(value == this.appSettings.managerPassword){
              this.appSettings.managerPassword = '';
              this.appSettingsBackup.managerPassword = '';
              this.$message({
                type: 'success',
                message: '删除管理员密码成功！ '
              });
            }else {
              this.$alert('管理员密码不正确', '修改密码提示', { type: 'error' })
              this.log('在清除管理员密码时验证登录密码错误', { modulname: '安全控制' })
            }
          }).catch(() => {});
        }).catch(() => {});
      },
      editSetings(tab){
        this.developModeTestCkick = 0;
        this.settingsActiveTab = tab;
        this.appSettingsBackup = Utils.clone(this.appSettings);
        this.showSettingsDialog = true;
        this.autoStartStatus = this.getAutoStartStatus();
      },
      editSetingsFinish(save){
        if(save){
          Utils.cloneValue(this.appSettings, this.appSettingsBackup);
          this.loadSettings();
        }
        this.appSettingsBackup = null,
        this.showSettingsDialog = false;
      },
      editSetingsDef(){
        this.$confirm('您是否希望恢复默认设置? ', '提示', {
          confirmButtonText: '恢复默认',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          Utils.cloneValueForce(this.appSettings, this.appSettingsDef);
          Utils.cloneValueForce(this.appSettingsBackup, this.appSettingsDef);
          this.$message({
            type: 'success',
            message: '已恢复默认设置'
          });
        }).catch(() => {});
      },
      /*季节操作事件*/
      manualSetSeasonClear(){
        if(this.currentEditSeason && this.currentEditSeason.manualPlay){
          this.currentEditSeason.manualPlay = false;
          this.switchCurrentSeason();
          this.$message({
            type: 'success',
            message: '清除手动设置的时令成功！'
          });
        }else{
          this.$message({
            type: 'message',
            message: '当前没有手动设置的时令'
          });
        }
      },
      manualSetToCurrent(){
        this.$confirm('您希望手动将此时令设为当前时令?手动设置以后将不能通过时间自动切换时令', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.currentEditSeason.manualPlay = true;
          this.switchCurrentSeason();
          this.$message({
            type: 'success',
            message: '手动时令设置成功!'
          });
        }).catch(() => {});
      },
      deleteSeason(){
        this.$confirm('您真的要删除此时令? <b class="text-danger">其下所有时间表将会被删除，此操作不可恢复！</b>' + 
        '<br>时令名称：<span class="text-important">' + this.currentEditSeason.name + '</span>' + 
        '<br>时令备注：<span class="text-important">' + this.currentEditSeason.note + '</span>', '提示', {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if(this.currentShowTable && this.currentShowTable.season == this.currentEditSeason)
            this.currentShowTable = null;
          if(this.currentShowSeason == this.currentEditSeason)
            this.currentShowSeason = null;
          
          this.data.splice(this.data.indexOf(this.currentEditSeason), 1);
          this.currentEditSeason = null;
          this.$message({
            type: 'success',
            message: '时令已删除'
          });
        }).catch(() => {});
      },
      addSeason(){
        globalSid++;
        this.currentIsAddSeason = true;
        this.currentEditSeason = {
          name: '新时令',
          note: '',
          manualPlay: false,
          playing: false,
          enabled: true,
          playTime: new WorkerUtils.PlayDate('1/1', '12/31', false),
          tables: [],
          sid: globalSid
        };
        this.currentEditSeasonBackup = Utils.clone(this.currentEditSeason);
        this.showEditSeasonDialog = true;
      },
      editSeason(){
        this.currentIsAddSeason = false;
        this.currentEditSeasonBackup = Utils.clone(this.currentEditSeason);
        this.showEditSeasonDialog = true;
      },
      editSeasonFinish(save){
        this.showEditSeasonDialog = false;
        if(save){
          Utils.cloneValue(this.currentEditSeason, this.currentEditSeasonBackup);
          if(this.currentIsAddSeason)
            this.data.push(this.currentEditSeason);
          this.switchCurrentSeason();
        }
        this.currentEditSeason = null;
        this.currentEditSeasonBackup = null;
      },
      deleteTable(){
        this.$confirm('您真的要删除此时间表? <b class="text-danger">注意，此操作不可恢复！</b>' + 
        '<br>时间表名称：<span class="text-important">' + this.currentEditTable.name + '</span>' + 
        '<br>时间表备注：<span class="text-important">' + this.currentEditTable.note + '</span>', '提示', {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {

          var season = this.currentEditTable.season;
          if(this.currentShowTable == this.currentEditTable)
            this.currentShowTable = null;
          var tablesArr = season.tables;
          tablesArr.splice(tablesArr.indexOf(this.currentEditTable), 1);
          this.currentEditTable = null;

          this.switchSeasonTablesStatus(season);
          this.$message({
            type: 'success',
            message: '时间表已删除'
          });
        }).catch((e) => { console.log(e) });
      },      
      addTable(){
        globalBid++;
        this.currentIsAddTable = true;
        this.currentEditTable = {
          name: '新时间表',
          note: '',
          status: '',
          enabled: true,
          alwaysPlay: false,
          season: this.currentShowSeason,
          playConditions: [],
          playedTasks: 0,
          tasks: [],
          tid: globalBid
        };
        this.currentEditTableBackup = Utils.clone(this.currentEditTable);
        this.showEditTableDialog = true;
      },
      editTable(){
        this.currentIsAddTable = false;
        this.currentEditTableBackup = Utils.clone(this.currentEditTable);
        this.setDataParentTable(this.currentEditTableBackup.season, this.currentEditTableBackup);
        this.showEditTableDialog = true;
      },
      moveTable(){
        this.chooseTarget((choosedSeason) => {
          this.currentEditTable.season.tables.splice(this.currentEditTable.season.tables.indexOf(this.currentEditTable), 1);
          this.currentEditTable.season = choosedSeason;
          choosedSeason.tables.push(this.currentEditTable);

          this.switchSeasonTablesStatus(choosedSeason);
          this.$message({ message: '移动时间表成功！', type: 'success' });
        }, '选择要将这个时间表移动到的目标时令', 'season');
      },
      copyTable(){
        this.chooseTarget((choosedSeason) => {
          globalBid++;
          var newTable = {};
          Utils.cloneValueForce(newTable, this.currentEditTable) ;
          newTable.tid = globalBid;
          newTable.name += ' (复制)';
          newTable.tasks = [];

          //克隆子任务
          for (var i = 0, c = this.currentEditTable.tasks.length; i < c; i++) {
            newTable.tasks.push(this.currentEditTable.tasks[i].clone());
          }

          choosedSeason.tables.push(newTable);

          this.switchSeasonTablesStatus(choosedSeason);
          this.$message({ message: '复制时间表成功！', type: 'success' });
        }, '选择要将这个时间表复制到的目标时令', 'season');
      },
      editTableFinish(save, check){
        
        if(save){
          if(!check && (!this.currentEditTableBackup.alwaysPlay && this.currentEditTableBackup.playConditions.length == 0)){
            this.$confirm('当前时间表没有添加任何播放条件，这意味着它永远也不能被自动播放，是否继续？', '提示', {
              confirmButtonText: '返回添加播放条件',
              cancelButtonText: '继续保存',
              type: 'warning'
            }).then(() => {}).catch(() => { this.editTableFinish(save, true); });
            return
          }else{
            Utils.cloneValue(this.currentEditTable, this.currentEditTableBackup);
            if(this.currentIsAddTable)
              this.currentShowSeason.tables.push(this.currentEditTable);
            this.switchTableStatus(this.currentEditTable);
          }
        }
        this.showEditTableDialog = false;
        this.currentEditTable = null;
        this.currentEditTableBackup = null;
      },
      addCondition(table, list, allowType){
        this.currentIsAddCondition = true;
        this.currentEditConditionAllowTypes = allowType;
        this.currentEditCondition = new WorkerUtils.PlayContidion('星期', 1);
        this.currentEditCondition.parent = table;
        this.currentEditConditionList = list;
        this.currentEditConditionBackup = this.currentEditCondition.clone();
        this.showEditConditionDialog = true;
      },
      deleteCondition(condition){
        this.currentEditCondition = condition;
        this.$confirm('您真的要删除此播放条件吗？' + 
          '<br>播放条件<span class="text-important">' + this.currentEditCondition.getFriendlyString() + '</span>', '提示 ', {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.currentEditCondition.parent.playConditions.splice(
            this.currentEditCondition.parent.playConditions.indexOf(this.currentEditCondition), 1);
          this.switchTableStatus(this.currentEditCondition.parent);
          this.currentEditCondition = null;
          this.$message({
            type: 'success',
            message: '播放条件已删除'
          });
        }).catch((e) => {
          console.log(e);
        });
      },
      findCondition(condition, playConditionsList){
        for (var k = 0, e = playConditionsList.length; k < e; k++)
          if(playConditionsList[k].equals(condition))
            return playConditionsList[k];
        return null;
      },
      editCondition(condition, list, allowType){
        this.currentIsAddCondition = false;
        this.currentEditConditionAllowTypes = allowType;
        this.currentEditCondition = condition;
        this.currentEditConditionList = list;
        this.currentEditConditionBackup = this.currentEditCondition.clone();
        this.showEditConditionDialog = true;
      },
      editConditionFinish(save){
        if(save){
          var oldCon = this.findCondition(this.currentEditConditionBackup, this.currentEditConditionList);
          if(oldCon && oldCon != this.currentEditCondition){
            this.$alert('当前时间表已经有一个 “' + this.currentEditConditionBackup.getFriendlyString() + '” 的播放条件，请不要重复添加同样的条件。', '提示', { confirmButtonText: '确定' });
            return;
          }
          this.currentEditCondition.copyValue(this.currentEditConditionBackup);
          if(this.currentIsAddCondition)
            this.currentEditConditionList.push(this.currentEditCondition);
        }
        this.showEditConditionDialog = false;
        this.currentEditCondition = null;
        this.currentEditConditionBackup = null;
      },
      moveTask(){
        this.chooseTarget((choosedTable) => {
          this.currentEditTask.parent.tasks.splice(this.currentEditTask.parent.tasks.indexOf(this.currentEditTask), 1);
          if(this.currentEditTask.parent.status == 'playing')
            this.switchTableStatus(this.currentEditTask.parent);
          
          this.currentEditTask.parent = choosedTable;
          choosedTable.tasks.push(this.currentEditTask);

          if(choosedTable.status == 'playing')
            this.switchTableStatus(choosedTable);
          this.$message({ message: '移动任务成功！', type: 'success' });
        }, '选择要将此任务移动到哪个时间表', 'table');
      },
      copyTask(){
        this.chooseTarget((choosedTable) => {
          globalTid++;
          var newTask = this.currentEditTask.clone();
          newTask.tid = globalTid;
          newTask.parent = choosedTable;
          newTask.name += ' (复制)';
          choosedTable.tasks.push(newTask);

          if(choosedTable.status == 'playing')
            this.switchTableStatus(choosedTable);
          this.$message({ message: '复制任务成功！', type: 'success' });
        }, '选择要将此任务复制到哪个时间表', 'table');
      },
      copyCheckedTask(){
        if(this.mainSelection && this.mainSelection.length > 0){
          this.chooseTarget((choosedTable) => {
            for (var i = 0, c = this.mainSelection.length; i < c; i++){
              globalTid++;
              var newTask = this.mainSelection[i].clone();
              newTask.tid = globalTid;
              newTask.name += ' (复制)';
              newTask.parent = choosedTable;
              choosedTable.tasks.push(newTask);
            }
            if(choosedTable.status == 'playing')
              this.switchTableStatus(choosedTable);
            this.$message({ message: '复制 ' + this.mainSelection.length + ' 条任务成功！', type: 'success' });
          }, '选择要将这些任务复制到哪个时间表', 'table');
        }
      },
      deleteTask(){
        this.$confirm('您真的要删除此任务? 注意，此操作不可恢复！' + 
          '<br>任务名称：<span class="text-important">' + this.currentEditTask.name + '</span>' + 
          '<br>任务备注：<span class="text-important">' + this.currentEditTask.note + '</span>', '提示', {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.currentEditTask.parent.tasks.splice(this.currentEditTask.parent.tasks.indexOf(this.currentEditTask), 1);
          if(this.currentEditTask.parent.status == 'playing')
            this.switchTableStatus(this.currentEditTask.parent);
          this.currentEditTask = null;
          this.$message({
            type: 'success',
            message: '时间表已删除'
          });
        }).catch(() => {});
      },   
      deleteCheckedTask(){
        if(this.mainSelection && this.mainSelection.length > 0){
          this.$confirm('您真的要删除选中的 ' + this.mainSelection.length + ' 条任务? <b class="text-danger">注意，此操作不可恢复！</b>', '提示', {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            var deleteedTask = 0;
            var newTasksArr = [];
            var table = this.currentEditTask.parent;
            var findTaskInSelection = (tid) => {
              for (var i = 0, c = this.mainSelection.length; i < c; i++)
                if(this.mainSelection[i].tid == tid) return true;
              return false
            };
            //重组
            for (var i = 0, c = table.tasks.length; i < c; i++) {
              if(findTaskInSelection(this.currentEditTask.parent.tasks[i].tid)) deleteedTask++;
              else newTasksArr.push(this.currentEditTask.parent.tasks[i]);
            }

            table.tasks = newTasksArr;
            if(table == this.currentShowTable){
              this.currentShowTable = null;
              this.switchShowCurrentTable(table);
            }

            //更新时钟
            if(table.status == 'playing')
              this.switchTableStatus(table);
            this.$message({
              type: 'success',
              message: '成功删除 ' + deleteedTask + ' 条任务'
            });
          }).catch(() => {});
        }
      },    
      addTask(){
        this.currentIsAddTask = true;
        this.currentEditTask = new WorkerUtils.PlayTask('新任务','',[],[],[]);
        this.currentEditTask.parent = this.currentShowTable;
        this.currentEditTaskBackup = this.currentEditTask.clone();
        this.showEditTaskDialog = true;
      },
      editTask(){
        this.currentIsAddTask = false;
        this.currentEditTaskBackup = this.currentEditTask.clone(this.currentEditTask.tid);
        this.showEditTaskDialog = true;
      },
      editTaskFinish(save, noCheck){ 
        if(save){
          //检测用户添加的条件个数，并提示
          if(!noCheck){
            if(this.currentEditTaskBackup.playConditions.length == 0){
              this.$confirm('当前任务没有添加任何播放条件，这意味着它永远也不能被自动播放，是否继续？', '提示', {
                confirmButtonText: '返回添加播放条件',
                cancelButtonText: '继续保存',
                type: 'warning'
              }).then(() => {}).catch(() => { this.editTaskFinish(save, true); });
              return;
            }else{
              //检测用户添加的精确时间条件个数
              var timeConCount = 0;
              for (var k = 0, e = this.currentEditTaskBackup.playConditions.length; k < e; k++)
                if(this.currentEditTaskBackup.playConditions[k].type == '时间') timeConCount++;
              if(timeConCount != 1){
                this.$confirm('当前任务没有添加任何精确 时间 播放条件，它无法被自动播放，是否继续？', '提示', {
                  confirmButtonText: '返回',
                  cancelButtonText: '继续保存',
                  type: 'warning'
                }).then(() => {}).catch(() => { this.editTaskFinish(save, true); });
                return;
              }
            }
          }
          this.currentEditTask.copyValue(this.currentEditTaskBackup);
          if(this.currentIsAddTask)
            this.currentEditTask.parent.tasks.push(this.currentEditTask);
          //如果任务处于正在播放的列表，须更新时钟
          if(this.currentEditTask.parent.status == 'playing')
            this.taskTickLateUpdate();
        }
        this.showEditTaskDialog = false;
        this.currentEditTask = null;
        this.currentEditTaskBackup = null;
      },

      chooseTarget(callback, text, type){
        this.showChooseTargetDialog = true;
        this.chooseTargetText = text;
        this.chooseTargetCallback = callback;
        this.chooseTargetType = type;
        this.chooseTargetValue = 0;
      },
      chooseTargetFinish(save){
        if(save){
          if(this.chooseTargetType == 'season'){
            for (var i = 0, c = this.data.length; i < c; i++) {
              if(this.data[i].sid == this.chooseTargetValue){
                if(this.chooseTargetCallback)this.chooseTargetCallback(this.data[i]);
                break;
              }
            }
          }else if(this.chooseTargetType == 'table'){
            for (var i = 0, c = this.data.length; i < c; i++) {
              var season = this.data[i];
              for (var j = 0, d = season.tables.length; j < d; j++) {
                var table = season.tables[j];
                if(table.tid == this.chooseTargetValue){
                  if(this.chooseTargetCallback)this.chooseTargetCallback(table);
                  break;
                }
              }
            }
          }
        }
        this.chooseTargetValue = 0;
        this.showChooseTargetDialog = false;
      },
      playTaskUser(){
        this.$confirm('您是否希望立即开始'+(this.currentEditTask.type=='播放音乐'?'播放':'执行')+'此任务? <br>任务名：<span class="text-important">' + this.currentEditTask.name + '</span>', '提示', {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '播放',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.playTask(this.currentEditTask);
          this.$message({
            type: 'success',
            message: '已开始播放'
          });
        }).catch(() => {});
      },
      playTask(task){
        if(task.status != 'playing') {
          this.log('执行任务：' + task.name + ' (' + task.tid + ')', { 
            modulname: '自动执行器' ,
            table: task.parent.name,
            season: task.parent.season.name
          })
          if(task.type == '播放音乐'){
            var musicArgs = {
              musicVolume: task.musicVolume,
              musicLoopCount: task.musicLoopCount,
              musicTimeLimit: task.musicTimeLimit.hour * 3600 + task.musicTimeLimit.minute * 60 + task.musicTimeLimit.second,
              musicStartPos: task.musicStartPos.hour * 3600 + task.musicStartPos.minute * 60 + task.musicStartPos.second,
            };
            task.status = 'playing';
            task.playingMid = this.addPlayMusics(task.commands, musicArgs, (status, playedCount, err) => {
              if(task.status != 'played' && status == 'played')
                task.parent.playedTasks += 1;
              if(status == 'error') {
                this.log('播放任务 ' + task.name + ' (' + task.tid + ') 失败：' + err, { 
                  modulname: '音乐播放器' ,
                  table: task.parent.name,
                  season: task.parent.season.name
                })
                this.$message({ message: '播放任务失败：' + err, type: 'error', duration: 5000 })
              }
              task.status = status;
              task.playedCommands = playedCount;
              task.playeError = err;
              task.playingMid = null;
            });
          }else if(task.type == '执行命令'){
            for (var i = 0, c = task.commands.length; i < c; i++)
              this.runCommand(task.commands[i]);
          }else if(task.type == '关闭计算机'){
            this.executeShutdown();
          }
        }
      },
      stopTask(task){
        if(task.playingMid){
          this.log('停止任务：' + task.name + ' (' + task.tid + ')', { 
            modulname: '自动执行器',
            table: task.parent.name,
            season: task.parent.season.name 
          })
          this.stopPlayMusic(task.playingMid);
          task.playingMid = null;
        }
      },
      deleteCommand(index, commands){
        this.$confirm('您真的要删除此命令吗? ', '提示', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          commands.splice(index, 1);
        }).catch(() => {});
      },
      chooseCommandMusic(index, commands){
        this.chooseMusic({type:'chooseCommandMusic',index:index});
      },
      chooseCommandMusicInList(index){
        this.chooseMusicCommandIndex=index;
        this.showFastAddListMusicDialog=true;
      },
      commandListMoveUp(index, commands){
        if(index > 0) {
          var temp = commands[index - 1];
          commands[index - 1] = commands[index];
          commands[index] = temp;
        }
      },
      commanListMoveDown(index, commands){
        if(index < commands.length - 1) {
          var temp = commands[index + 1];
          commands[index + 1] = commands[index];
          commands[index] = temp;
        }
      },
      setCommandMusic(index, value){
        main.currentEditTaskBackup.commands[index]=value;
      },
      addCommand(commands){
        commands.push('');
      },
      runCommandByUser(command, userLoopMusic){
        var str = '';
        var suffix = Utils.getFileSuffix(command);
        if(suffix == 'mp3' || suffix == 'wav' || suffix == 'ogg')
          str = '您是否希望立即开始'+(userLoopMusic?'循环':'')+'播放此音乐? <br>音乐：<span class="text-important">' + command + '</span>';
        else 
          str = '您是否希望立即开始执行此命令? <br>命令：<span class="text-important">' + command + '</span>';
        this.$confirm(str, '提示', {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '执行',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.runCommand(command, null, true, userLoopMusic);
        }).catch(() => {});
      },
      runCommand(command, musicArgs, byUser, userLoopMusic){
        var suffix = Utils.getFileSuffix(command); 
        if(suffix == 'mp3' || suffix == 'wav' || suffix == 'ogg'){
          if(!musicArgs) musicArgs = {
            musicVolume: -1,
            musicLoopCount: userLoopMusic ? 64 : -1,
            musicTimeLimit: 0,
            musicStartPos: 0,
          };
          this.addPlayMusics([command], musicArgs, (status, playedCount, err) => {
            if(byUser && status == 'error')
              this.$alert('播放任务失败：' + err, { type: 'error' })
          })
        }else{
          console.log('运行命令：' + command);
          this.log('运行命令：' + command, { modulname: '自动执行器' })
          ipc.send('main-act-run-shell', command);
        }
      },
      addPlayMusics(musics, musicArgs, statusChanged){

        //音乐过多，停止
        var maxPlayusicCount = this.appSettings.maxPlayingMusic > 10 ? 10 : this.appSettings.maxPlayingMusic;
        if(this.playingMusic.length >= maxPlayusicCount){
          this.$message('当前正在播放音乐过多，已停止早些时候播放的音乐 (' + this.playingMusic[0].mid + ') ');
          this.stopPlayMusic(this.playingMusic[0]);
          return;
        }
        this.playingMusicId++;

        var mid = this.playingMusicId;
        var id = 'playingMusic_' + mid;
        var currentPlayPath = '';
        
        var parent = document.getElementById('music_player_area');
        var newMusicItem = document.createElement('div');
        var newMusicItemAudio = document.createElement('audio');
        var newMusicItemText = document.createElement('div');
        var newMusicItemSpan = document.createElement('span');
        var newMusicItemProg = document.createElement('div');
        var newMusicItemProg2 = document.createElement('div');
        var newMusicItemIcon = document.createElement('i');
        var newMusicItemControls = document.createElement('div');
        newMusicItemControls.innerHTML = '<div class="btns"><a onclick="main.playPlayMusic(\'' + mid + '\')" id="music_player_item_' + mid + '_play" title="播放" href="javascript:;"><i class="fa fa-play" aria-hidden="true"></i></a>\
<a onclick="main.pausePlayMusic(\'' + mid + '\')" id="music_player_item_' + mid + '_pause" title="暂停" href="javascript:;"><i class="fa fa-pause" aria-hidden="true"></i></a>\
<a onclick="main.stopPlayMusic(\'' + mid + '\')" title="停止播放" href="javascript:;" style="font-size: 16px;"><i class="fa fa-times" aria-hidden="true"></i></a></div>\
<div class="track"><span id="music_player_item_' + mid + '_time">00:00</span><input id="music_player_item_' + mid + '_track" type="range" min="" max="" id="hpro"/></div>';
        newMusicItemControls.setAttribute('class', 'controls');
        newMusicItemControls.setAttribute('style', 'display:none');
        newMusicItemIcon.setAttribute('class', 'task-tag fa fa fa-music');
        newMusicItemIcon.setAttribute('style', 'margin-right: 7px; padding: 5px 7px');
        newMusicItem.setAttribute('class', 'music-item');
        newMusicItemAudio.setAttribute('id', id);
        newMusicItemAudio.setAttribute('controls', 'controls');
        newMusicItemText.setAttribute('class', 'text');
        newMusicItemProg2.setAttribute('class', 'progress-bg');
        newMusicItemProg.setAttribute('class', 'progress');
        parent.appendChild(newMusicItem);
        newMusicItem.appendChild(newMusicItemAudio);
        newMusicItem.appendChild(newMusicItemControls);
        newMusicItem.appendChild(newMusicItemText);
        newMusicItemText.appendChild(newMusicItemIcon);
        newMusicItemText.appendChild(newMusicItemProg2);
        newMusicItemText.appendChild(newMusicItemProg);
        newMusicItemText.appendChild(newMusicItemSpan);

        var newItem = {
          mid: mid,
          musics: musics,
          currentIndex: 0,
          id: id,
          arg: musicArgs,
          htmlItem: newMusicItem,
          audioFading: false,
          audioDurtionString: '',
          swingAnim: false,
          currText: newMusicItemText,
          currTextInner: newMusicItemSpan,
          currProgress: newMusicItemProg,
          currTrack: document.getElementById('music_player_item_' + mid + '_track'),
          currBtnPlay: document.getElementById('music_player_item_' + mid + '_play'),
          currBtnPause: document.getElementById('music_player_item_' + mid + '_pause'),
          currTime: document.getElementById('music_player_item_' + mid + '_time'),
          audio: newMusicItemAudio,
          callback: statusChanged,
        };

        var startAudio = () => {
          fs.exists(currentPlayPath, (exists) => {
            if(exists){

              //查找是否有正在播放的音乐
              for(var i = 0, c = this.playingMusicPaths.length; i < c; i++){
                if(currentPlayPath == this.playingMusicPaths[i]){
                  if(newItem.callback) 
                  newItem.callback('error', newItem.currentIndex + 1, '当前音乐已经在播放中');
                  this.log('播放音乐错误：' + this.getFileName(currentPlayPath) + ' 错误信息 : 当前音乐已经在播放中', { modulname: '音乐播放器', level: '错误' })
                  this.stopPlayMusic(mid, true);
                  return;
                }
              }

              newItem.currTrack.value = 0;
              newItem.currProgress.setAttribute('style', '0%');
              try{
                setTimeout(() => {
                  if(newMusicItemAudio.error != null){
                    var err = '未知错误';
                    switch(newMusicItemAudio.error.code) {
                      case 1: err = '操作被终止';break;
                      case 2: err = '打开文件时出现了错误';break;
                      case 3: err = '无法解码该文件';break;
                      case 4: err = '不支持的音频格式';break;
                    }
                    this.log('播放音乐错误：' + 
                      this.getFileName(currentPlayPath) + 
                      ' 错误信息 : ' + err, { modulname: '音乐播放器', level: '错误' });
                    this.stopPlayMusic(mid, true);
                    if(newItem.callback) 
                      newItem.callback('error', newItem.currentIndex + 1, err);
                  }
                }, 2000);
                
                newMusicItemAudio.load();
                newMusicItemAudio.play();
                if(newItem.callback) 
                  newItem.callback('playing', newItem.currentIndex + 1, null);
                this.log('开始播放音乐：' + this.getFileName(currentPlayPath), { modulname: '音乐播放器' })
              }catch(e){
                if(newItem.callback) 
                  newItem.callback('error', newItem.currentIndex + 1, e);
                this.log('播放音乐错误：' + this.getFileName(currentPlayPath) + ' 错误信息 : ' + e, { modulname: '音乐播放器', level: '错误' })
                this.stopPlayMusic(mid, true);
              }
            }else{
              if(newItem.callback) 
                newItem.callback('error', newItem.currentIndex + 1, '文件不存在');
              this.log('播放音乐错误：' + this.getFileName(currentPlayPath) + ' 错误信息 : 文件不存在', { modulname: '音乐播放器', level: '错误' })
              this.stopPlayMusic(mid, true);
            }
          });
        };
        var timerTick = () => {
          var precent = newMusicItemAudio.currentTime / newMusicItemAudio.duration;

          $(newItem.currTime).text(Utils.getTimeStringSec(newMusicItemAudio.currentTime) + '/' + newItem.audioDurtionString);
          $(newItem.currProgress).css('width', (precent * 100) + '%');

          if(!newMusicItemAudio.trackdown){
            $(newItem.currTrack).val(parseInt(precent * 100));
            $(newItem.currTrack).css('background', 'linear-gradient(to right, #0073bb, #0073bb ' + $(newItem.currTrack).val() + '%, #cecece ' + (parseInt($(newItem.currTrack).val()) + 1) + '%, #cecece)' );
          }

          if(musicArgs.musicTimeLimit > 0){
            //超过限定时间时停止播放
            this.log('音乐任务 ' + mid + ' 超出限定时间 '+musicArgs.musicTimeLimit+' (秒)，停止播放' + newItem.musicLoopCount, { modulname: '音乐播放器' })
            if(newMusicItemAudio.currentTime > musicArgs.musicTimeLimit)
              this.stopPlayMusic(mid);
          }
        }

        //audio事件绑定
        newMusicItemAudio.addEventListener('playing', () => {
          $(newItem.currBtnPlay).css('display', 'none');
          $(newItem.currBtnPause).css('display', 'inline-block');
        });
        newMusicItemAudio.addEventListener('durationchange', () => {
          newItem.audioDurtionString = Utils.getTimeStringSec(newMusicItemAudio.duration)
        });
        newMusicItemAudio.addEventListener('pause', () => {
          $(newItem.currBtnPause).css('display', 'none');
          $(newItem.currBtnPlay).css('display', 'inline-block');
          clearInterval(newItem.timer);
        });
        newMusicItemAudio.addEventListener('play', () => {
          $(newItem.currBtnPause).css('display', 'none');
          $(newItem.currBtnPlay).css('display', 'inline-block');
          newItem.timer = setInterval(timerTick, 500);
        });
        newMusicItemAudio.addEventListener('ended', () => {
          if(newItem.currentIndex < newItem.musics.length - 1){
            //继续播放下一个音乐
            newItem.currentIndex++;
            currentPlayPath = newItem.musics[newItem.currentIndex];
            newMusicItemAudio.src = newItem.musics[newItem.currentIndex];
            newItem.currTextInner.innerText = this.getFileName(currentPlayPath);
            newItem.currTextInner.setAttribute('title', currentPlayPath);
            startAudio();
          }else{
            if(newItem.arg.musicLoopCount > 0){
              newItem.arg.musicLoopCount--;
              //播放完成一次，继续循环一次
              newItem.currentIndex = 0;
              newMusicItemAudio.src = newItem.musics[newItem.currentIndex];
              newItem.currTextInner.innerText = this.getFileName(newItem.musics[newItem.currentIndex]);
              newItem.currTextInner.setAttribute('title', newItem.musics[newItem.currentIndex]);

              startAudio();
            }else{
              //播放完成，停止
              this.stopPlayMusic(newItem.mid);
            }
          }
        });
        newMusicItemAudio.addEventListener('timeupdate', () => {
          
        });

        //条目
        $(newMusicItem).on('mouseleave', () => {
          if(!newMusicItem.gplock) {
            newMusicItem.gplock = setTimeout(() => {
              if($(newMusicItemControls).is(':visible')) {
                newMusicItem.swingAnim = true;
                $(newMusicItemControls).show();
                $(newMusicItemControls).addClass(['animated', 'fadeOutUp']);
                $(newMusicItemControls).on('animationend', () => {
                  $(newMusicItemControls).off('animationend');
                  $(newMusicItemControls).removeClass(['animated', 'fadeOutUp']);
                  $(newMusicItemControls).hide();
                });
                $(newMusicItemText).show();
                $(newMusicItemText).addClass(['animated', 'fadeInUp']);
                $(newMusicItemText).on('animationend', () => {
                  $(newMusicItemText).off('animationend');
                  $(newMusicItemText).removeClass(['animated', 'fadeInUp']);
                  newMusicItem.swingAnim = false;
                });
              }
              clearTimeout(newMusicItem.gplock);
              newMusicItem.gplock = null;
            }, 6000);
          }
        })
        $(newMusicItem).on('mouseenter', () => {
          if(newMusicItem.gplock) {
            clearTimeout(newMusicItem.gplock);
            newMusicItem.gplock = null;
          }
        });
        $(newMusicItem).on('click', () => {
          if(!newMusicItem.swingAnim){
            newMusicItem.swingAnim = true;
            if($(newMusicItemText).is(":visible")){
              $(newMusicItemText).show();
              $(newMusicItemText).addClass(['animated', 'fadeOutDown']);
              $(newMusicItemText).on('animationend', () => {
                $(newMusicItemText).off('animationend');
                $(newMusicItemText).removeClass(['animated', 'fadeOutDown']);
                $(newMusicItemText).hide();
              });
              $(newMusicItemControls).show();
              $(newMusicItemControls).addClass(['animated', 'fadeInDown']);
              $(newMusicItemControls).on('animationend', () => {
                $(newMusicItemControls).off('animationend');
                $(newMusicItemControls).removeClass(['animated', 'fadeInDown']);
                newMusicItem.swingAnim = false;
              });
            }
          }
        });

        //设置属性
        if(musicArgs.musicVolume > -1) newMusicItemAudio.volume = musicArgs.musicVolume / 100.0;
        else newMusicItemAudio.volume = this.playingMusicVolume / 100.0;

        //滑动条事件绑定
        
        //$(newItem.currTrack).RangeSlider({ min: 0,   max: 100,  step: 0.1,  callback: change});
        $(newItem.currTrack).on('input propertychange', function(){
          $(this).css('background', 'linear-gradient(to right, #0073bb, #0073bb ' + $(this).val() + '%, #cecece ' + (parseInt($(this).val()) + 1) + '%, #cecece)' );
        })
        $(newItem.currTrack).on('mousedown', function(){
          newMusicItemAudio.trackdown = true;
        })
        $(newItem.currTrack).on('mouseup', function(){
          newMusicItemAudio.trackdown = false;
          newMusicItemAudio.currentTime = (newItem.currTrack.value / 100.0) * newMusicItemAudio.duration;
        })
          
        //开始播放
        currentPlayPath = newItem.musics[newItem.currentIndex];
        newMusicItemAudio.src = currentPlayPath;
        newItem.currTextInner.innerText = this.getFileName(currentPlayPath);
        newItem.currTextInner.setAttribute('title', currentPlayPath);
        newItem.currProgress.setAttribute('style', '0%');
        startAudio();

        //起始时间属性
        if(newItem.musics.length == 1 && musicArgs.musicStartPos > 0)
          newMusicItemAudio.currentTime = musicArgs.musicStartPos;

        this.playingMusic.push(newItem);
        console.log('Start play music item ' + newItem.mid);
      },
      pausePlayMusic(mid, callback){
        this.playingMusic.forEach(element => {
          if(element.mid == mid && !element.audioFading){
            element.audioFading = true;

            $(element.audio).animate({ volume: 0.01 }, 1000);
            setTimeout(() => { 
              element.audio.pause();
              element.audioFading = false;
              if(callback) callback();
            }, 1000);
          }
        });
      },
      playPlayMusic(mid, callback){
        this.playingMusic.forEach(element => {
          if(element.mid == mid && !element.audioFading){

            element.audioFading = true;
            element.audio.volume = 0.01;
            element.audio.play();

            $(element.audio).animate({ 
              volume: element.arg.musicVolume > -1 ? (element.arg.musicVolume / 100.0) : (this.playingMusicVolume / 100.0) 
            }, 1000);
            setTimeout(() => { 
              element.audioFading = false;
              if(callback) callback();
            }, 1000);
          }
        });
      },
      stopPlayMusic(mid, notCallback){
        this.playingMusic.forEach(element => {
          if(element.mid == mid){

            if(!notCallback && element.callback) element.callback('played', element.currentIndex + 1, null);

            $(element.htmlItem).css('display', 'none');

            var cb = () => {
              console.log('Stop play music item ' + mid);

              this.log('停止播放音乐任务：' + mid, { modulname: '音乐播放器' })
              this.playingMusic.splice(this.playingMusic.indexOf(element), 1);
              document.getElementById('music_player_area').removeChild(element.htmlItem);
              element.audio.src = '';
            };

            this.pausePlayMusic(mid, cb);
          }
        });       
      },
      stopPlayAllMusic(){
        this.playingMusic.forEach(element => {
          if (element.callback)
            element.callback('played', element.currentIndex + 1, null);

          $(element.htmlItem).css('display', 'none');

          var cb = () => {
            console.log('Stop play music item ' + mid);

            this.log('停止播放音乐任务：' + mid, { modulname: '音乐播放器' })
            this.playingMusic.splice(this.playingMusic.indexOf(element), 1);
            document.getElementById('music_player_area').removeChild(element.htmlItem);
            element.audio.src = '';
          };

          this.pausePlayMusic(mid, cb);
        });       
      },
      resetAllPlayMusicVolume(vol){
        this.playingMusic.forEach(element => {
          element.audio.volume = vol / 100.0;
        });
      },
      openAndPlayMusic(){
        this.chooseMusic({type:'openAndPlay'});
      },

      addMusicsToHistoryList(){
        this.chooseMusic({type:'addMusicsToHistoryList'});
      },
      addMusicToHistoryList(music){
        this.musicHistoryList.forEach(element => {
          if(element == music) return;
        });
        this.musicHistoryList.push(music);
      },
      removeMusicFromHistoryList(music){
        this.musicHistoryList.splice(this.musicHistoryList.indexOf(music), 1);
      },

      turnOnDeveloperMode(){
        this.appSettings.developerMode = true;
        this.menuItemDeveloper.visible = true;
      },
      toggleDeveloperMode(){
        if(this.appSettings.developerMode) {
          this.$message('您已经处于开发者模式！', {duration:1000});
        }else if(this.developModeTestCkick < 10) {
          this.developModeTestCkick++;
          if(this.developModeTestCkick >= 3)
            this.$message('再次单击 ' + (11 - this.developModeTestCkick) + ' 次即可进入开发者模式', {duration:600});
        }else if(!this.appSettings.developerMode) {
          this.turnOnDeveloperMode();
          this.$message('您已经处于开发者模式！', {duration:1000});
        }else {
          this.$message('您已经处于开发者模式！', {duration:1000});
        }
      },
      userOutHideOrLock(){
        if(bellsWin32.getIsUserLeave()) this.closeMointor();
        if(this.appSettings.autoHide) this.closeWindow();
        if(this.appSettings.autoLock && !this.systemLocked){
          if(this.switchSystemLock())
            this.log('超时系统无人控制，自动锁定', { modulname: '安全控制' })
        }
      },

      /*ui使用的附加函数*/   
      forceLoadJsonDataUser(){
        if(this.testJSONData == null || this.testJSONData == ''){
          this.$alert('请输入数据然后再导入！');
          return;
        }
        if(!this.data || this.data.length == 0){
          forceLoadJsonData();
          return;
        }else{
          this.$confirm('您是否真的要导入数据 ? 请注意，<span class="text-danger">当前软件的数据将会被覆盖！此操作不能还原</span>', '注意', {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            forceLoadJsonData();
          }).catch(() => {});
        }
      },
      forceLoadJsonData(){
        var json = null;
        try{
          json= JSON.parse(this.testJSONData);
        }
        catch(e){
          this.log('导入数据失败，解析数据失败：' + e, { modulname: '数据控制', level: '错误' })
          this.$alert('无法解析 JSON 数据，可能是您输入的 JSON 格式有误。' + e, '提示', {
            confirmButtonText: '确定',
            type: 'warning'
          });
          return;
        }
        this.loadJsonData(json);
        this.showEditSourceDialog = false;
        this.log('强制导入数据成功', { modulname: '数据控制' })
        this.$alert('数据加载成功', '提示', {
          confirmButtonText: '确定',
          type: 'success'
        });   
      },
      chooseImage(arg) { ipc.send('main-open-file-dialog-image', arg); },
      chooseMusic(arg) { ipc.send('main-open-file-dialog-music', arg); },
      showHelpWindow(ar) { ipc.send('main-act-show-help-window', ar); },
      executeShutdown(){
        ipc.send('main-act-window-control', 'show');
        this.showShutdownDialog = true;
        this.log('关机已启动', { modulname: '自动执行器' })
        this.shutdownTimer = setInterval(() => {
          if(this.shutdownTick>1)
            this.shutdownTick--;
          else this.executeShutdownNow();
        }, 1000);
      },
      shutdownByUser(){
        this.$confirm('您真的要关闭计算机吗? ', '提示', {
          confirmButtonText: '取消',
          cancelButtonText: '关机',
          type: 'warning'
        }).then(() => {
        }).catch((e) => { this.executeShutdownNow(); });
      },
      rebootByUser(){
        this.$confirm('您真的要重启计算机吗? ', '提示', {
          confirmButtonText: '取消',
          cancelButtonText: '关机',
          type: 'warning'
        }).then(() => {
        }).catch((e) => { this.executeRebootNow(); });
      },
      closeMointor(){
        bellsWin32.closeMointor();
      },
      executeShutdownNow(){
        clearInterval(this.shutdownTimer);
        this.saveSettings();
        this.saveAllData(() => {
          //Send shutdown
          ipc.send('main-act-shutdown'); 
        });
      },
      executeRebootNow(){
        this.saveSettings();
        this.saveAllData(() => {
          ipc.send('main-act-reboot'); 
        });
      },
      cancelShutdown(){
        if(this.shutdownTimer){
          clearInterval(this.shutdownTimer);
          this.shutdownTimer=null;
          this.log('取消关机计划', { modulname: '自动执行器' })
        }
      },
      exit() {
        this.showExitDialog = false;
        this.stopPlayAllMusic();

        const loading = this.$loading({
          lock: true,
          text: '正在保存数据，请稍后',
          spinner: 'el-icon-loading',
          background: 'rgba(255, 255, 255, 0.8)'
        });
        this.stopTimer();
        this.saveAllData(function(){
          exitHide(() => {
            loading.close();
            bellsWin32.setPowerStateEnable(false);
            ipc.send('main-act-quit', ''); 
          })
        });
      },
      getPlayConditionString(playConditions) {
        var str = '';
        for (var i = 0, c = playConditions.length; i < c; i++)
          str += playConditions[i].getFriendlyString() + ' ';
        if(str=='') return '没有播放条件';
        else return str + ' 播放';
      },
      getTableStatusString(timetable) {
        switch (timetable.status) {
          case 'notplay': return '今日不播';
          case 'playing': return timetable.playedTasks + '/' + timetable.tasks.length;
          case 'error': return '存在错误';
          case 'disabled': return '已禁用';
        }
        return '';
      },
      getFileName(string){
        return Utils.getFileName(string);
      },
      mainTableSort(a, b){
        return a.getPlayConditionString().localeCompare(b.getPlayConditionString(),'zh-CN');
      },
      loginInputKeyDown(ev){
        if(ev.keyCode == 13){
          this.doLogin();
        }
      },
      getAppBackground(){
        return (this.appSettings && !Utils.isNullOrEmpty(this.appSettings.appBackground))
      },
      getAppBackgroundPath(){
        if(this.appSettings && !Utils.isNullOrEmpty(this.appSettings.appBackground))
          return 'background-image: url(\'file:///' + this.appSettings.appBackground.replace(/\\/g, '/') + '\')';
        return ''
      },
      getCurrentShowSeasonTop(){
        if(this.currentShowSeason)
          return 60 + this.data.indexOf(this.currentShowSeason) * 60;
        return 60;
      },
      flashEleAnim(ele){
        var vclass = $(ele).prop('class');
        if(vclass != 'animing'){
          $(ele).prop('class', 'animing');
          $(ele).prop('data-class', vclass);
          setTimeout(() => {$(ele).prop('class', $(ele).prop('data-class'))}, 300);
        }
      },
      filterNode(value, data) {
        if (!value) return true;
        return data.label.indexOf(value) !== -1;
      },
      showDbPath(){
        electron.shell.openExternal(dbPath);
      },
    },
  });

  var task_area = document.getElementById('task_area');

  /*初始化加载*/
  setTimeout(function () {

    main.process = process;
    main.log('程序已启动', {modulname:'主程序'})
    main.initDatabase(() => {
      main.loadDisplayTimer();
      main.loadMenus();
      main.loadAllData(() => {
        setTimeout(function () { 
          //启动时钟
          main.loadTimer();
          main.loadBaseUI();
          hideIntro();
        }, 1000)
      });
    })
  }, 700);

  //检测用户是否长时间无操作
  var maxUserOutTime = 10;
  var time = maxUserOutTime;
  var timerUserOut = null;
  var timerUserOutTick = function(){
    time--;
    if(time <= 0) {
      if(main) main.userOutHideOrLock();
      clearInterval(timerUserOut);
      timerUserOut = null;
    }
  };
  var resetMaxTime = function(){ 
    time = maxUserOutTime; 
    if (!timerUserOut) 
      timerUserOut = setInterval(timerUserOutTick, 60000);
  };

  setInterval(timerUserOutTick, 60000);

  document.body.addEventListener('mousedown', resetMaxTime);
  document.body.addEventListener('keydown', resetMaxTime);
  document.body.addEventListener('mousemove', resetMaxTime);

  window.onresize = function() {
    if(main && task_area)
      main.mainTableHeight = task_area.offsetHeight - 55;
  }
  window.addEventListener("blur", function () {
  });
  window.addEventListener("focus", function () {
    if (!timerUserOut) 
      timerUserOut = setInterval(timerUserOutTick, 60000);
  });
  window.addEventListener('contextmenu', function (e) { 
    e.preventDefault();
    if(Utils.isEleEditable(e.target)){
      main.menuInput.popup(remote.getCurrentWindow());
    }else if(!Utils.isNullOrEmpty(window.getSelection())){
      main.menuCopy.popup(remote.getCurrentWindow());
    }
  }, false) ;


}
//主进程的ipc
function initIpc() {

  ipc.on('selected-image', function (event, arg, path) {
    if(!path || path.length == 0) 
      return;
    if(arg.type=='chooseBackground'){
      if(main.appSettingsBackup)
        main.appSettingsBackup.appBackground = path[0];
    }
  });
  ipc.on('selected-music', function (event, arg, path) {
    if(!path || path.length == 0) 
      return;
    if(arg.type=='chooseCommandMusic'){
      main.addMusicToHistoryList(path[0]);
      main.setCommandMusic(arg.index, path[0]);
    }
    if(arg.type=='openAndPlay'){
      main.addMusicToHistoryList(path[0]);
      main.addPlayMusics([path[0]], {
        musicVolume: -1,
        musicLoopCount: -1,
        musicTimeLimit: 0,
        musicStartPos: 0,
      });
    }
    if(arg.type=='addMusicsToHistoryList'){
      var index = 0;
      path.forEach(element => {
        if(element!=''){
          main.addMusicToHistoryList(element);
          index++;
        }
      });
      main.$message({
        message: '成功添加 ' + index + ' 首音乐！',
        type: 'success'
      });
    }
  });
  
  ipc.on('main-window-act', function (event, arg) {
    switch (arg) {
      case 'show-exit-dialog': main.showDialogExit(); break;
    }
  });
  
}

//错误检测
window.onerror = function(msg, url, line, col, error) {
  if(!mainAppRunning){
    var error_area = document.getElementById('global-error-info');
    var newErritem = document.createElement('div');
    newErritem.innerHTML = '<span>' + msg + '</span><span class="text-important">' + url + ' ('+line+')</span>';
    error_area.appendChild(newErritem);
    error_area.setAttribute('style', '');
  }else main.logError(msg, url + ' (' + line + ')', '全局错误捕获');
}
//加载
window.onload = function () {
  hideFirstLoad();
  initIpc();
  initVue();
};


//Date format
Date.prototype.format = function (formatStr) {
  var pad = function(num, n){
    var len = num.toString().length;
    while (len < n) {
      num = "0" + num;
      len++;
    }
    return num;
  }
  var str = formatStr;
  str = str.replace(/yyyy|YYYY/, this.getFullYear());
  str = str.replace(/MM/, pad(this.getMonth() + 1, 2));
  str = str.replace(/dd|DD/, pad(this.getDate(), 2));
  str = str.replace(/HH/, pad(this.getHours(), 2));
  str = str.replace(/hh/, pad(this.getHours() > 12 ? this.getHours() - 12 : this.getHours(), 2));
  str = str.replace(/mm/, pad(this.getMinutes(), 2));
  str = str.replace(/ii/, pad(this.getMinutes(), 2));
  str = str.replace(/ss/, pad(this.getSeconds(), 2));
  return str;
}