

/**
 * 播放日期条件
 * @param {*} start 起始日期
 * @param {*} end 结束日期
 * @param {*} always 是否永远成立
 */
var PlayDate = function(start, end, always) {

  this.arr = [ new Date(start),new Date(end) ],
  this.always = always,
  this.testYear = false,
  this.startDate = function(){ return this.arr[0]; };
  this.endDate= function(){ return this.arr[1]; };

  this.isPlayingTime = function() {
    if(this.always) return true;
    var now = new Date();
    var startDate = this.startDate();
    var endDate = this.endDate();
    if(startDate!=null && startDate!="" && endDate!=null && endDate!=""){//时间区间
      if(!this.testYear){
        startDate.setFullYear(2001);
        endDate.setFullYear(2001);
        now.setFullYear(2001);
        //起始时间晚于结束时间
        if(startDate>endDate)
          endDate.setFullYear(2002);
      }
      
      return now >= startDate && now <= endDate;
    }
    else if(startDate!=null && startDate!=""){//时间点
      if(!playtime.testYear){
        startDate.setFullYear(2001);
        now.setFullYear(2001);
      }
      return startDate == now;
    }
    return false;
  };
}

PlayDate.fromJsonObject = function(json){
  var newV = new PlayDate(json.arr[0], json.arr[1], json.always);
  newV.testYear = json.testYear;
  return newV
}

/**
 * 播放条件
 * @param {*} type 条件类型
 * @param {*} val 初始参数
 */
var PlayContidion = function(type, val) {

  this.type = type;
  if(this.type=='星期'){
    this.week = val;
    this.datetime = null;
  }
  else if(this.type=='日期' || this.type=='时间'){
    this.week = 0;
    this.datetime = val;
  }else{
    this.week = 0;
    this.datetime = null;
  }
  this.testYear = false;
  this.enabled = true;
  this.parent = null;


  this.equals = function(playContidion){
    if(this.type == '星期')
      return this.week == playContidion.week;
    else if(this.type=='日期' || this.type=='时间')
      return this.datetime == playContidion.datetime;
    return true;
  }
  this.clone = function(){
    var newV = new PlayContidion(this.type, null);
    newV.week = this.week;
    newV.testYear = this.testYear;
    newV.enabled = this.enabled;
    newV.parent = this.parent;
    newV.datetime = this.datetime;
    return newV
  }
  this.copyValue = function(sourcePlayContidion){
    this.week = sourcePlayContidion.week;
    this.testYear = sourcePlayContidion.testYear;
    this.enabled = sourcePlayContidion.enabled;
    this.parent = sourcePlayContidion.parent;
    this.datetime = sourcePlayContidion.datetime;
    this.type = sourcePlayContidion.type;
  }

  this.isPlayingTime = function() {
    if(!this.enabled)
      return false;
    var now = new Date();
    if(this.type == '星期'){
      return this.week == now.getDay();
    }else if(this.type == '日期'){
        if(this.testYear)
          return this.datetime.getFullYear() == now.getFullYear() 
            && this.datetime.getMonth() == now.getMonth() 
            && this.datetime.getDate() == now.getDate();
        else
          return this.datetime.getMonth() == now.getMonth() 
            && this.datetime.getDate() == now.getDate();
    }else if(this.type == '时间'){
      return this.datetime.getHours() == now.getHours() 
        && this.datetime.getMinutes() == now.getMinutes() 
        && this.datetime.getSeconds() == now.getSeconds();
    }
    return false;
  }
  this.isPlayingInThisHours = function() {
    var now = new Date();
    if(this.type == '时间'){
        return this.datetime.getHours() == now.getHours() 
          && now.getMinutes() <= this.datetime.getMinutes();
    }
    return false;
  }
  this.isPlayingInThisMinute = function() {
    var now = new Date();
    if(this.type == '时间'){
        return this.datetime.getHours() == now.getHours() 
          && this.datetime.getMinutes() == now.getMinutes()  
          && now.getSeconds() <= this.datetime.getSeconds();
    }
    return false;
  }
  this.getFriendlyString = function() {
    if(this.type == '星期'){
      return getWeekString(this.week);
    }else if(this.type == '日期'){
      return this.testYear ? this.datetime.format('yyyy-MM-dd') : this.datetime.format('MM-dd');     
    }else if(this.type == '时间'){
      return this.datetime.format('HH:mm:ss');
    }
    return '无效播放条件';
  }

}

PlayContidion.fromJsonObject = function(json){
  var newV = new PlayContidion(json.type, null);
  newV.testYear = json.testYear;
  newV.enabled = json.enabled;
  newV.week = json.week;
  newV.datetime = json.datetime ? new Date(json.datetime) : null;
  return newV
}

var globalTid = 0;

/**
 * 播放任务
 * @param {*} name 名称
 * @param {*} note 备注
 * @param {*} playConditions 播放条件
 */
