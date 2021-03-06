import DataService from '../../data/DataService';
import { LEVEL } from '../../data/Config';
import { promiseHandle, log, formatNumber } from '../../utils/util';

Page({
  data: {
    showMonth: {},
    data: {},

    isSelectMode: false,
    isMaskShow: false,
    isEditMode: false,

    // modal
    isModalShow: false,
    modalMsg: ''
  },

  onLoad() {
    changeDate.call(this);
  },

  onReady() {
  },

  changeDateEvent(e) {
    const { year, month } = e.currentTarget.dataset;
    changeDate.call(this, new Date(year, parseInt(month) - 1, 1));
  },

  dateClickEvent(e) {
    const { year, month, date } = e.currentTarget.dataset;
    const { data } = this.data;

    data['selected']['year'] = year;
    data['selected']['month'] = month;
    data['selected']['date'] = date;

    changeDate.call(this, new Date(year, parseInt(month) - 1, date));
  },

  selectGroupClickEvent(e) {
    wx.navigateTo({
      url: '/pages/settings/settings',
      success: function (res) {
        // success
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  }
});

/**
 * 变更日期数据
 * @param {Date} targetDate 当前日期对象
 */
function changeDate(targetDate) {
  let date = targetDate || new Date();

  let showMonth = date.getMonth() + 1;                                    //当天显示月份
  let showYear = date.getFullYear();                                      //当前显示年份
  let showDay = date.getDay();                                            //当前显示星期
  let showDate = date.getDate();                                          //当前显示第几天

  date.setDate(1);
  let showMonthFirstDateDay = date.getDay();                              //当前显示月份第一天的星期

  date.setDate(showMonthDateCount);
  let showMonthLastDateDay = date.getDay();                               //当前显示月份最后一天的星期  
  let showMonthDateCount = new Date(showYear, showMonth, 0).getDate();    //当前月份的总天数

  let beforeYear = showMonth === 1 ? showYear - 1 : showYear;             //上一个月年份
  let beforMonth = showMonth === 1 ? 12 : showMonth - 1;                  //上一个月月份
  let afterYear = showMonth === 12 ? showYear + 1 : showYear;             //下个月年份
  let afterMonth = showMonth === 12 ? 1 : showMonth + 1;                  //下个月月份

  let afterDayCount = 0;                                                  //上页显示天数
  let beforeMonthDayCount = 0;                                            //上页月份总天数

  let data = [];
  let beforeDayCount = 0;

  //获取上一月的显示天数
  if (showMonthFirstDateDay != 0)
    beforeDayCount = showMonthFirstDateDay - 1;
  else
    beforeDayCount = 6;

  //获取下页的显示天数
  if (showMonthLastDateDay != 0)
    afterDayCount = 7 - showMonthLastDateDay;
  else
    showMonthLastDateDay = 0;

  //如果天数不够6行，则补充完整
  let tDay = showMonthDateCount + beforeDayCount + afterDayCount;
  if (tDay <= 35) {
    afterDayCount += (42 - tDay); //6行7列 = 42
  }

  let currentDateObj = new Date();
  let selected = this.data.data['selected'] || { year: showYear, month: showMonth, date: showDate };

  data = {
    currentDate: currentDateObj.getDate(),        //当天日期第几天
    currentYear: currentDateObj.getFullYear(),    //当天年份
    currentDay: currentDateObj.getDay(),          //当天星期
    currentMonth: currentDateObj.getMonth() + 1,  //当天月份

    showMonth: showMonth,                         //当前显示月份
    showDate: showDate,                           //当前显示月份的第几天 
    showYear: showYear,                           //当前显示月份的年份

    beforeYear: beforeYear,                       //当前页上一页的年份
    beforMonth: beforMonth,                       //当前页上一页的月份

    afterYear: afterYear,                         //当前页下一页的年份
    afterMonth: afterMonth,                       //当前页下一页的月份

    selected: selected,
    schedule: []
  };

  let dates = [];
  let _id = 0; //为wx:key指定

  if (beforeDayCount > 0) {
    beforeMonthDayCount = new Date(beforeYear, beforMonth, 0).getDate();

    for (let fIdx = 0; fIdx < beforeDayCount; fIdx++) {
      dates.unshift({
        _id: _id,
        year: beforeYear,
        month: beforMonth,
        date: beforeMonthDayCount - fIdx
      });
      _id++;
    }
  }

  for (let cIdx = 1; cIdx <= showMonthDateCount; cIdx++) {
    dates.push({
      _id: _id,
      active: (selected['year'] == showYear && selected['month'] == showMonth && selected['date'] == cIdx), //选中状态判断
      year: showYear,
      month: showMonth,
      date: cIdx
    });
    _id++;
  }

  if (afterDayCount > 0) {
    for (let lIdx = 1; lIdx <= afterDayCount; lIdx++) {
      dates.push({
        _id: _id,
        year: afterYear,
        month: afterMonth,
        date: lIdx
      });
      _id++;
    }
  }

  data.dates = dates;
  this.setData({ data: data });
}

function getMySchedule() {
  let mygroups = [];

  let groups = wx.getStorageSync('groups');

  if (groups) {
    return;
  }

  mygroups = groups.filter(g => g.my === true);

  let schedule = wx.getStorageSync('schedule');

  if (schedule) {
    schedule = getSchedule();
  }

  let myschedule = [];

  for(let s in schedule) {
    for(let g in mygroups) {
      if (g.name == s.group) {
        myschedule.push(s);
      }
    }
  }

  return myschedule;
};

function getTodaySchedule(date) {
  let myschedule = getMySchedule();

  let todaySchedule = [];
  
  for (let sch in myschedules) {
    for (let schDate in sch.schedule) {
      if (schDate.date === date) {
        todaySchedule.push({ group: sch.group, schedule: schDate });
      }
    }
  }

  return todaySchedule;
}

function getSchedule() {
  let schedule = wx.getStorageSync('schedule');

  if (schedule) {
    return schedule;
  }

  let requestTask = wx.request({
    url: 'https://raw.githubusercontent.com/lbsong/pdst/master/data/calendar.json',
    data: {},
    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    success: function (res) {
      // success
      wx.setStorageSync({ key: "schedule", data: res.data });
      schedule = res.data;
    },
    fail: function () {
      // fail
      console.log("Failed to get schedule.")
    },
    complete: function () {
      // complete
    }
  });

  return schedule;
}
