'use strict';

module.exports = function (change, keys, oldData) {
    if (keys.indexOf(change.key) === -1) {
        return false;
    }

    return this.keys.reduce(function (data, key) {
        if (key !== change.key) {
            data[key] = oldData[key];
        } else if (change.type !== 'delete') {
            data[key] = {
                value: change.data,
                flags: change.metas.flags,
                cas: change.metas.cas
            };
        }
        return data;
    }, {});

};