var pre_groups =  [
    { "name": "Fly fish", "my": false },
    { "name": "Pre-Comp", "my": false },
    { "name": "Development", "my": false },
    { "name": "Novice", "my": false },
    { "name": "Age", "my": false },
    { "name": "HS", "my": false },
    { "name": "Regional", "my": false },
    { "name": "Advanced", "my": false },
    { "name": "SS", "my": false }
];

Page({
    data: {
        groups: pre_groups
    },

    onLoad: function (e) {
        let that = this;

        wx.getStorage({
            key: 'mygroups',
            success: function(res){
                if (res.data != "") {
                    that.setData({groups: res.data});
                }
            },
            fail: function() {
            },
            complete: function() {
            }
        })
    },

    changed: function (e) {
        let mygroups = e.detail.value;

        for (var g of pre_groups) {
            if (mygroups.indexOf(g.name) != -1) {
                g.my = true;
            }
        }

        wx.setStorage({
            key: 'mygroups',
            data: pre_groups,
            success: function (res) {
            },
            fail: function () {
            },
            complete: function () {
            }
        })
    }
});