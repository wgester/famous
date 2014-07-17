define(function(require, exports, module) {

    var EventHandler = require('famous/core/EventHandler');

    function CollectionManager(array) {
        this._eventHandler = new EventHandler();

        EventHandler.setInputHandler(this, this._eventHandler);
        EventHandler.setOutputHandler(this, this._eventHandler);

        if (array) this._array = array;
        this._index = 0;
    }

    CollectionManager.prototype.sequenceFrom = function(array) {
        this._array = array;
    };

    CollectionManager.prototype.push = function(renderable) {
        this._array.push(renderable);
    };

    CollectionManager.prototype.pop = function() {
        var removed = this._array.pop();
        if (this._index === this._array.length - 1) {
            var nodeSize = removed.getSize();
            this._eventHandler.emit('change', {index: --this._index, size: [-nodeSize[0], -nodeSize[1]]});
        }
        return removed;
    };

    CollectionManager.prototype.shift = function() {
        var removed = this._array.shift();

        var nodeSize = removed.getSize();
        this._eventHandler.emit('change', {index: --this._index, size: [-nodeSize[0], -nodeSize[1]]});

        return removed;
    };

    CollectionManager.prototype.unshift = function(renderable) {
        this._array.unshift(renderable);

        this._eventHandler.emit('change', {index: ++this._index, size: renderable.getSize()});
    };

    CollectionManager.prototype.splice = function(start, howMany) {
        var index;
        var nodeSize;
        var i;
        var renderables = Array.prototype.slice.call(arguments, 2, arguments.length);
        if (start <= this._index && start + howMany > this._index) {
            index = start;
            nodeSize = [0, 0];
            for (i = 0; i < index - start; i++) {
                nodeSize[0] -= this._array[i].getSize()[0];
                nodeSize[1] -= this._array[i].getSize()[1];
            }
            this._index = index;
            if ((this._array.length - howMany + renderables.length) < 0) this._index = -1;
            this._eventHandler.emit('change', {index: this._index, size: nodeSize});
        } else if (start + howMany <= this._index) {
            nodeSize = [0, 0];
            index = this._index - howMany + renderables.length;
            for (i = start; i < howMany; i++) {
                nodeSize[0] -= this._array[i].getSize()[0];
                nodeSize[1] -= this._array[i].getSize()[1];
            }
            for (i = 0; i < renderables.length; i++) {
                nodeSize[0] += renderables[i].getSize()[0];
                nodeSize[1] += renderables[i].getSize()[1];
            }
            this._index = index;
            this._eventHandler.emit('change', {index: this._index, size: nodeSize});
        }

        if (renderables.length !== 0) {
            return this._array.splice(start, howMany, renderables);
        }
        else {
            return this._array.splice(start, howMany);
        }
    };

    CollectionManager.prototype.setIndex = function(index) {
        this._index = index;
    };

    CollectionManager.prototype.getIndex = function getIndex() {
        return this._index;
    };

    CollectionManager.prototype.get = function get(index) {
        return this._array[index];
    };

    // CollectionManager.prototype.swap = function(firstIndex, secondIndex) {
    //     this._array.splice()
    // };

    CollectionManager.prototype.length = function() {
        return this._array.length;
    };

    module.exports = CollectionManager;
});
