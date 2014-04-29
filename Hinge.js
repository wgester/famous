define(function(require, exports, module) {
    var Utility          = require('famous/utilities/Utility');
    var OptionsManager   = require('famous/core/OptionsManager');
    var RenderNode       = require('famous/core/RenderNode');
    var Modifier         = require('famous/core/Modifier');
    var Transform        = require('famous/core/Transform');
    var Transitionable   = require('famous/transitions/Transitionable');

    function Hinge(options) {
        if (options) {
            if (options.direction) options.direction = Hinge.dictionary[options.direction];
            if (options.axis) options.axis = Hinge.dictionary[options.axis];
        }

        this.options = Object.create(Hinge.DEFAULT_OPTIONS);
        this.optionsManager = new OptionsManager(this.options);

        if (options) this.setOptions(options);
        
        this.origin = this.options.direction ? [0.5, this.options.axis] : [this.options.axis, 0.5];
        this.angle = new Transitionable(this.options.angle);

        _attachModifiers.call(this);
    };

    Hinge.dictionary = {
        1: 1,
        'y': 0,
        'x': 1,
        'left': 0,
        'top': 0,
        'right': 1,
        'bottom': 1
    };

    Hinge.DEFAULT_OPTIONS = {
        direction: Utility.Direction.Y,
        axis: 0,
        angle: 0,
        transition:{
            duration: 500,
            curve: 'linear'
        }
    };

    function _attachModifiers() {
        if (this.options.axis) {
            this.rotateTransform = function() {
                return this.options.direction ? Transform.rotateX(this.angle.get()) : Transform.rotateY(this.angle.get());
            }.bind(this);
        } else {
            this.rotateTransform = function() {
                return this.options.direction ? Transform.rotateX(-this.angle.get()) : Transform.rotateY(-this.angle.get());
            }.bind(this);
        }
    };

    Hinge.prototype.setOptions = function setOptions(options) {
        this.optionsManager.setOptions.apply(this.optionsManager, arguments);
        return this;
    };

    Hinge.prototype.setAngle = function(angle, transition) {
        transition ? this.angle.set(angle, transition) : this.angle.set(angle, this.options.transition);
    };

    Hinge.prototype.modify = function modify(target) {
        this.size = target.size[this.options.direction];
        return {
            transform: this.rotateTransform(),
            target: {
                origin: this.origin,
                size: target.size,
                target: target
            }
        }
    };


    module.exports = Hinge;
});