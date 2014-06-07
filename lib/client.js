'use strict';
var KeysQueryObservable = require('./keysQueryObservable');
var assign              = require('./utils/assign');

function RxCouchClient(db, changeEmitter) {
    this._db = db;
    this._changeEmitter = changeEmitter;
    this._lastChange = 0;
    this._changes = [];
    this._observables = [];
    
    this._addListener();
}


assign(RxCouchClient.prototype, {
    
    get: function (ids) {
        if (this._isDisposed) {
            throw new Error('object is already disposed');
        }
        
        if (!Array.isArray(ids)) {
            ids = [ids];
        }
        if (ids.length === 0) {
            throw new TypeError('ids should not be empty');
        }
        var allString = ids.every(function (id) {
            return typeof id === 'string';
        });
        if (!allString) {
            throw new TypeError('get take an array of string or a string as argument');
        }

        var db = this._db;
        var lastChange = this._lastChange;
        var observables = this.observables;
        var changes = this._changes;

        return new KeysQueryObservable(ids, function (changeId, observable, callback) {
            if (changeId < 0 || changeId < (lastChange - 100)) {
                db.getMulti(ids, function (err, result) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, { type: 'reset', data: result });
                    observables.push(observable);
                });
            } else {
                var index = lastChange - changeId;
                callback(null, { type: 'changeList', changes: changes.slice(index)});
                observables.push(observable);
            }
        }, function (observable) {
            var index = observables.indexOf(observable);
            if (index !== -1) {
                observables.splice(index, 1);
            }
        });
    },
    
    
    dispose: function () {
        if (this._isDisposed) {
            throw new Error('object is already disposed');
        }
        this._observables = null;
        this._changes = null;
        this._changeEmitter.removeListener('mutation', this._mutationHandler);
        this._changeEmitter.removeListener('delete', this._deleteHandler);
        this._changeEmitter = null;
        this._isDisposed = true;
    },
    
    _addListener: function () {
        
        this._mutationHandler = function (metas, key, body) {
            this._handleChange({
                key: key,
                metas: metas,
                data: body,
                type: 'delete'
            });
        }.bind(this);
        
        this._changeEmitter.on('mutation', this._mutationHandler);
        
        this._deleteHandler = function (metas, key) {
            this._handleChange({
                key: key,
                metas: metas,
                type: 'delete'
            });
        }.bind(this);
        
        this._changeEmitter.on('delete', this._deleteHandler);
    },
      
    _handleChange: function (change) {
        this._lastChange++;
        change.id = this._lastChange;
        this._changes.push(change);
        if (this._changes.length > 100) {
            this._changes.shift();
        }
        this._observables.forEach(function (observale) {
            observale.handleChange(change);
        });
    }
});








module.exports = RxCouchClient;