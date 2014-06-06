
'use strict';
/*jshint evil: true */


var Rx          = require('rx');
var utils       = require('utils');
var assign      = require('./utils/assign');
var Observable  = Rx.Observable;

/**
 * dispose an observation
 */
function dispose(observer) {
    /*jshint validthis:true*/
    var index = this._observers.indexOf(observer);
    this._observers.splice(index, 1);
    //if all observation has been disposed
    //we can dispose the observer
    if (this._observers.length === 0) {
        this.dispose();
    }
}

function subscribe(observer) {
    /*jshint validthis:true*/
    if (this.isDisposed) {
        throw new Error('Object has been disposed');
    }
    this.oberservers.push(observer);
    if (!this._inialized) {
        this._init();
    } else {
        observer.onNext(this._data);
    }
    
    return {
        dispose: dispose.bind(this, observer)
    };
}


function KeysQueryObservable(keys, dataRetriever, disposeCallback) {
    Observable.call(this, subscribe);
    this._dataRetriever = dataRetriever;
    this._keys = keys;
    this._disposeCallback = disposeCallback;
    this._observers = [];
}

utils.inherits(KeysQueryObservable, Observable);

assign(KeysQueryObservable.prototype, {
    handleChange: function (change) {
        if (!this._initialized) {
            return false;
        }

        if (this.keys.indexOf(change.id) === -1) {
            return false;
        }

        var oldData = this._data;
        this._data = this.keys.reduce(function (data, key) {
            if (key !== change.id) {
                data[key] = oldData[key];
            } else if (change.type !== 'delete') {
                data[key] = change.value;
            }
            return data;
        }, {});
        
        this._notifyData();
        return true;
    },
    
    dispose: function () {
        this.isDisposed = true;
        this.observers = null;
        this._disposeCallback(this);
    },
    
    _init: function () {
        if (!this._inializing) {
            this._inializing = true;
            this._dataRetriever(this.keys, function (err, data) {
                if (err) {
                    this._notifyError(err);
                }
                this._data = data;
                this._notifyData();
                this._inialized = true;
                this._inializing = false;
            });
        }
    },
    
    _notifyError: function (err) {
        this._observers.forEach(function (observer) {
            observer.onErr(err);
        });
    },
    
    _notifyData: function () {
        this._observers.forEach(function (observer) {
            observer.onNext(this._data);
        });
    }
});



module.exports = KeysQueryObservable;