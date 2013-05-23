var baseMeth = {
    $: function(id){
        return document.getElementById(id);
    },
    addEvent: function(elem, type, fn){
        if (elem.addEventListener) {
            elem.addEventListener(type, fn, false);
        }else if(elem.attachEvent){
            elem.attachEvent('on'+type, fn);
        }else{
            elem['on'+type] = fn;
        }
    },
    removeEvent: function(elem, type, fn){
        if (elem.removeEventListener) {
            elem.removeEventListener(type, fn, false);
        }else if(elem.detachEvent){
            elem.detachEvent('on'+type, fn);
        }else{
            elem['on'+type] = null;
        }
    },
    getEvent: function(evt){
        return evt || win.event;
    },
    getTarget: function(evt){
        return evt.target || evt.srcElement;
    },
    extend: function(define, source) {
        for (var property in source){
            define[property] = source[property];
        }
        return define;
    }
}
;(function(win){
    var doc = win.document,
        bdy = doc.body;

    var defaultConfig = {
        target: null,
        setArea: false,
        xStart: 0,
        xEnd: 300,
        yStart: 0,
        yEnd: 300,
        callback: function(){

        }
    }
    /**
     * @class
     * @param  {[Object]} opts 参数
     * @参数说明
     * target 拖动元素
     * setArea 是否限制区域(true/false),默认false
     * xStart 限制区域横向起始位置
     * xEnd  限制区域横向结束位置
     * yStart 限制区域纵向起始位置
     * yEnd 限制区域纵向结束位置
     * backup 备用参数可配置
     * callback 回调函数
     * @return {[Object]}
     */
    var Drag = function(opts){
        this.drag = opts.target;
        this.setArea = opts.setArea;
        this.xStart = opts.xStart;
        this.xEnd = opts.xEnd;
        this.yStart = opts.yStart;
        this.yEnd = opts.yEnd;
        this.backup = opts.backup;
        this.callback = opts.callback;

        this.stopX = false;
        this.stopY = false;

        this.pos = null;//计数器
        this.flag = false;//阀门
        this.oldX = 0;
        this.oldY = 0;

        this.init();
    }
    Drag.prototype = {
        init: function(){
            var self = this;
            baseMeth.addEvent(self.drag, 'mousedown', function(e){
                self.flag = true;
                /**
                 * 记录鼠标按下位置
                 * @type {[type]}
                 */
                self.pos = self.getMousePos(e);
                self.oldX = self.pos.x - this.offsetLeft;
                self.oldY = self.pos.y - this.offsetTop;
            });
            baseMeth.addEvent(doc, 'mousemove',  function(e){
                self.move(e);
            });
            baseMeth.addEvent(doc, 'mouseup',  function(){
                self.flag = false;
            });
        },
        move: function(e){
            var self = this;
            self.stopSlect();
            //阀门
            if(self.flag){
                self.pos = self.getMousePos(e);
                self.areaBlock();
                self.cssRules();
                self.callback.call(this);
            }
        },
        cssRules: function(){

            var self = this,
                left = null,
                top = null;
            if(!self.stopX){
                left = self.pos.x - self.oldX;
            }else{
                left = self.drag.offsetLeft;
            }
            if(!self.stopY){
                top = self.pos.y - self.oldY;
            }else{
                top = self.drag.offsetTop;
            }
            self.top = top;
            self.left = left;
            self.drag.style.cssText = 'left:'+ left +'px;' + 'top:'+ top +'px;';
        },
        areaBlock: function(){
            var self = this;
            if(self.setArea){
                if((self.pos.x - self.oldX) < self.xStart){
                    self.oldX = self.pos.x - self.xStart;
                }
                if((self.pos.x - self.oldX) > self.xEnd){
                    self.oldX = self.pos.x - self.xEnd;
                }
                if((self.pos.y - self.oldY) < self.yStart){
                    self.oldY = self.pos.y - self.yStart;
                }
                if((self.pos.y - self.oldY) > self.yEnd){
                    self.oldY = self.pos.y - self.yEnd;
                }
                if(self.pos.x < self.xStart
                    || self.pos.x > (self.xEnd + self.drag.offsetWidth)
                    || self.pos.y < self.yStart
                    || (self.yEnd + self.drag.offsetHeight) < self.pos.y){
                    self.flag=false;
                }
            }
        },
        /**
         * 获取坐标位置
         * @param  {[Object]} e
         * @return {[Object]}   x y
         */
        getMousePos: function (e){
            var e = baseMeth.getEvent(e);
            if(e.pageX || e.pageY){
                 return {x:e.pageX, y:e.pageY};
            }
            return{
                x:e.clientX + bdy.scrollLeft - bdy.clientLeft,
                y:e.clientY + bdy.scrollTop - bdy.clientTop
            };
        },
        stopSlect: function(){
            win.getSelection ? win.getSelection().removeAllRanges() : doc.selection.empty();
        }
    }
    /**
     * 对外接口
     * @return {[type]} [description]
     */
    win.drag = function(opts){
        opts = baseMeth.extend(defaultConfig, opts);
        new Drag(opts);
    };
}(this));
