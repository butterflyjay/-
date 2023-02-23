import { Module, registModule, NEvent } from "../nodom/dist/nodom.esm.js";
class Datepicker extends Module {
  template(props) {
    return `
      <div class="ui-datepicker" key="ui-date">
          <div class="ui-datepicker-top" e-click="isOpen">
              <input class="ui-datepicker-input" x-field="__value" readonly>
          </div>
          <div class={{'ui-datepicker-wrapper ' + (__isOpen? 'ui-datepicker-open' : 'ui-datepicker-close')}}>
              <!-- 头部区, 选择上或者下 -->
              <div class="ui-datepicker-header">
                  <a href="#" class="ui-datepicker-btn ui-datepicker-prev-btn" e-click="prev">&lt;</a>
                  <a href="#" class="ui-datepicker-btn ui-datepicker-next-btn" e-click="next">&gt;</a>
                  <!-- 当前月份 -->
                  <span class="ui-datepicker-curr-month">{{__yearMonth}}</span>
              </div>
              <!-- body区, 显示日历 -->
              <div class="ui-datepicker-body">
                  <!-- 日历顶端显示星期几 -->
                  <div class="ui-datepicker-week">
                      <span class="ui-datepicker-showweekday" x-repeat={{__week}}>{{day}}</span>
                  </div>
                  <!-- 日历主体部分, 每一行显示七天 -->
                  <div class="ui-datepicker-weekday">
                      <span class={{'ui-datepicker-showday ' + 
                      (isShow ? 'ui-datepicker-trueDay' : 'ui-datepicker-falseDay') +
                      (isSelect ? ' ui-datepicker-select' : '')}} 
                      e-click="choose" x-repeat={{__datas}}>{{date}}</span>
                  </div>
              </div>
          </div>
      </div>             
      `
  }
  data() {
    return {
      __week: [{ day: '一' }, { day: '二' }, { day: '三' }, { day: '四' }, { day: '五' }, { day: '六' }, { day: '日' }],
      __datas: [],
      __isOpen: false,
      __value: '',
      __yearMonth: '',
    }
  }
  /**
   * 向前减少月份
   */
  prev() {
    let date = new Date(this.model["__value"]);
    let [currYear, currMonth] = [date.getFullYear(), date.getMonth() + 1]
    let lastYear, lastMonth, lastDay;
    if (currMonth - 1 === 0) { //当前是一月份
      lastYear = currYear - 1;
      lastMonth = 12;
      lastDay = this.calMonthDays(lastYear, lastMonth);
    } else {
      lastYear = currYear;
      lastMonth = currMonth - 1;
      lastDay = this.calMonthDays(lastYear, lastMonth);
    }
    this.model["__value"] = lastYear + "-" + lastMonth + "-" + lastDay;
    this.genDatas();
  }
  /**
   * 向后添加月份
   */
  next() {
    let date = new Date(this.model["__value"]);
    let [currYear, currMonth] = [date.getFullYear(), date.getMonth() + 1]
    let nextYear, nextMonth, nextDay;
    if (currMonth + 1 === 13) { //当前是12月份
      nextYear = currYear + 1;
      nextMonth = 1;
      nextDay = 1
    } else {
      nextYear = currYear;
      nextMonth = currMonth + 1;
      nextDay = 1
    }
    this.model["__value"] = nextYear + "-" + nextMonth + "-" + nextDay;
    this.genDatas();
  }
  /**
   * 打开或关闭日期选择器
   * @param {proxy} model 模型对象
   */
  isOpen(model) {
    model['__isOpen'] = !model['__isOpen'];
  }
  genDatas() {
    this.model['__yearMonth'] = this.calYearMonth(this.model["__value"]);
    let fieldDay = new Date(this.model["__value"]);
    //年份，月份，该月第几天
    let [year, month, mday] = [fieldDay.getFullYear(), fieldDay.getMonth() + 1, fieldDay.getDate()]
    //该月多少天， 该月第一天是星期几
    let [monthDays, weekDay1th] = [this.calMonthDays(year, month), this.calWeekDay(year, month, 1)];
    //上个与多少天，该月最后一天是星期几
    let [weekDaylast, lastMonthDays] = [this.calWeekDay(year, month, 0), this.calMonthDays(year, month - 1)];
    let dataArr = new Array();
    for (let ld = lastMonthDays, i = 0; i < weekDay1th - 1; i++) { //从数组前面开始添加上个月多余的日期
      dataArr.unshift({
        isShow: false,   //不能点击
        date: ld - i
      })
    }
    for (let d = 1; d <= monthDays; d++) {
      if (d === mday) {
        dataArr.push({
          isShow: true,
          date: d,
          isSelect: true
        })
      } else {
        dataArr.push({
          isShow: true,
          date: d
        })
      }
    }
    for (let j = 1; j <= 7 - weekDaylast; j++) { //从后添加下个月的多余日期
      dataArr.push({
        isShow: false,
        date: j
      })
    }
    this.model['__datas'] = dataArr;
  }
  /**
   * 获取当前日期
   * @returns 当前日期(年-月-日)
   */
  today() {
    let today = new Date(); //获取当前日期
    return today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  }
  /**
   * 计算一个月有多少天
   * @param {*} year 年份
   * @param {*} month 月份
   * @returns 天数
   */
  calMonthDays(year, month) {
    return new Date(year, month, 0).getDate();
  }
  /**
   * 计算当前日期星期几
   * @param {*} year 
   * @param {*} month 
   * @param {*} day 
   * @returns 星期几
   */
  calWeekDay(year, month, day) {
    let weekDay;
    if (day === 0) {
      weekDay = new Date(year, month, day).getDay();
    } else {
      weekDay = new Date(year, month - 1, day).getDay();
    }
    return weekDay === 0 ? 7 : weekDay;
  }
  /**
   * 计算年月(year-month)
   * @param {*} currentDate 当前日期
   * @returns year-month
   */
  calYearMonth(currentDate) {
    let curDate = new Date(currentDate);
    return curDate.getFullYear() + '-' + (curDate.getMonth() + 1);
  }
  /**
   * 选择日期
   * @param {*} model 
   * @param {*} dom 
   * @param {*} Nevent 
   * @param {*} event 
   */
  choose(model, dom, Nevent, event) {
    if (!model.isShow) {
      return;
    }
    let field = this.model["__value"]
    let __yearMonth = this.calYearMonth(field);
    this.model['__value'] = __yearMonth + '-' + model.date; // 改变当前日期的值
    model.isSelect = true;
    this.genDatas();
  }
  onBeforeFirstRender(model) {
    model["__value"] = this.today();
    this.genDatas()
  }
}

registModule(Datepicker, "ui-datepicker");
/**
 * Date类 实例对象方法
 * getDate() 从Date对象返回一个月中的某一天(1~31);
 * getDay() 从Date对象返回一周中的某一天(0~6)  0代表星期天；
 * getMonth() 从Date对象返回月份(0~11);
 * getFullYear() 从Date对象以四位数字返回年份；
 * getHours() 返回Date对象的小时(0~23)；
 * getTime() 返回1970年1月1日至今的毫秒数
 */