define(function(require, exports, module) {
    var Transform        = require('famous/core/Transform');
    var Transitionable   = require('famous/transitions/Transitionable');

    function Hinge(options) {
        this.options = Object.create(Hinge.DEFAULT_OPTIONS);
        if (options) this.setOptions(options);

        // state
        this._angle  = new Transitionable(this.options.angle);
        this._origin = _getOriginFromSide.call(this, this.options.side);
    }

    Hinge.SIDE = {
        'TOP'    : 0,
        'RIGHT'  : 1,
        'BOTTOM' : 2,
        'LEFT'   : 3
    };

    Hinge.DEFAULT_OPTIONS = {
        angle : 0,
        side : Hinge.SIDE.TOP,
        transition : false
    };

    Hinge.prototype.setOptions = function setOptions(options) {
        if (options.side) {
            this.options.side = options.side;
            _getOriginFromSide.call(this, options.side);
        }
        if (options.angle !== undefined) {
            this.options.angle = options.angle;
            this._angle.set(options.angle);
        }
        if (options.transition) this.options.transition = options.transition;
    };

    Hinge.prototype.setAngle = function(angle, transition, callback) {
        transition = transition || this.options.transition;
        this._angle.set(angle, transition, callback);
    };

    Hinge.prototype.getAngle = function() {
        return this._angle.get();
    };

    Hinge.prototype.add = function(target) {
        this._target = target;
    };

    function _getOriginFromSide(side) {
        var origin;
        switch (side){
            case Hinge.SIDE.TOP:
                origin = [0,0];
                break;
            case Hinge.SIDE.RIGHT:
                origin = [1,0];
                break;
            case Hinge.SIDE.BOTTOM:
                origin = [0,1];
                break;
            case Hinge.SIDE.LEFT:
                origin = [0,0];
                break;
        }
        return origin;
    }

    function _getTransformFromAngle(angle) {
        var transform;
        switch (this.options.side){
            case Hinge.SIDE.TOP:
            case Hinge.SIDE.BOTTOM:
                transform = Transform.rotateX(angle);
                break;
            case Hinge.SIDE.RIGHT:
            case Hinge.SIDE.LEFT:
                transform = Transform.rotateY(angle);
                break;
        }
        return transform;
    }

    Hinge.prototype.render = function render() {
        var transform = _getTransformFromAngle.call(this, this.getAngle());
        var target = this._target;
        var size = target.getSize();

        return {
            size: size,
            target: {
                origin : this._origin,
                transform : transform,
                target : target.render()
            }
        };
    };

    module.exports = Hinge;
});
