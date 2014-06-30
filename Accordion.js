define(function(require, exports, module) {
    var Transform        = require('famous/core/Transform');
    var Transitionable   = require('famous/transitions/Transitionable');

    function Accordion(options) {
        // state
        this._angles = new Transitionable();
        this._nodes = [];
        this._initPivotOffset = [0,0,0];

        this.options = Object.create(Accordion.DEFAULT_OPTIONS);
        if (options) this.setOptions(options);
    };

    Accordion.DIRECTION_X = 0;
    Accordion.DIRECTION_Y = 1;

    Accordion.DEFAULT_OPTIONS = {
        initialAngles : [],
        direction : Accordion.DIRECTION_X,
        transition : false,
        pivotIndex : 0,
        reflowSize : false
    };

    Accordion.prototype.setOptions = function setOptions(options) {
        var recomputePivotOffsetFlag = false;

        if (options.initialAngles !== undefined) {
            this.options.initialAngles = options.initialAngles;
            this.setAngles(options.initialAngles);
            recomputePivotOffsetFlag = true;
        }
        if (options.direction !== undefined) this.options.direction = options.direction;
        if (options.transition !== undefined) this.options.transition = options.transition;
        if (options.pivotIndex !== undefined) {
            this.options.pivotIndex = options.pivotIndex;
            this.options.initialAngles = this._angles.get().slice();
            recomputePivotOffsetFlag = true;
        }
        if (recomputePivotOffsetFlag) _computePivotOffset.call(this);
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
        _computePivotOffset.call(this);
    };

    function _computePivotOffset() {
        var angles = this.options.initialAngles;
        var offset = [0,0,0];
        var nodes = this._nodes;
        var angle = 0;

        if (!this._nodes.length) return;

        for (var i = 0; i < this.options.pivotIndex; i++){
            var node = nodes[i];
            angle = angles[i];

            var size = node.getSize();
            var length = size[1];

            offset[1] -= Math.cos(angle) * length;
            offset[2] -= Math.sin(angle) * length;
        }

        this._initPivotOffset = offset;
    }

    Accordion.prototype.render = function render() {
        var result = [];

        var pivotIndex = this.options.pivotIndex;
        var angles = this.getAngles();
        var nodes = this._nodes;
        var angle = 0;
        var totalLength = 0;
        var maxTotalLength = 0;
        var node, pivotOffset;

        var offset = [0, 0, 0];
        for (var i = 0; i < nodes.length; i++){

            if (i === pivotIndex) pivotOffset = offset.slice();

            node = nodes[i];
            angle = angles[i];

            var size = node.getSize();
            var length = size[1];

            var transform = Transform.thenMove(Transform.rotateX(angle), offset);

            result.push({
                size: size,
                target: {
                    origin: [0, 0],
                    transform: transform,
                    target: node.render()
                }
            });

            offset[1] += Math.cos(angle) * length;
            offset[2] += Math.sin(angle) * length;

            totalLength += Math.cos(angle) * length;
            maxTotalLength = Math.max(maxTotalLength, totalLength);

        }

        if (i === pivotIndex) pivotOffset = offset.slice();

        totalLength = Math.max(maxTotalLength, totalLength);
        this._size = [size[0], totalLength];

        return {
//            size : this._size,
            transform : Transform.translate(
                -this._initPivotOffset[0] - pivotOffset[0],
                -this._initPivotOffset[1] - pivotOffset[1],
                -this._initPivotOffset[2] - pivotOffset[2]
            ),
            target : result
        };
    };

    Accordion.prototype.getSize = function(){
        return this._size;
    }

    module.exports = Accordion;
});
