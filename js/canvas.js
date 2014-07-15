var Canvas = (function(){

    // var el = {
    //     $can_width  : $('#js_canvas_width'),            //canvas 画布宽度
    //     $can_height : $('#js_canvas_height')            //canvas 画布高度
    // }

    function Canvas(json,canvas_id){
        //根据JSON创建state画布
        this.stage  = Kinetic.Node.create(json, canvas_id);
        //创建图层
        this.layer = new Kinetic.Layer();
        // //将图层添加进画布
        this.stage.add(this.layer);
    }

    Canvas.prototype = {

        clear:function(){
            this.layer.removeChildren();
        },

        drawImage : function(source,x,y){
            var that = this;
            var selected = false;   //用于判断是否有图片选中
            var img = new Image();
                img.src = source;
                img.onload = function(){
                    /**
                     * 组
                     */
                    var group = new Kinetic.Group({
                        x: x,
                        y: y,
                        width:img.width,
                        height:img.height,
                        draggable:true
                    });
                    
                    /**
                     * 图片
                     */
                    var yoda = new Kinetic.Image({
                        image:img,
                        width:img.width,
                        height:img.height,
                        x:0,
                        y:0
                    });

                    /**
                     * 边框
                     */
                    var rect = new Kinetic.Rect({
                        x:0,
                        y:0,
                        width: img.width,
                        height: img.height,
                        visible:false,
                        stroke: '#cccccc'
                        // strokeWidth: 0
                    });

                    /**
                     * 事件
                     */
                    group.on('mouseover', function(evt) {
                        document.body.style.cursor = 'pointer';
                        // var _rect = this.get('Rect')[0];
                        // console.info(_rect)
                        var selected = that.checkImgSelect(rect);
                        //没有被选中
                        if(!selected){
                            rect.setStroke('#cccccc');
                            rect.show();
                            that.layer.draw();
                        }
                        
                        // console.info(this)
                    });

                    group.on('mouseout', function(evt) {
                        document.body.style.cursor = 'default';
                        // var _rect = this.get('Rect')[0];
                        var selected = that.checkImgSelect(rect);
                        if(!selected){
                            rect.setStroke('#cccccc');
                            rect.hide();
                            that.layer.draw();
                        }
                    });

                    /**
                     * 单击事件
                     */
                    group.on('click', function(evt) {
                        var x = this.getX(),
                            y = this.getY(),
                            w = this.getWidth(),
                            h = this.getHeight();
                        //复制到剪切板
                        var clipboard = gui.Clipboard.get();
                        var text = clipboard.get('text');
                        var str = Func.clipboardCss({
                            width: w,
                            height: h,
                            x: -x,
                            y: -y
                        })
                        clipboard.clear();
                        clipboard.set(str, 'text');

                        //移除所有选中状态
                        that.stage.get('Rect').forEach(function(item){
                            if(item != rect){
                                item.setStroke('#cccccc')
                                item.hide();
                            }
                        })

                        var _rect = this.get('Rect')[0];
                        var selected = that.checkImgSelect(_rect);
                        if(selected){
                            rect.hide();
                            rect.setStroke('#cccccc');
                        }else{
                            rect.setStroke('#FF7F02');
                        }
                        that.layer.draw();
                        evt.cancelBubble = true;


                    });
                    group.add(yoda).add(rect);
                    that.layer.add(group);
                    that.stage.draw();
                }
        },

        /**
         * 判断是否选中图片
         */
        checkImgSelect: function(rect){
            // console.log(rect.getStroke())
            if(rect.getStroke() === '#FF7F02'){
                return true;
            };
            return false;
        },

        /**
         * 返回选中的组 数组
         */
        getGroupSelect: function(){
            var arr = [];
            //移除所有选中状态
            this.stage.get('Group').forEach(function(item){
                var rect = item.get('Rect')[0];
                if(rect.getStroke() === '#FF7F02'){
                    arr.push(item);
                }
            });
            return arr;
        },

        /**
         * 设置图片上偏移位置
         */
        groupOffsetTop : function(num){
            var num = num || 1,
                group = this.getGroupSelect();

            group.forEach(function(item){
                var y = item.getY();

                item.setY(y+num);
                this.layer.draw();
            });  
        },

        /**
         * 设置图片上偏移位置
         */
        groupOffsetLeft : function(num){
            var num = num || 1,
                group = this.getGroupSelect();

            group.forEach(function(item){
                var x = item.getX();
                item.setX(x+num);
                this.layer.draw();
            });  
        },

        /**
         * 移除图片组
         */
        removeGroup : function(){
            var group = this.getGroupSelect();
            group.forEach(function(item){
                item.destroy();
            });
            this.layer.draw();
        },


        /**
         * 改变画布宽高
         */
        setSize: function(width,height){
            //设置画布大小
            this.stage.setSize(width, height);
            this.stage.draw();
            // el.$can_width.val(width);
            // el.$can_height.val(height);
        },

        /**
         * 导出png
         */
        exportImage : function(path,callback){
            var settings = {
                type        : 'png',
                quality     : 1,
                filename    : 'sprites.png'
            };
            // var settings = $.extend(defaults,obj)
            this.stage.toDataURL({
                    mimeType:(settings.type.toLowerCase() === 'png') ? 'image/png' : 'image/jpeg',
                    quality: settings.quality,
                    callback:function(img){
                        // strip off the data: url prefix to get just the base64-encoded bytes
                        var data = img.replace(/^data:image\/\w+;base64,/, "");
                        var buf = new Buffer(data, 'base64');
                        fs.writeFile(path + settings.filename, buf,function(err){
                            if (err) throw err;
                            if (callback && typeof(callback) === "function") {
                                callback(path , settings.filename);
                            }
                        });
                    }
                });
        },

        exportJson : function(path,callback){
            var json = this.stage.toJSON();
            var filename = 'sprites.css';
            console.info(json);
            var buf = new Buffer(json);
            fs.writeFile(path + filename, buf,function(err){
                if (err) throw err;
                if (callback && typeof(callback) === "function") {
                    callback(path , settings.filename);
                }
            });
        },

        exportCss : function(data,path,callback){
            var filename = 'sprites.css';
            var buf = new Buffer(data);
            fs.writeFile(path + filename, buf,function(err){
                if (err) throw err;
                if (callback && typeof(callback) === "function") {
                    callback(path , settings.filename);
                }
            });
        }

    }

    return Canvas;
})();    