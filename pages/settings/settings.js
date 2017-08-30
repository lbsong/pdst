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

        let groups = wx.getStorageSync('groups');

        if (groups) {
           this.setData({groups: groups}); 
        }
        else {
            this.setData({groups: pre_groups});
        }
    },

    changed: function (e) {
        let selectedGroups = e.detail.value;
        let groups = this.data.groups;

        for (var g of groups) {
            if (selectedGroups.indexOf(g.name) != -1) {
                g.my = true;
            }
        }

        wx.setStorageSync('groups', groups);
    }
});