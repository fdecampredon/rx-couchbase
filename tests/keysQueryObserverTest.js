'use strict';

var test                = require('tape');
var KeysQueryObserver   = require('../lib/keysQueryObserver');

test('KeysQueryObserver', function (t) {
    
    t.test('handle change', function (t) {
        var data = {
            foo: { a : 'b' },
            bar: { c : 'd'}
        };
            
        var observer = new KeysQueryObserver(data, ['foo', 'bar']);
        
        t.plan(6);
        
        t.equal(observer.handleChange({ type: 'delete', id: 'hello' }), false,
                'should return false if the change does not concern an observed id');
        t.equal(data, observer.data, 'data should not have changed');
        
        t.equal(observer.handleChange({ type: 'delete', id: 'foo' }), true,
                'should return true if the change is made on an observed doc');
        
        t.notEqual(data, observer.data, 'data should have changed');
        
        t.deepEqual(observer.data, {  bar: { c : 'd'} },
                    'new data should not contains value for a doc that have been deleted');
        
        observer.handleChange({ type: 'set', id: 'foo', value: { hello : 'world'} }) ;
        
        t.deepEqual(observer.data, { foo: { hello : 'world'}, bar: { c : 'd' } },
                    'new data should have beeen updated with the new doc value when a doc is set');
        
    });
});