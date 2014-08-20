var fs = require('fs');
var gui = require('nw.gui');


var el = {
    $exportBtn : $('#J_export'),
    $readBtn : $('#J_readFiles'),
    $pathInp : $('#J_path'),
    $width : $('#J_width'),
    $height : $('#J_height'),
    $editSizeBtn : $('#J_editSize'),
    $mobile:$('#J_mobile')
};

var json = '{"attrs":{"width":1600,"height":5600},"className":"Stage"}',
    canvas = new Canvas(json,'J_container');


var checkImg = function(dataArr){
    var imgs = [];
    dataArr.forEach(function(filename){
        var arr = filename.split('.'),
            type = arr[1],
            images = ['jpg', 'jpeg', 'png', 'gif','JPG', 'JPEG', 'PNG', 'GIF'];
        //文件
        if($.inArray(type,images) !== -1 && filename !== "sprites.png"){
            imgs.push(filename);
        }
    });
    return imgs;
};

/**
 * 获取图片数组
 */
var getImagesArr = function(path,dirlist,callback){
    var images = [],
        length = dirlist.length;
    dirlist.forEach(function(item){
        var file = path + item;
        var img = new Image();
            img.src = file;
            img.onload = function(){
                images.push({
                    w:img.width,
                    h:img.height,
                    url:file,
                    cssname:item.split('.')[0]
                });

                if(images.length == length){
                    console.log(images);
                    callback(images);
                }
            }
        
    });
};


var sorts = {
    random  : function (a,b) { return Math.random() - 0.5; },
    w       : function (a,b) { return b.w - a.w; },
    h       : function (a,b) { return b.h - a.h; },
    a       : function (a,b) { return b.area - a.area; },
    max     : function (a,b) { return Math.max(b.w, b.h) - Math.max(a.w, a.h); },
    min     : function (a,b) { return Math.min(b.w, b.h) - Math.min(a.w, a.h); },

    height  : function (a,b) { return sorts.msort(a, b, ['h', 'w']);               },
    width   : function (a,b) { return sorts.msort(a, b, ['w', 'h']);               },
    area    : function (a,b) { return sorts.msort(a, b, ['a', 'h', 'w']);          },
    maxside : function (a,b) { return sorts.msort(a, b, ['max', 'min', 'h', 'w']); },

    msort: function(a, b, criteria) { /* sort by multiple criteria */
      var diff, n;
      for (n = 0 ; n < criteria.length ; n++) {
        diff = sorts[criteria[n]](a,b);
        if (diff != 0)
          return diff;  
      }
      return 0;
    },

    now: function(blocks) {
      var sort = Demo.el.sort.val();
      if (sort != 'none')
        blocks.sort(sorts[sort]);
    }
}

var getSize = function(){
    return {
        width : +el.$width.val() || 600,
        height : + el.$height.val() || 600
    }
};

/**
 * 图片排序
 */
var sortImage = function(images){
    var size = getSize();
    console.log('size',size);

    var packer = new Packer(size.width, size.height);   // or:  new GrowingPacker();
    //images.sort(sorts.area); // sort inputs for best results
    packer.fit(images);
    // console.info(packer)
    //设置画布大小
    canvas.setSize(packer.root.w, packer.root.h);
    return images;
};



var setSize = function(){

};

/**
 * 快捷操作
 */
var shortCuts = function(){


    var short_cuts = [

        {key:"up",method:function(){
            canvas.groupOffsetTop(-1);
            _setPos("top",-1);
        }},
        {key:"down",method:function(){
            canvas.groupOffsetTop(1);
        }},
        {key:"left",method:function(){
            canvas.groupOffsetLeft(-1);
        }},
        {key:"right",method:function(){
            canvas.groupOffsetLeft(1);
        }},
        {key:"delete",method:function(){
            console.info('del')
            canvas.removeGroup();
        }}

    ];

    $.each(short_cuts,function(index,elem){
        shortcut.add(elem.key, function () {
            elem.method();
            return false;
        }, { 'type': 'keydown', 'propagate': false,'disable_in_input':true });
    });
};

var replaceAll = function(str ,reallyDo, replaceWith, ignoreCase) {
    if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
        return str.replace(new RegExp(reallyDo, (ignoreCase ? "gi": "g")), replaceWith);
    } else {
        return str.replace(reallyDo, replaceWith);
    }
};

var Events = {
    changeSize : function(){
        el.$editSizeBtn.on('click',function(){
            var size = getSize();
            console.log(size);
            
            canvas.setSize(size.width, size.height);
            $('#J_container').css(size)
        });
    },

    exports : function(){
        el.$exportBtn.on('click',function(){
            var path = el.$pathInp.val();
            canvas.exportImage(path);
//            canvas.exportJson(path);
            alert('导出成功！')
        })
    },

    readFile: function(){
        el.$readBtn.on('click',function(){
            var path = el.$pathInp.val(),
                dirlist = fs.readdirSync(path), //同步读取文件内容
                dirImg = checkImg(dirlist),
                isMobile = el.$mobile.prop('checked'),
                cssName = [],
                bgSize = '',
                cssStr = '';
            console.log('读取中');
            console.log(isMobile);
            
            canvas.clear();
            getImagesArr(path,dirImg,function(images){
                images = sortImage(images);
                images.forEach(function(item){
                    if(item.fit){
                        var width = isMobile ? item.w/2 : item.w;
                        var heigth = isMobile ? item.h/2 : item.h;
                        var x = isMobile ? item.fit.x/2 : item.fit.x;
                        var y = isMobile ? item.fit.y/2 : item.fit.y;
                        canvas.drawImage(item.url,item.fit.x, item.fit.y);
                        cssStr += "." + item.cssname + "{width:"+ width +"px; height:"+ heigth +"px; background-position: -"+ x +"px -"+ y +"px}\n";
                        cssName.push( "." + item.cssname);
                    }
                });//forEach
                console.log(cssStr);
                if(isMobile){
                    var size = getSize();
                    bgSize = ';background-size:' + size.width/2 + 'px ' + size.height/2 + 'px;'
                }
                cssName = cssName.join(',') + '{background-image: url("sprites.png"); background-repeat: no-repeat'+  bgSize +'}';
                cssName += "\n" + cssStr;
                cssName = replaceAll(cssName,'!',' ');
                cssName = replaceAll(cssName,'@',':');
                setTimeout(function(){
                    canvas.exportImage(path);
                    canvas.exportCss(cssName,path);
                },2000);
                console.log('读取完成');

            });

        })
    },

    // clip

    init : function(){
        //初始化
        for(var i in this) {
            if (this.hasOwnProperty(i) && i !== 'init') {
                this[i]();
            }
        }
    }
};//Event


//init
Events.init();
shortCuts();

