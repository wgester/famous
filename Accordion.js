define(function(require, exports, module) {
    var Transform        = require('famous/core/Transform');
    var Transitionable   = require('famous/transitions/Transitionable');

    function Accordion(options) {
        this.options = Object.create(Accordion.DEFAULT_OPTIONS);
        if (options) this.setOptions(options);

        // state
        this._angles = new Transitionable(this.options.angle);
        this._nodes = []
    };

    Accordion.DIRECTION_X = 0;
    Accordion.DIRECTION_Y = 1;

    Accordion.DEFAULT_OPTIONS = {
        direction : Accordion.DIRECTION_X,
        transition : false,
        pivotIndex : 0
    };

    Accordion.prototype.setOptions = function setOptions(options) {
        if (options.direction !== undefined) this.options.direction = options.direction;
        if (options.transition !== undefined) this.options.transition = options.transition;
        if (options.pivotIndex !== undefined) this.options.pivotIndex = options.pivotIndex;
    };

    Accordion.prototype.setAngle = function(index, angle, transition, callback) {
        var angles = this.getAngles().slice();
        angles[index] = angle;
        this.setAngles(angles, transition, callback);
    };

    Accordion.prototype.setAngles = function(angles, transition, callback) {
        transition = transition || this.options.transition;
        if (this._angles.isActive) this._angles.halt();
        this._angles.set(angles, transition, callback);
    };

    Accordion.prototype.getAngles = function() {
        return this._angles.get();
    };

    Accordion.prototype.sequenceFrom = function(nodes){
        this._nodes = nodes;
    };

    Accordion.prototype.render = function render() {
        var result = [];

        var pivotIndex = this.options.pivotIndex;
        var angles = this.getAngles();
        var nodes = this._nodes;
        var angle = 0;
        var totalLength = 0;
        var maxTotalLength = 0;
        var pivotLength = 0;
        var node;

        for (var i = 0; i < pivotIndex; i++){
            angle = angles[i];
            length = nodes[i].getSize()[1];
            pivotLength += Math.cos(angle) * length;
        }

        var offset = [0, pivotLength, 0];
        for (var i = pivotIndex - 1; i >= 0; i--){
            node = nodes[i];
            angle = angles[i];

            var size = node.getSize();
            var length = size[1];

            offset[1] -= Math.cos(angle) * length;
            offset[2] -= Math.sin(angle) * length;

            var transform = Transform.thenMove(Transform.rotateX(angle), offset);

            totalLength += Math.cos(angle) * length;
            maxTotalLength = Math.max(maxTotalLength, totalLength);

            result.push({
                size : size,
                target : {
                    origin : [0,0],
                    transform : transform,
                    target : node.render()
                }
            });
        }

        offset = [0,pivotLength,0];
        for (var i = pivotIndex; i < nodes.length; i++){
            node = nodes[i];
            angle = angles[i];

            var size = node.getSize();
            var length = size[1];

            var transform = Transform.thenMove(Transform.rotateX(angle), offset);

            result.push({
                size : size,
                target : {
                    origin : [0,0],
                    transform : transform,
                    target : node.render()
                }
            });

            offset[1] += Math.cos(angle) * length;
            offset[2] += Math.sin(angle) * length;

            totalLength += Math.cos(angle) * length;
            maxTotalLength = Math.max(maxTotalLength, totalLength);

        }

        totalLength = Math.max(maxTotalLength, totalLength);
        this._size = [size[0], totalLength];

        return {
            size : this._size,
            target : result
        };
    };

    Accordion.prototype.getSize = function(){
        return this._size;
    }

    module.exports = Accordion;
});
