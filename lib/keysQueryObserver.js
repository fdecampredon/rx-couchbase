
'use strict';
/*jshint evil: true */

var assign  = require('./assign');

function KeysQueryObserver(data, keys) {
    this.data = data;
    this.keys = keys;
}

assign(KeysQueryObserver.prototype, {
    handleChange: function (change) {
        if (this.keys.indexOf(change.id) === -1) {
            return false;
        }
        
        var oldData = this.data;
        this.data = this.keys.reduce(function (data, key) {
            if (key !== change.id) {
                data[key] = oldData[key];
            } else if (change.type !== 'delete') {
                data[key] = change.value;
            }
            return data;
        }, {});
        return true;
    }
});



module.exports = KeysQueryObserver;