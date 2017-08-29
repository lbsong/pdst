//月份天数表
var DAY_OF_MONTH = [
    [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
];

var TEAMS = ["Flyfish", "Precomp", "Dev", "Nov", "Age", "HS", "Adv"];

//判断当前年是否闰年
var isLeapYear = function (year) {
    if (year % 400 == 0 || (year % 4 == 0 && year % 100 != 0))
        return 1
    else
        return 0
};

//获取当月有多少天
var getDayCount = function (year, month) {
    return DAY_OF_MONTH[isLeapYear(year)][month];
};

var pageData = {
    month: "",                //当前日期字符串
    teams: TEAMS,
    curDayOfMonth: "",

    //arr数据是与索引对应的数据信息
    arrIsShow: [],          //是否显示此日期
    arrDays: [],            //关于几号的信息
    schedules: [],
    todaySchedule: [],

    selectedDate: null,

    mygroups: []
}

//刷新全部数据
var refreshPageData = function (year, month, day) {
    pageData.month = year + '-' + (month + 1);

    var offset = new Date(year, month, 1).getDay();

    for (var i = 0; i < 42; ++i) {
        pageData.arrIsShow[i] = i < offset || i >= getDayCount(year, month) + offset ? false : true;
        pageData.arrDays[i] = i - offset + 1;
    }

    //setCurDetailIndex(offset + day);
    pageData.curDayOfMonth = day;
};

var curDate = new Date();
var curMonth = curDate.getMonth();
var curYear = curDate.getFullYear();
var curDay = curDate.getDay();
var curDayOfMonth = curDate.getDate();
refreshPageData(curYear, curMonth, curDayOfMonth);

var fetchSchedule = function () {
    wx.request({
        url: 'https://raw.githubusercontent.com/lbsong/pdst/master/data/calendar.json',
        data: {},
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        // header: {}, // 设置请求的 header
        success: function (res) {
            // success
            pageData.schedules = res.data;
            wx.setStorage({ key: "schedules", data: res.data });
        },
        fail: function () {
            // fail
        },
        complete: function () {
            // complete
        }
    })
};

var findSchedules = function (schedules, mygroups) {
    return schedules.filter(schedule => mygroups.indexOf(schedule.group));
};

Page({
    data: pageData,

    onShow: function (options) {
        var that = this;

        wx.getStorage({
            key: 'mygroups',
            success: function (res) {
                // success

                if (res.data != '') {
                    pageData.mygroups = res.data.filter(g => g.my == true);
                    that.setData(pageData);
                }
            },
            fail: function () {
                // fail
            },
            complete: function () {
                // complete
            }
        })

        wx.getStorage({
            key: 'schedules',
            success: function (res) {
                // success
                if (res.data == '') {
                    fetchSchedule();
                    return;
                }

                let schedules = res.data;
                pageData.schedules = findSchedules(schedules, pageData.mygroups);
                that.setData(pageData);
            },
            fail: function () {
                // fail
            },
            complete: function () {
                // complete
            }
        })
    },

    getTodaySchedule: function (group, date) {
        let schedules = pageData.schedules;
        
        for (var sch in schedules) {
            sch.schedule = sch.schedule.filter(s => s.date == date);
        }

        pageData.todaySchedule = sch
        this.setData(pageData);
    },

    goToday: function (e) {
        curDate = new Date();
        curMonth = curDate.getMonth();
        curYear = curDate.getFullYear();
        curDay = curDate.getDay();
        var curDayOfMonth = curDate.getDate();
        refreshPageData(curYear, curMonth, curDayOfMonth);
        this.setData(pageData);
    },

    goLastMonth: function (e) {
        if (0 == curMonth) {
            curMonth = 11;
            --curYear
        }
        else {
            --curMonth;
        }

        refreshPageData(curYear, curMonth, 0);
        this.setData(pageData);
    },

    goNextMonth: function (e) {
        if (11 == curMonth) {
            curMonth = 0;
            ++curYear
        }
        else {
            ++curMonth;
        }

        refreshPageData(curYear, curMonth, 0);
        this.setData(pageData);
    },

    selectDay: function (e) {
        let day = e.currentTarget.dataset.dayIndex;

        console.log(day);
        // setCurDetailIndex(e.dataset.dayIndex);
        // this.setData({
        //     detailData: pageData.detailData,
        // })

        getTodaySchedule(day)
    },

    bindDateChange: function (e) {
        var arr = e.detail.value.split("-");
        refreshPageData(+arr[0], arr[1] - 1, arr[2] - 1);
        this.setData(pageData);
    },

    selectGroups: function (e) {
        console.log(e);

        wx.navigateTo({
            url: '/pages/settings/settings',
            success: function(res){
                // success
            },
            fail: function() {
                // fail
            },
            complete: function() {
                // complete
            }
        })
    }
});