var PlayTask = function(name, note, commands, playConditions, stopConditions) {
  this.name = name;
  this.note = note;
  this.playConditions = playConditions;
  this.stopConditions = stopConditions;
  this.parent = null;
  this.commands = commands;
  this.enabled = true;
  this.type = '播放音乐';
  this.musicVolume = -1;
  this.musicLoopCount = -1;
  this.musicTimeLimit = {
    hour: 0,
    minute: 0,
    second: 0
  };
  this.musicStartPos = {
    hour: 0,
    minute: 0,
    second: 0
  };

  this.tid = globalTid; globalTid ++;
  this.status = 'notplay';
  this.playedCommands = 0;
  this.playeError = null;
  this.playingMid = null;

  this.equals = function(playTask){
    return this.tid == playTask.tid;
  }

  this.isPlayingTime = function() {
    if(this.enabled && this.playConditions) {
      for (var i = 0, c = this.playConditions.length; i < c; i++) {
        if(this.playConditions[i].isPlayingTime())
          return true;
      }
    }
    return false;
  }
  this.isPlayingInThisHours = function() {
    if(this.enabled && this.playConditions) {
      for (var i = 0, c = this.playConditions.length; i < c; i++) {
        if(this.playConditions[i].isPlayingInThisHours())
          return true;
      }
    }
    return false;
  }
  this.isPlayingInThisMinute = function() {
    if(this.enabled && this.playConditions) {
      for (var i = 0, c = this.playConditions.length; i < c; i++) {
        if(this.playConditions[i].isPlayingInThisMinute())
          return true;
      }
    }
    return false;
  }
  this.isStoppingTime = function() {
    if(this.enabled && this.stopConditions) {
      for (var i = 0, c = this.stopConditions.length; i < c; i++) {
        if(this.stopConditions[i].isPlayingTime())
          return true;
      }
    }
    return false;
  }
  this.isStoppingInThisHours = function() {
    if(this.enabled && this.stopConditions) {
      for (var i = 0, c = this.stopConditions.length; i < c; i++) {
        if(this.stopConditions[i].isPlayingInThisHours())
          return true;
      }
    }
    return false;
  }
  this.isStoppingInThisMinute = function() {
    if(this.enabled && this.stopConditions) {
      for (var i = 0, c = this.stopConditions.length; i < c; i++) {
        if(this.stopConditions[i].isPlayingInThisMinute())
          return true;
      }
    }
    return false;
  }

  this.clone = function(){
    var newVplayConditions = [];
    var newVstopConditions = [];
    this.playConditions.forEach(element => { newVplayConditions.push(element.clone()); });
    this.stopConditions.forEach(element => { newVstopConditions.push(element.clone()); });
    var newV = new PlayTask(this.name, this.note, 
      clone(this.commands), newVplayConditions, newVstopConditions);
    this.enabled = this.enabled;
    this.type = this.type;
    this.musicVolume = this.musicVolume;
    this.musicTimeLimit = this.musicTimeLimit;
    this.musicLoopCount = this.musicLoopCount;
    this.musicStartPos = this.musicStartPos;
    return newV
  }
  this.copyValue = function(sourcePlayTask){
    this.name = sourcePlayTask.name;
    this.note = sourcePlayTask.note;
    this.commands = sourcePlayTask.commands;
    this.playConditions = sourcePlayTask.playConditions;
    this.stopConditions = sourcePlayTask.stopConditions;
    this.enabled = sourcePlayTask.enabled;
    this.type = sourcePlayTask.type;
    this.musicVolume = sourcePlayTask.musicVolume;
    this.musicTimeLimit = sourcePlayTask.musicTimeLimit;
    this.musicLoopCount = sourcePlayTask.musicLoopCount;
    this.musicStartPos = sourcePlayTask.musicStartPos;
  }

  this.getPlayConditionString = function(){
    if(this.playConditions.length == 0) return '无播放条件'; 
    else if(this.playConditions.length == 1){
      return this.playConditions[0].getFriendlyString();
    }else if(this.playConditions.length > 1){
      return  this.playConditions[0].getFriendlyString() + 
        ' 等 ' + (this.playConditions.length - 1) + ' 个播放条件';
    }
  }
  this.getStopConditionString = function(){
    if(this.stopConditions.length == 0) {
      var limitSec = this.musicTimeLimit.hour * 3600 + this.musicTimeLimit.minute * 60 + this.musicTimeLimit.second;
      if(limitSec > 0)
        return '播放 ' + (this.musicTimeLimit.hour > 0 ? (this.musicTimeLimit.hour + ':') : '') + this.musicTimeLimit.minute + ':'
         + this.musicTimeLimit.second + ' 后停止'; 
      else return '无停止条件'; 
    }
    else if(this.stopConditions.length == 1){
      return this.stopConditions[0].getFriendlyString();
    }else if(this.stopConditions.length > 1){
      return  this.stopConditions[0].getFriendlyString() + 
        ' 等 ' + (this.stopConditions.length - 1) + ' 个停止条件';
    }
  }
  this.getStatusString = function(){
    switch(this.status){
      case 'playing': return '正在播放 (' + this.playedCommands + '/' + this.commands.length + ')';
      case 'notplay': return '未播放';
      case 'disabled': return '已禁用';
      case 'played': return '已播放';
      case 'error': return '存在错误，请查看任务属性';
    }
    return ''
  }
  this.getCommandCount = function(){
    if(this.commands && this.commands.length > 0)
      return this.commands.length + ' 个任务'
    return '无任务'
  }

}

PlayTask.fromJsonObject = function(json){
  var newV = new PlayTask(json.name, json.note, json.commands, [], []);
  for (var i = 0, c = json.playConditions.length; i < c; i++)
    newV.playConditions.push(PlayContidion.fromJsonObject(json.playConditions[i]));
  for (var i = 0, c = json.stopConditions.length; i < c; i++)
    newV.stopConditions.push(PlayContidion.fromJsonObject(json.stopConditions[i]));
  newV.enabled = json.enabled;
  newV.status = json.status;
  newV.type = json.type;
  newV.musicVolume = json.musicVolume;
  newV.musicLoopCount = json.musicLoopCount;
  newV.musicTimeLimit = json.musicStartPos;
  newV.musicStartPos = json.musicStartPos;
  return newV
}