
'use strict';
/*jshint evil: true */


var Rx                      = require('rx');
var utils                   = require('utils');
var assign                  = require('./utils/assign');
var keysQueryChangeHandler  = require('keys-change-handler');
var Observable              = Rx.Observable;

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


function KeysQueryObservable(queryId, params, subscribeCallback, disposeCallback) {
    Observable.call(this, subscribe);
    this._queryId = queryId;
    this._params = params;
    this._subscribeCallback = subscribeCallback;
    this._disposeCallback = disposeCallback;
    this._observers = [];
    this._changeId = -1;
}

utils.inherits(KeysQueryObservable, Observable);

assign(KeysQueryObservable.prototype, {
    handleChange: function (change) {
        if (!this.initialized) {
            return;
        }
        
        this._changeId = change.id;
        var result = keysQueryChangeHandler(change, this._descriptor.keys this._data);
        if (result !== false) {
            this._data = result;
            this._notifyData();
        }
    },
    
    dispose: function () {
        this._initialized = true;
        this.observers = [];
        this._disposeCallback(this);
    },
    
    _init: function () {
        if (!this._inializing) {
            this._inializing = true;
            this._initCallback(this, this._queryId, this._changeId, this._params, function (err, descriptor, result) {
                if (err) {
                    return this._notifyError(err);
                }
                if (result.type === 'reset') {
                    this._descriptor = descriptor;
                    this._data = result.data;
                } else {
                    result.changes.forEach(this.handleChange.bind(this));
                }
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