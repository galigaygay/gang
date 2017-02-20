/**
 * Created by liugang on 2017/2/18.
 */
(function (global) {
    var document = global.document;
    var arr = [],
        init,
        slice = arr.slice,
        push = arr.push;
    var itcast = function (selector,context) {
        // return new itcast.prototype.init(selector,context);
        return new itcast.fn.init(selector, context);
    };
    //在原型上添加方法(itcast对象来调用)
    itcast.fn = itcast.prototype = {
        constructor: itcast,
        length: 0,
        splice: arr.slice,
        toArray: function () {
            return slice.call(this);
            //return Arrray.prototype.slice.call(this);
        },
        get: function (index) {
            //处理null 和 undefined
            //将所有的元素以数组形式返回
            if (index == null) {
                return slice.call(this);
            }
            //获取索引值对应的dom元素
            return this[index >= 0 ? index - 0 : index - 0 + this.length];
        },
        eq: function (index) {
            return itcast(this.get(index));
        },
        first: function () {
            return itcast(this.get(0));
        },
        last: function () {
            return itcast(this.get(-1));
        },
        each: function (callback) {
            return itcast.each(this, callback);
        },
        map: function (callback) {
            return itcast(itcast.map(this, function (elem, i) {
                return callback.call(elem, elem, i);
            }))
        }
    };

    //处理各种类型
    init = itcast.fn.init = function (selector, context) {
        //处理null undefined
        if (!selector) {
            return this;
        }
        if (itcast.isString(selector)) {
            if(itcast.isHTML(selector)){
                push.apply(this,itcast.parseHTML(selector));
            }else{
                push.apply(this,select(selector,context));
            }
        }
        else if(itcast.isDOM(selector)){
            this[0]=selector;
            this.length=1;
        }
        else if(itcast.isArrayLike(selector)){
            push.apply(this,selector);
        }
        else if(typeof selector==='function'){
            if(itcast.isReady){
                selector();  //selector  为函数   就执行
            }else{
                document.addEventListener('DOMContentLoaded', function () {
                    itcast.isReady=true;
                    selector();
                })
            }
        }
    };
    //置换原型
    init.prototype = itcast.fn;
    itcast.extend = itcast.fn.extend = function (source) {
        //枚举source对象上的所有属性
        for (var k in source) {
            //添加到调用者身上
            this[k] = source[k];
        }
    };
    //类型判断方法
    itcast.extend({
        isString: function (obj) {
            return typeof obj === 'string';
        },
        isHTML: function (obj) {
            return (obj + '').charAt(0) === '<' &&
                (obj + '').charAt((obj + '').length - 1) === '>' &&
                (obj + '').length >= 3;
        },
        isDOM: function (obj) {
            //元素类型  元素节点
            return 'nodeType' in obj && obj.nodeType == 1;
        },
        //全局window对象
        isWindow: function (obj) {
            return !!obj && obj.window === obj;
        },
        //为数组或者数组对象
        isArrayLike: function (obj) {
            //若obj不为  null  或  undefined  具有length属性
            var length = !!obj && 'length' in obj && obj.length,
                type = itcast.type(obj);  //存储类型
            //过滤
            if (type == 'function' || itcast.isWindow(obj)) {
                return false;
            }
            return type == 'array' || length == 0 || typeof length == 'number' && length > 0 && (length - 1) in obj;
        }
    });

    //工具类
    itcast.extend({
        isReady: false,
        each: function (obj, callback) {
            for (var i = 0; i < obj.length; i++) {
                if(callback.call(obj[i], obj[i], i)==false) {
                    break;
                }
            }
            //返回被遍历的对象
            return obj;
        },
        map: function (arr, callback, args) {
            var value,
                l=arr.length,
                i= 0,
             ret = [];
            for (; i < l; i++) {
                // 获取callback执行后的结果
                value = callback(arr[i], i, args);
                // 判断是否 为null 或者 undefined值
                // 如果不为上述值，就将其追加到ret数组内。
                if (value != null) {
                    ret.push(value);
                }
            }
            return Array.prototype.concat.apply([],ret);
        },
        //将html字符串转换成html元素
        parseHTML: function (html) {
            var ret=[];
            var div=document.createElement('div');
            div.innerHTML=html;
            for(var i=0;i<div.childNodes.length;i++){
                if(div.childNodes[i].nodeType===1){
                    ret.push(div.childNodes[i]);
                }
            }
            return ret;
        },
        type: function (obj) {
            if(obj==null){
                return obj+ '';
            }
            //不为对象就是基本数据类型
            return typeof obj==='object'?
                Object.prototype.toString.call(obj).slice(8,-1).toLowerCase():typeof obj;
        }
    });

    //继续添加方法
    itcast.fn.extend({
      appendTo: function (target) {
          var self=this,
              node,
              ret=[];
          target=itcast(target);
          console.log(target);
          target.each( function (telem,i) {
              console.log(telem);
              self.each(function (selem) {
                  console.log(selem);
                  node=i===0?selem:selem.cloneNode(true);
                  ret.push(node);
                  telem.appendChild(node);
                  console.log(selem);
              })
          })
          //实现链式编程
          return itcast(ret);
      },
      append: function (source) {
          var text;
          if(itcast.isString(source)&&!itcast.isHTML(source)){
              text=source;
              source=itcast();
              source[0]=document.createTextNode(text);
              source.length=1;
          }else{
              source=itcast(source);
          }
          source.appendTo(this);
          return this;
      },
      prependTo: function (target) {
            var self=this,
                firstChild,
                node,
                ret=[];
          target=itcast(target);
          //console.log(target);
          target.each( function (telem,i) {
              //console.log(telem);
              firstChild=telem.firstChild;
              self.each(function (selem) {
                    node=i===0?selem:selem.cloneNode(true);
                    ret.push(node);
                    //在目标元素的第一个子节点 前   添加  子节点
                    telem.insertBefore(node,firstChild);
                })
            })
          //实现链式编程
            return itcast(ret);
          console.log(itcast(ret));
      },
        prepend: function (source) {
            var text;
            if(itcast.isString(source)&&!itcast.isHTML(source)){
                text=source;
                source=itcast();
                source[0]=document.createTextNode(text);
                source.length=1;
            }else{
                source=itcast(source);
            }
            source.prependTo(this);
            return this;
        },
        //之前的  append appendTo  prepend prependTo都是在
        //在改变   向每个匹配的元素内部前置内容
        //before是在 匹配的元素前面  设置内容
        //itcast().before(newNode);
      before: function (newNode) {
         var text;
          if(itcast.isString(newNode)&&!itcast.isHTML(newNode)){
            text=newNode;
              newNode=itcast();
              newNode[0]=document.createElement(text);
              newNode.length=1;
          }else{
              newNode=itcast(newNode);
          }
          //遍历this
          this.each(function (elem,i) {
              //elem  与  newNode是平级关系
              newNode.each(function () {
                  //用被添加节点的父节点调用insertBefore
                  var node;
                 // node=i==0?this:this.cloneNode(true);
                //  elem.parentNode.insertBefore(node,elem);
                  elem.parentNode.insertBefore(i==0?this:this.cloneNode(true),elem);
              })
          })
          return this;
      },
       //after: function (newNode) {
       //   var text,
       //       that=this;
       //    if(itcast.isString(newNode) && !itcast.isHTML(newNode)){
       //        text = newNode;
       //        newNode = this.constructor();
       //        newNode[0] = document.createTextNode(text);
       //        newNode.length = 1;
       //    }
       //    // 其他类型
       //    else {
       //        newNode = this.constructor(newNode);
       //    }
       //   this.each(function (elem, i) {
       //       //用倒序方式遍历 newNode
       //       for(var j=newNode.length-1;j>=0;j--){
       //           var node=i==0?newNode[j]:newNode[j].cloneNode(true);
       //           that.constructor.insertAfter(node,elem);
       //       }
       //   })
       //    return this;
       //},
        after: function (newNode) {
            var text,
                that=this;
            if(itcast.isString(newNode) && !itcast.isHTML(newNode)){
                text = newNode;
                newNode = this.constructor();
                newNode[0] = document.createTextNode(text);
                newNode.length = 1;
            }
            // 其他类型
            else {
                newNode = this.constructor(newNode);
            }
            this.each(function (elem, i) {
                //使用文档片段
                //每一次遍历  都新建一个文档片段
                var frag=document.createDocumentFragment();
                //把所有要添加的元素节点 统一存储在frag上
                newNode.each(function () {
                    frag.appendChild(i==0?this:this.cloneNode(true));
                })
                //再一起添加到指定目标元素后
                that.constructor.insertAfter(frag,elem);
            })
            return this;
        },
        next: function () {
            var ret=[];
            this.each(function () {
                for(var node=this.nextSibling;node;node=node.nextSibling){
                    if(node.nodeType==1){
                        ret.push(node);
                        break;
                    }
                }
            })
        }
    });

    itcast.extend({
        insertAfter: function (newNode, node) {
            node.parentNode.insertBefore(newNode,node.nextSibling);
        },
        unique: function (arr) {
            var ret=[];
            arr.forEach(function (v) {
                if(ret.indexOf(v)==-1){
                    ret.push(v);
                }
            })
            return ret;
        }
    })

    itcast.fn.extend({
        //<itcast>.click(callback)
     click: function (callback) {
         return this.each(function () {
             //dom.addEventListener(type,callback,false/true);
             this.addEventListener('click',callback);
         })
     },
     on: function (type,callback) {
         return this.each(function () {
             this.addEventListener(type,callback);
         })
     },
        off:function(type,callback){
            return this.each(function () {
                this.removeEventListener(type,callback);
            })
        }
    })

    //添加快捷事件绑定的方法
    //click,dblclick,mouseover,mouseout,mouseenter,mouseleave,mousemove,keyup,keydown,keypress.
    //focus,blur
    //each(arr,function(){})
    itcast.each(('click dblclick mouseover mouseout mouseenter mouseleave mousemove ' +
    'keypress keydown keyup focus blur').split(' '), function(type) {
        itcast.fn[type] = function(callback) {
            return this.on(type, callback);
        };
    });


    //样式模块
    function getCss(dom,name){
        return window.getComputedStyle(dom)[name];
    }

    function setCss(dom,name,value){
        //函数执行时，由itcastdom对象调用。
        //有可能传name和 value两个参数
        //只传name不传value的情况，有两种情形
        //即name为 对象的{'width':100px,'height':300px}形式   和   只有一个dom元素
        //name为 对象的{}形式 时候   setCss（this，name）
        //name为一个dom元素时候   获取dom元素  getCss(this,name)
        //
        //传name和value两个值时 直接设置  setCss(this,name,value)

        if(value==undefined){
            //只传name一个值得时候  不传value
            //name为数组形式  {'width':100px,'height':300px}
            //name数组中的某一项k
            for(var k in name){
                dom.style[k]=name[k];
            }
        }else{
            //传name和value两个值时
            dom.style[name]=value;
        }

    }

    itcast.fn.extend({
        css: function (name, value) {
            if(value==undefined){
                if(typeof name=='object'){
                    this.each(function () {
                        setCss(this,name);
                    })
                }
                else{
                    //可能为空
                    return this.length>0?getCss(this[0],name):" ";
                }
            }else{
                this.each(function () {
                    setCss(this,name,value);
                })
            }
            return this;
        }
    })




     // / 选择器引擎
    // 通过select函数 来查询dom元素
    var select = function(selector, context) {
        // 存储所有获取到的dom元素
        var ret = [];
        // 判断是否指定了context
        if (context) {
            // context 是 dom对象
            // 使用context调用querySelectorAll 获取dom元素
            // 将其转换成真数组返回
            if (context.nodeType === 1) {
                return Array.prototype.slice.call(context.querySelectorAll(selector));
            }
            // context 是 dom数组或伪数组
            // 遍历context，使用当前遍历到的元素调用querySelectorAll 获取dom元素
            // 得到结果doms，要将其所有dom元素 追加到 ret数组内，
            else if (context instanceof Array ||
                (typeof context === 'object' && 'length' in context)) {
                for (var i = 0, l = context.length; i < l; i++) {
                    var doms = context[i].querySelectorAll(selector);
                    for (var j = 0, k = doms.length; j < k; j++) {
                        ret.push(doms[j]);
                    }
                }
            }
            // context 为 字符串即选择器
            else {
                return Array.prototype.slice.call(
                    document.querySelectorAll(context + ' ' + selector));
            }
            return ret;
        }
        // 如果context没有传入实参
        // 通过document调用querySelectorAll来直接获取dom元素
        else {
            return Array.prototype.slice.call(document.querySelectorAll(selector));
        }
    };
    document.addEventListener('DOMContentLoaded', function() {
        itcast.isReady = true;
    })
    global.$=global.itcast=itcast;

}(window))