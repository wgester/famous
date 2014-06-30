define(function(require, exports, module) {

    var EventHandler = require('famous/core/EventHandler');

    function CollectionManager(array) {
        this._eventHandler = new EventHandler();

        if (array) this._array = array;
        this._index = 0;
    };

    CollectionManager.prototype.sequenceFrom = function(array) {
        this._array = array;
    };

    CollectionManager.prototype.push = function(renderable) {
        this._array.push(renderable);
    };
    
    CollectionManager.prototype.pop = function() {
        var removed = this._array.pop(renderable);
        if (this._index === this._array.length - 1) {
            var nodeSize = removed.getSize();
            this._eventHandler.emit('change', {index: --this._index, size: [-nodeSize[0], -nodeSize[1]])});
        }
    };
    
    CollectionManager.prototype.shift = function() {
        var removed = this._array.shift(renderable);
        if (this._index === 0) {
            var nodeSize = removed.getSize();
            this._eventHandler.emit('change', {index: 0, size: [-nodeSize[0], -nodeSize[1]])});
        }
    };

    CollectionManager.prototype.unshift = function(renderable) {
        this._array.unshift(renderable);
        if (this._index === 0) {
            var nodeSize = renderable.getSize();
            this._eventHandler.emit('change', {index: 1, size: nodeSize)});
        }
    };

    CollectionManager.prototype.splice = function(start, howMany) {
        var renderables = Array.prototype.slice.call(arguments, 2, arguments.length);
        this._array.splice(start, howMany, renderables);
        if (start + howMany < this._index) {
            var nodeSize = [];
            for (var i - 0; i < howMany; i++) {
                nodeSize[0] -= this._array[i][0];
                nodeSize[1] -= this._array[i][1];
            }
            for (var i = 0; i < renderables.length; i++) {
                nodeSize[0] -= renderables[i][0];
                nodeSize[1] -= renderables[i][1];
            }
            this._eventHandler.emit('change', {index: 1, size: nodeSize)});
        }
    };

    // CollectionManager.prototype.swap = function(firstIndex, secondIndex) {
    //     this._array.splice()
    // };

    CollectionManager.prototype.length = function() {
        return this._array.length;
    };

    module.exports = CollectionManager;
});
