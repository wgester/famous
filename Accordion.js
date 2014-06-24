define(function(require, exports, module) {
    var Transform        = require('famous/core/Transform');
    var Transitionable   = require('famous/transitions/Transitionable');
    var Hinge            = require('famous/modifiers/Hinge');

    function Accordion(options) {
        this.options = Object.create(Accordion.DEFAULT_OPTIONS);
        if (options) this.setOptions(options);

        // state
        this._angles = new Transitionable(this.options.angle);
        this._nodes = [];
        this._origin = [0,0];
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
        transition = transition || this.options.transition;
        if (this._angles.isActive) this._angles.halt();
        var angles = this.getAngles();
        angles[index] = angle;
        this._angles.set(angles, transition, callback);
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

        var node;

        debugger
        var offset = [0,0,0];
        for (var i = pivotIndex - 1; i >= 0; i--){
            node = nodes[i];
            angle = angles[i];

            var size = node.getSize();

            offset[1] -= Math.cos(angle) * size[1];
            offset[2] -= Math.sin(angle) * size[1];

            var transform = Transform.thenMove(Transform.rotateX(angle), offset);

            result.push({
                size : size,
                target : {
                    origin : this._origin,
                    transform : transform,
                    target : node.render()
                }
            });
        }

        offset = [0,0,0];
        for (var i = pivotIndex; i < nodes.length; i++){
            node = nodes[i];
            angle = angles[i];

            var size = node.getSize();
            var transform = Transform.thenMove(Transform.rotateX(angle), offset);

            result.push({
                size : size,
                target : {
                    origin : this._origin,
                    transform : transform,
                    target : node.render()
                }
            });

            offset[1] += Math.cos(angle) * size[1];
            offset[2] += Math.sin(angle) * size[1];
        }

        return result;
    };

    module.exports = Accordion;
});
