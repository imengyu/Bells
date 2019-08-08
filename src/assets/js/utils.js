var weekStr = ['日','一','二','三','四','五','六']

function getWeekString(i){
  return '星期' + weekStr[i];
}
function prefixInteger(num, length) {
  return (num/Math.pow(10,length)).toFixed(length).substr(2);
}

/**
 * 克隆对象
 * @param {Object} obj 要克隆对象
 */
function clone(obj) {
  let temp = null;
  if (obj instanceof Array) {
    temp = obj.concat();
  } else if (obj instanceof Function) {
    //函数是共享的是无所谓的，js也没有什么办法可以在定义后再修改函数内容
    temp = obj;
  } else {
    temp = new Object();
    for (let item in obj) {
      let val = obj[item];
      temp[item] = typeof val == 'object' ? clone(val) : val; //这里也没有判断是否为函数，因为对于函数，我们将它和一般值一样处理
    }
  }
  return temp;
}
/**
 * 将源对象每个属性都复制到目标对象
 * @param {*} setObj 
 * @param {*} sourceObj 
 */
function cloneValue(setObj, sourceObj){
  if(!setObj || !sourceObj) return;
  Object.keys(setObj).forEach(function(key){
    if(typeof sourceObj[key] != 'undefined') {
      if(isJSON(setObj[key])) cloneValue(setObj[key], sourceObj[key]);
      else setObj[key] = sourceObj[key];
    }
  });
}
function cloneValueForce(setObj, sourceObj){
  if(!setObj || !sourceObj) return;
  Object.keys(sourceObj).forEach(function(key){
    if(isJSON(setObj[key])) cloneValue(setObj[key], sourceObj[key]);
    else setObj[key] = sourceObj[key];
  });
}

function mergeJSON(minor, main) {
  for (var key in minor) {
    if (main[key] === undefined) { // 不冲突的，直接赋值 
      main[key] = minor[key];
      continue;
    }
    // 冲突了，如果是Object，看看有么有不冲突的属性
    // 不是Object 则以（minor）为准为主，
    if (isJSON(minor[key]) || isArray(minor[key])) { // arguments.callee 递归调用，并且与函数名解耦 
      main[key] = mergeJSON(minor[key], main[key]);
    } else {
      main[key] = minor[key];
    }
  }
  return main;
}
function isJSON(target) {
  if(!target) return false;
  return typeof target == "object" && target.constructor && target.constructor == Object;
}
function isArray(o) {
  return Object.prototype.toString.call(o) == '[object Array]';
}
/**
 * 混合两个 JsonArray
 * @param {*} a 
 * @param {*} b 
 */
function mergeJsonArray(a, b) {
  var r = {};
  var i = 0;
  for (var key in a) {
    r[i] = a[key];
    i++;
  }
  for (var key in b) {
    r[i] = b[key];
    i++;
  }
  return r;
}

// 字符串操作
//================


/**
 * 判断一个字符串是否为空
 * @param {*} str 要判断的字符串
 */
function isNullOrEmpty(str) {
  if (typeof str == 'undefined') return true;
  if (str == null || str == '') return true;
  return false;
}
/**
* 判断字符串是否是 Base64 编码
* @param {String} str 
*/
function isBase64(str) {
  return /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/.test(str);
}
/**
 * 检测字符串是否是一串数字
 * @param {String} val 
 */
function isNumber(val) {
  var regPos = /^\d+(\.\d+)?$/; //非负浮点数
  var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
  if (regPos.test(val) || regNeg.test(val)) {
    return true;
  } else {
    return false;
  }
}
/**
 * 数字补0
 */
function pad(num, n) {
  var len = num.toString().length;
  while (len < n) {
    num = "0" + num;
    len++;
  }
  return num;
}

function getFileSuffix(filename){
  var index = filename.lastIndexOf(".");
  return filename.substr(index+1);
}

/**
 * 判断点击区域可编辑
 * @param {*} e 
 */
function isEleEditable(e){
  if(!e){
      return false;
  }
  if(e.tagName == 'INPUT' || e.contentEditable == 'true'){
      return true;
  }else{
      //递归查询父节点
      return isEleEditable(e.parentNode)
  }
}

/**  
 * 日期格式化（原型扩展或重载）  
 * 格式 YYYY/yyyy/ 表示年份  
 * MM/M 月份  
 * dd/DD/d/D 日期  
 * @param {formatStr} 格式模版  
 * @type string  
 * @returns 日期字符串  
 */
Date.prototype.format = function (formatStr) {
  var str = formatStr;
  //var Week = ['日','一','二','三','四','五','六'];   
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