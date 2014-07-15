var Func = (function(){

    return {
        /**
         * 根据数字转换成数字单位
         */
        addUnit : function(number,unit){
            if(number === 0) return number;
            var unit = unit || 'px';
            var str = number + unit;
            return str;
        },

        /**
         * 剪切板的css信息
         */
        clipboardCss : function(obj){

            var str =  'width:' + Func.addUnit(obj.width) + '; ';
                str += 'height' + Func.addUnit(obj.height) + '; ';
                str += 'background-position:' + Func.addUnit(obj.x) + ' ' + Func.addUnit(obj.y);
            return str;
        },

    }
})()