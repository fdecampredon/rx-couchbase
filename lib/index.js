'use strict';

module.exports = function (conn, tapClient, cacheSize) {
    
    // Params check
    // =============
    
    if (typeof conn !== 'object') {
        throw new TypeError('you must provide a valid couchbase connection');
    }
    if (typeof tapclient === 'undefined') {
        throw new TypeError('you must provide a valid couchbase tapclient');
    }
    
    cacheSize = cacheSize || 100;
    
    if (typeof cacheSize !== 'number') {
        throw new TypeError('cache size must be a number');
    }
    
    // States
    // ======
    
    var lastChange = 0;
    var changes = [];
    var adapters = [];
    var disposed = false;
    
    
    // Bootstraping
    // =============
    
    addListeners();
    
    
    // Change Handling
    // ===============
    
    function handleChange(change) {
        lastChange++;
        change.id = lastChange;
        changes.push(change);
        if (changes.length > cacheSize) {
            changes.shift();
        }
        
        adapters.forEach(function (adapter) {
            adapter.handleChange(change);
        });
    }
    
    function getChangesSince(changeId) {
        var index = lastChange - changeId;
        
        if (changeId < 0 || index < cacheSize) {
            return null;
        } else {
            return changes.slice(index);
        }
    }
    
    function mutationHandler(metas, key, body) {
        handleChange({
            key: key,
            metas: metas,
            data: body,
            type: 'delete'
        });
    }
    
    function deleteHandler(metas, key) {
        handleChange({
            key: key,
            metas: metas,
            type: 'delete'
        });
    }
    
    function addListeners() {
        tapClient.on('mutation', mutationHandler);
        tapClient.on('delete', deleteHandler);
    }

      
   
    
    
    // Queries
    // =======
    
    var exposed = Object.create(null);
    
    
    function expose(id, func) {
        checkDisposed();
        if (typeof id !== 'string') {
            throw new TypeError('id must be a string given: ' + id);
        }
        if (typeof func !== 'function') {
            throw new TypeError('func must be a function given: ' + func);
        }
        if (exposed[id]) {
            throw new Error('a function is already exposed with id: ' + id);
        }
        exposed[id] = func;
    }
    
    function query(id, changeId, params, cb) {
        checkDisposed();
        if (!exposed[id]) {
            throw new Error('no query has been registred with id: ' + id);
        }
        var func = exposed[id];
        var descriptor;
        try {
            descriptor = func.apply(undefined, params);
        } catch (error) {
            return cb(error);
        }
        
        if (descriptor.hasOwnProperty('id') || descriptor.hasOwnProperty('ids')) {
            queryGet(descriptor, changeId,  cb);
        } else if (descriptor.hasOwnProperty('view')) {
            
        }
    }
    
    function queryGet(descriptor, changeId, cb) {
        checkDisposed();
        var changes = getChangesSince(changeId);
        if (changes) {
            cb(null, descriptor, {
                type: 'change',
                changes: changes
            });
        } else {
            var ids = descriptor.id ? [descriptor.id] : descriptor.ids;
            conn.getMulti(ids, function (err, result) {
                if (err) {
                    return cb(err);
                }
                cb(null, descriptor, {
                    type: 'reset',
                    result: result
                });
            });
        }
    }
    
    // Adapters
    // ========
    
    
    function registerAdapter(adapter) {
        adapter.setQueryCallback(query);
        adapter.setDisposeCallback(disposeAdapter);
        adapters.push(adapter);
    }
    
    function disposeAdapter(adapter) {
        var index = adapters.indexOf(adapter);
        if (index !== -1) {
            adapters.splice(index);
        }
    }
    
    
    // Disposal
    // ========
    
    function dispose() {
        tapClient.removeListener('mutation', mutationHandler);
        tapClient.removeListener('delete', deleteHandler);
        adapters = null;
        exposed = null;
        disposed = true;
    }
    
    function checkDisposed() {
        if (disposed) {
            throw new Error('object is already disposed');
        }
    }
    
    // Exports
    // ========
    
    return {
        expose: expose,
        registerAdapter: registerAdapter,
        dispose: dispose
    };
};