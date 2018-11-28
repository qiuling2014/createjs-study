/*
 * 全站公共脚本,基于jquery-2.1.1脚本库，库中已嵌入tap,transition
 */
!function(){
	/*
	 * 设备信息
	 */
	window.phone = {
		app:function(){
			var userAgent = navigator.userAgent;
		    if( userAgent.indexOf("MicroMessenger") > -1 ) {  
		        return "wx";  
		    }
		    else {
		        return "other";  
		    }
		},
		system:function(){
			var userAgent = navigator.userAgent;
			if ( userAgent.indexOf("Android") > -1 ){
				return "Android";
			}
			else if ( userAgent.indexOf("iPhone") > -1 || userAgent.indexOf("iPad") > -1 ){
				return "Ios";
			}
			else{
				return "Pc";
			}
		}
	};
	/*
	 * 页面元素
	 */
	window.page = {
		clientWidth:document.documentElement.clientWidth>640?640:document.documentElement.clientWidth,
		clientHeight:document.documentElement.clientHeight,
		setScale:function(){
			var h = this.clientWidth*1040/640;
			if ( this.clientHeight < h ){
				page.scale = this.clientHeight/h;
				$("body").removeClass("need-move");
				$("body").addClass("need-scale");
				$(".scale").each(function(){
					this.style.transform = "scale("+ page.scale +")";
					this.style.webkitTransform = "scale("+ page.scale +")";
				})
			}
			else{
				page.scale = 1;
				$("body").removeClass("need-scale");
				$("body").addClass("need-move");
				$(".scale").each(function(){
					this.style.transform = "";
					this.style.webkitTransform = "";
				})
			}
		},
		init:function(){
			this.setScale();
			$(window).on("resize",function(){
				page.clientWidth = document.documentElement.clientWidth>640?640:document.documentElement.clientWidth;
				page.clientHeight = document.documentElement.clientHeight;
				page.setScale();
			});
			document.addEventListener("touchmove",function(event){
				event.preventDefault();
			},{passive:false});
			createjs.Ticker.setFPS(40);
			/*
			 * 捕捉complete
			 */
			if ( phone.app() == "wx" ){
			    if ( typeof(wx) == "object" ){
				    wx.ready(function(){
						bgm.init();
						sound.init();
						window.onload = page.complete();
				    })
			    }
			    else{
			    	if ( typeof(WeixinJSBridge) != "undefined" ){
						bgm.init();
						sound.init();
			    		window.onload = page.complete();
			    	}
			    	else{
						document.addEventListener("WeixinJSBridgeReady",function(){
							bgm.init();
							sound.init();
							window.onload = page.complete();
					    },false);
			    	}
			    }
			}
			else{
				bgm.init();
				sound.init();
				window.onload = page.complete();
				$(document).one("touchstart",function(){
					bgm.play();
				})
			}
		},
		downImgs:function(arr,obj,callback){
			var _this = this;
			for ( var i=0;i<arr.length;i++ ){
				_this.download(arr[i],obj,arr.length,callback);
			}
		},
		download:function(src,obj,length,callback){
			var img = new Image();
			img.crossOrigin = 'anonymous';
			img.src = src;
			var name = img.src.substring(img.src.lastIndexOf("/")+1,img.src.lastIndexOf("."));
			if ( img.complete ){
				obj[name] = img;
				obj.length ++;
				if ( obj.length >= length && callback ){
					callback();
				}
			}
			else{
				img.onload = function(){
					obj[name] = img;
					obj.length ++;
					if ( obj.length >= length && callback ){
						callback();
					}
				};
			}
		},
		complete:function(){
			var _this = this;
			/*
			 * 加载loading页
			 */
			var imgarr = [
				"images/loading/bg.png",
				"images/loading/date.png",
				"images/loading/t1m.png",
				"images/loading/t2m.png",
				"images/loading/t3m.png",
				"images/loading/t4m.png",
				"images/loading/t2.png",
				"images/loading/t4.png",
				"images/loading/1.png",
				"images/loading/2.png",
				"images/loading/3.png",
				"images/loading/4.png"
			];
			_this.imgarr = {"length":0};
			_this.downImgs(imgarr,_this.imgarr,function(){
				_this.loaded();
			});
		},
		loaded:function(){
			var _this = this;
			_this.canvas = document.getElementById("loading-canvas");
			_this.canvas.width = 640;
			_this.canvas.height = 1240;
			_this.stage = new createjs.Stage(_this.canvas);
			createjs.Ticker.addEventListener("tick",_this.tick);
			_this.ready();
			game.init();
		},
		tick:function(){
			var _this = page;
			_this.stage.update();
		},
		zIndex:100,
		changePower:function(oldDiv,newDiv,callback){
			$(newDiv).css({"display":"block","opacity":0,"visibility":"visible","zIndex":page.zIndex}).addClass("on").transition({opacity:1,complete:function(){
				page.zIndex ++;
				if ( oldDiv != 0 ){
					$(oldDiv).hide().removeClass("on");
				}
				if ( typeof(callback) == "function" ){
					callback();
				}
			}},500,"linear");
		},
		closePower:function(div,callback){
			$(div).transition({opacity:0,complete:function(){
				$(div).hide().removeClass("on");
				if ( typeof(callback) == "function" ){
					callback();
				}
			}},500,"linear")
		},
		getBitmap:function(name,x,y,regX,regY,alpha){
			var _this = this;
			var bitmap = new createjs.Bitmap(_this.imgarr[name]);
			bitmap.name = name;
			bitmap.regX = regX;
			bitmap.regY = regY;
			bitmap.x = game.setNewX(bitmap,x);
			bitmap.y = game.setNewY(bitmap,y);
			bitmap.alpha = alpha;
			bitmap.cache(0,0,bitmap.getBounds().width,bitmap.getBounds().height);
			return bitmap;
		},
		getContainer:function(name,x,y,regX,regY,alpha){
			var _this = this;
			var container = new createjs.Container();
			container.name = name;
			container.regX = regX;
			container.regY = regY;
			container.x = game.setNewX(container,x);
			container.y = game.setNewY(container,y);
			container.alpha = alpha;
			return container;
		},
		ready:function(){
			var _this = this;
			/*
			 * 背景
			 */
			_this.stage.alpha = 0;
			_this.stage.addChild(_this.getBitmap("bg",0,0,0,0,1));
			/*
			 * 日期
			 */
			_this.startDate = 1;
			_this.endDate = 22;
			_this.dateData = {
				images: [_this.imgarr["date"]],
				frames: [
				 		[469,0,32,46],
				 		[0,0,28,46],
				 		[50,0,30,46],
				 		[104,0,28,46],
				 		[153,0,33,46],
				 		[209,0,28,46],
				 		[259,0,31,46],
				 		[311,0,31,46],
				 		[363,0,32,46],
				 		[415,0,32,46]
				],
				animations: {
				 	"0":[0],
				 	"1":[1],
				 	"2":[2],
				 	"3":[3],
				 	"4":[4],
				 	"5":[5],
				 	"6":[6],
				 	"7":[7],
				 	"8":[8],
				 	"9":[9]
				}
			};
			_this.spritesheet = new createjs.SpriteSheet(_this.dateData);
			var f1 = _this.getBitmap("1",249,486,0,0,0);
			f1.name = "f1";
			_this.stage.addChild(f1);
			var f2 = _this.getBitmap("2",249,448,0,0,0);
			f2.name = "f2";
			_this.stage.addChild(f2);
			var f3 = _this.getBitmap("3",249,397,0,0,0);
			f3.name = "f3";
			_this.stage.addChild(f3);
			var f4 = _this.getBitmap("4",251,333,0,0,0);
			f4.name = "f4";
			_this.stage.addChild(f4);
			/*
			 * 文案1
			 */
			var t1m = _this.getBitmap("t1m",160,579,0,0,0);
			t1m.name = "t1m";
			_this.stage.addChild(t1m);
			t1m.uncache();
			t1m.blur = 20;
			var blur = new createjs.BlurFilter(t1m.blur,t1m.blur,1);
			t1m.filters = [blur];
			t1m.cache(0,0,t1m.getBounds().width,t1m.getBounds().height);
			var t2m = _this.getBitmap("t2m",160,579,0,0,0);
			t2m.name = "t2m";
			_this.stage.addChild(t2m);
			t2m.uncache();
			t2m.blur = 20;
			var blur = new createjs.BlurFilter(t2m.blur,t2m.blur,1);
			t2m.filters = [blur];
			t2m.cache(0,0,t2m.getBounds().width,t2m.getBounds().height);
			var t3m = _this.getBitmap("t3m",160,579,0,0,0);
			t3m.name = "t3m";
			_this.stage.addChild(t3m);
			t3m.uncache();
			t3m.blur = 20;
			var blur = new createjs.BlurFilter(t3m.blur,t3m.blur,1);
			t3m.filters = [blur];
			t3m.cache(0,0,t3m.getBounds().width,t3m.getBounds().height);
			var t4m = _this.getBitmap("t4m",160,579,0,0,0);
			t4m.name = "t4m";
			_this.stage.addChild(t4m);
			t4m.uncache();
			t4m.blur = 20;
			var blur = new createjs.BlurFilter(t4m.blur,t4m.blur,1);
			t4m.filters = [blur];
			t4m.cache(0,0,t4m.getBounds().width,t4m.getBounds().height);
			var t2 = _this.getBitmap("t2",160,579,0,0,0);
			t2.name = "t2";
			_this.stage.addChild(t2);
			/*
			 * 文案4
			 */
			var t4 = _this.getBitmap("t4",133,842,191,65,0);
			t4.scaleX = 0.5;
			t4.scaleY = 0.5;
			t4.y += 300;
			_this.stage.addChild(t4);
			_this.getDates(_this.startDate);
			createjs.Tween.get(_this.stage).to({alpha:1},500).call(function(){
				_this.fanPage();
				_this.ani();
			});
		},
		fanPage:function(){
			var _this = this;
			var f1 = _this.stage.getChildByName("f1");
			var f2 = _this.stage.getChildByName("f2");
			var f3 = _this.stage.getChildByName("f3");
			var f4 = _this.stage.getChildByName("f4");
			f1.alpha = 1;
			setTimeout(function(){
				f1.alpha = 0;
				f2.alpha = 1;
				setTimeout(function(){
					_this.startDate ++;
					_this.getDates(_this.startDate);
					f2.alpha = 0;
					f3.alpha = 1;
					setTimeout(function(){
						f3.alpha = 0;
						f4.alpha = 1;
						setTimeout(function(){
							f4.alpha = 0;
							if ( _this.startDate < _this.endDate ){
								_this.fanPage();
							}
						},30)
					},30)
				},30)
			},30)
			sound.play("date");
		},
		ani:function(){
			var _this = this;
			var t1m = _this.stage.getChildByName("t1m");
			var t2m = _this.stage.getChildByName("t2m");
			var t3m = _this.stage.getChildByName("t3m");
			var t4m = _this.stage.getChildByName("t4m");
			_this.missFilter(t1m,function(){
			});
			setTimeout(function(){
				_this.missFilter(t2m,function(){
				});
			},300)
			setTimeout(function(){
				_this.missFilter(t3m,function(){
				});
			},600)
			setTimeout(function(){
				_this.missFilter(t4m,function(){
					var t4 = _this.stage.getChildByName("t4");
					var y = t4.y;
					createjs.Tween.get(t4).to({alpha:1,y:y-300,scaleX:1,scaleY:1},1000,createjs.Ease.bounceInOut).call(function(){
						setTimeout(function(){
							game.aniDown = true;
							game.ready();
						},600)
					});
				});
			},900)
			var t2 = _this.stage.getChildByName("t2");
			createjs.Tween.get(t2).wait(1000).to({alpha:1},2000);
		},
		getDates:function(dates){
			var _this = this;
			var date = _this.stage.getChildByName("date");
			if ( date ){
				_this.stage.removeChild(date);
			}
			var date = new createjs.BitmapText(dates.toString(),_this.spritesheet);
			date.name = "date";
			date.x = 310 - date.getBounds().width/2;
			date.y = 434;
			date.letterSpacing = 6;
			_this.stage.addChildAt(date,2);
			date.cache(0,0,date.getBounds().width,date.getBounds().height);
		},
		downPercent:function(){
			var _this = this;
			var percent = _this.stage.getChildByName("percent");
			if ( percent ){
				_this.stage.removeChild(percent);
			}
			var percent = new createjs.Text(parseInt(game.imgarr.length/game.imgTotal*100)+"%", "20px Arial", "#dd8154");
			percent.name = "percent";
			percent.x = (640 - percent.getBounds().width)/2;
			percent.y = 528;
			_this.stage.addChild(percent);
		},
		missFilter:function(tag,callback){
			createjs.Tween.get(tag).to({alpha:1},200);
			var autoInterval = setInterval(function(){
				tag.blur--;
				tag.uncache();
				var blur = new createjs.BlurFilter(tag.blur,tag.blur,1);
				tag.filters = [blur];
				tag.cache(0,0,tag.getBounds().width,tag.getBounds().height);
				if ( tag.blur <= 1 ){
					clearInterval(autoInterval);
					if ( callback ){
						callback();
					}
				}
			},70)
		}
	};
	/*
	 * 主线逻辑
	 */
	window.game = {
		downImgs:function(arr,obj,callback){
			var _this = this;
			for ( var i=0;i<arr.length;i++ ){
				_this.download(arr[i],obj,arr.length,callback);
			}
		},
		download:function(src,obj,length,callback){
			var _this = this;
			var img = new Image();
			img.crossOrigin = 'anonymous';
			img.src = src;
			var name = img.src.substring(img.src.lastIndexOf("/")+1,img.src.lastIndexOf("."));
			if ( img.complete ){
				obj[name] = img;
				callback();
			}
			else{
				img.onload = function(){
					obj[name] = img;
					callback();
				};
			}
		},
		ready:function(){
			var _this = this;
			if ( !_this.imgdownload || !_this.aniDown ){
				return false;
			}
			_this.slideInit();
			sound.pause();
			createjs.Ticker.removeEventListener("tick",page.tick);
//			if ( phone.system() == "Android" ){
//				document.getElementById("game").style.display = "block";
//				_this.canvas = document.getElementById("loading-canvas");
//				$("#game").empty().append($(_this.canvas));
//			}
//			else{
//				document.getElementById("game").style.display = "block";
//				_this.canvas = document.getElementById("game-canvas");
//				_this.canvas.width = 640;
//				_this.canvas.height = 1240;
//			}
				document.getElementById("game").style.display = "block";
				_this.canvas = document.getElementById("loading-canvas");
				$("#game").empty().append($(_this.canvas));
			_this.stage = new createjs.Stage(_this.canvas);
			_this.stage.alpha = 0;
			createjs.Touch.enable(_this.stage);
			createjs.Ticker.addEventListener("tick",_this.tick);
			_this.getEle();
			_this.enter();
		},
		enter:function(){
			var _this = this;
			var h = page.clientHeight*640/page.clientWidth;
			var tech = new createjs.Container();
			tech.name = "tech";
			_this.stage.addChild(tech);
			var shape = new createjs.Shape();
			shape.graphics.beginFill("rgba(0,0,0,.7)").drawRect(0,0,640,1240);
			tech.addChild(shape);
			var texts = new createjs.Bitmap(_this.imgarr["texts"]);
			texts.name = "texts";
			texts.alpha = 0;
			texts.y = 1240- (1240-h)/2 - 157 - 47;
			texts.x = 356;
			_this.stage.addChild(texts);
			var textss = new createjs.Bitmap(_this.imgarr["text"]);
			textss.name = "textss";
			textss.alpha = 0;
			textss.y = 1240- (1240-h)/2 - 157 - 89;
			textss.x = 314;
			_this.stage.addChild(textss);
			var hand = new createjs.Bitmap(_this.imgarr["hand"]);
			hand.name = "hand";
			hand.alpha = 0;
			hand.y = 1240- (1240-h)/2 - 104 - 53;
			hand.x = 518;
			_this.stage.addChild(hand);
			_this.showHand();
			createjs.Tween.get(_this.stage,{override:true}).to({alpha:1},500,createjs.Ease.linear);
			if ( args.fr ){
				window.h6app_shareConfig.shareData.link = "https://www.html5case.com.cn/case/luckin-coffee/2/1/?fr=" + args.fr;
				window.setShareData()
			}
		},
		moveHand:function(ele){
			var _this = this;
			createjs.Tween.get(ele,{override:true}).to({x:360},1000,createjs.Ease.linear).call(function(){
				createjs.Tween.get(ele,{override:true}).to({alpha:0},300,createjs.Ease.linear).call(function(){
					ele.x = 518;
					createjs.Tween.get(ele,{override:true}).to({alpha:1},300,createjs.Ease.linear).call(function(){
						_this.moveHand(ele);
					});
				});
			});
		},
		showHand:function(){
			_this = this;
			var hand = _this.stage.getChildByName("hand");
			var texts = _this.stage.getChildByName("texts");
			var textss = _this.stage.getChildByName("textss");
			if ( _this.step != 0 ){
				createjs.Tween.get(texts).to({alpha:1},300,createjs.Ease.linear);
			}
			else{
				createjs.Tween.get(textss).to({alpha:1},300,createjs.Ease.linear);
			}
			createjs.Tween.get(hand,{override:true});
			hand.x = 518;
			createjs.Tween.get(hand).to({alpha:1},300,createjs.Ease.linear).call(function(){
				_this.moveHand(hand);
			});
		},
		hideHand:function(){
			_this = this;
			if ( typeof(_this.autoshowhand) ){
				clearTimeout(_this.autoshowhand);
			}
			var hand = _this.stage.getChildByName("hand");
			createjs.Tween.get(hand,{override:true}).to({alpha:0},300,createjs.Ease.linear);
			var texts = _this.stage.getChildByName("texts");
			createjs.Tween.get(texts,{override:true}).to({alpha:0},300,createjs.Ease.linear);
			var textss = _this.stage.getChildByName("textss");
			createjs.Tween.get(textss,{override:true}).to({alpha:0},300,createjs.Ease.linear);
		},
		slideInit:function(){
			var _this = this;
			_this.cantouch = true;
			_this.animateIndex = 0;
			_this.mousedown = false;
			_this.x1 = 0;
			_this.x2 = 0;
			_this.step = 0;
		    document.getElementById("game").addEventListener('touchstart', _this.slideDown);
		    document.getElementById("game").addEventListener('touchmove', _this.slideMove);
		    document.getElementById("game").addEventListener('touchend', _this.slideUp);
		    document.getElementById("game").addEventListener('mousedown', _this.slideDown);
		    document.getElementById("game").addEventListener('mousemove', _this.slideMove);
		    document.getElementById("game").addEventListener('mouseup', _this.slideUp);
		},
		slideDown:function(e){
			var _this = game;
	        e.preventDefault();
	        var tech = _this.stage.getChildByName("tech");
	        if ( tech ){
				createjs.Tween.get(tech,{override:true}).to({alpha:0},300,createjs.Ease.linear).call(function(){
					_this.stage.removeChild(tech);
				});
	        }
        	_this.mousedown = true;
	        switch(e.type){
	            case "mousedown":
	                _this.x1 = e.pageX;
	            	break;
	            case "touchstart":
	                _this.x1 = e.targetTouches[0].pageX;
	            	break;
	    	}
		},
		slideMove:function(e){
			var _this = game;
	        e.preventDefault();
		    e.stopPropagation();
			if ( !_this.mousedown ){
				return false;
			}
            switch(e.type){
	            case "mousemove":
	                _this.x2 = e.pageX;
	            	break;
	            case "touchmove":
	                _this.x2 = e.targetTouches[0].pageX;
	            	break;
    		}
    		var distance = _this.x2 - _this.x1;
    		if ( distance < -30 ){
    			if ( !_this.cantouch || _this.animating ){
    				return false;
    			}
	      		_this.hideHand();
    			_this.mousedown = false;
    			_this.cantouch = false;
    			switch ( _this.step ){
    				case 0:
    					_this.step = 1;
    					if ( _this.answer[0] < 0 ){
    						_this.goTo(2000,4,false);
    					}
    					else{
    						_this.goTo(2000,4,true);
    					}
    					break;
    				case 1:
    					_this.step = 2;
    					_this.goTo(3300,4,true);
    					break;
    				case 2:
    					_this.step = 3;
    					if ( _this.answer[1] < 0 ){
    						_this.goTo(3850,4,false);
    					}
    					else{
    						_this.goTo(3850,4,true);
    					}
    					break;
    				case 3:
    					_this.step = 4;
    					if ( _this.answer[2] < 0 ){
    						_this.goTo(4650,5,false);
    					}
    					else{
    						_this.goTo(4650,5,true);
    					}
    					break;
    				case 4:
    					_this.step = 5;
    					if ( _this.answer[3] < 0 ){
    						_this.goTo(5700,4,false);
    					}
    					else{
    						_this.goTo(5700,4,true);
    					}
    					break;
    				case 5:
    					_this.step = 6;
    					_this.goTo(3250,4,true);
    					break;
    				case 6:
    					_this.step = 7;
    					_this.goTo(7400,4,false);
    					break;
    			}
    		}
    		else if (  distance > 30 ){
    			if ( _this.step == 0 || _this.animating ){
    				return false;
    			}
	        	_this.hideHand();
    			_this.mousedown = false;
    			_this.cantouch = false;
    			switch ( _this.step ){
    				case 1:
    					_this.step = 0;
    					_this.backTo(0,4,true);
    					break;
    				case 2:
    					_this.step = 1;
    					_this.backTo(2000,4,true);
    					break;
    				case 3:
    					_this.step = 2;
    					_this.backTo(3300,4,true);
    					break;
    				case 4:
    					_this.step = 3;
    					_this.backTo(3850,5,true);
    					break;
    				case 5:
    					_this.step = 4;
    					_this.backTo(4650,4,true);
    					break;
    				case 6:
    					_this.step = 5;
    					_this.backTo(5700,4,true);
    					break;
    				case 7:
    					_this.step = 6;
    					_this.backTo(6250,4,true);
    					break;
    			}
    		}
		},
		slideUp:function(e){
			var _this = game;
	        e.preventDefault();
	        if ( !_this.cantouch ){
	        	return false;
	        }
		    _this.mousedown = false;
		},
		goTo:function(end,steps,type){
			var _this = this;
			_this.animating = true;
			_this.autoMove = setInterval(function(){
				_this.animateIndex += steps;
				if ( _this.animateIndex >= end ){
					clearInterval(_this.autoMove);
					_this.animateIndex = end;
					if ( type ){
						_this.cantouch = true;
						_this.showHand();
					}
					_this.animating = false;
				}
			},10)
		},
		backTo:function(end,steps,type){
			var _this = this;
			_this.animating = true;
			_this.autoMove = setInterval(function(){
				_this.animateIndex -= steps;
				if ( _this.animateIndex <= end ){
					_this.animateIndex = end;
					clearInterval(_this.autoMove);
					if ( type ){
						_this.cantouch = true;
						_this.showHand();
					}
					_this.animating = false;
				}
			},10)
		},
		eye:function(el1,el2){
			_this = this;
			el1.alpha = 1;
			el2.alpha = 0;
			setTimeout(function(){
				el1.alpha = 0;
				el2.alpha = 1;
				setTimeout(function(){
					_this.eye(el1,el2);
				},200)
			},parseInt(Math.random()*1000+1000))
		},
		dati:function(el,box,index,ask,text){
			var _this = this;
			el.addEventListener("mousedown",function(e){
				if ( _this.answer[index] > -1 || _this.cantouch ){
					return false;
				}
				if ( text ){
					textarr = text.split("/");
					for ( var i=0;i<textarr.length;i++ ){
						zhi:for ( var j=0;j<_this.data.length;j++ ){
							if ( textarr[i] == _this.data[j].name ){
								_this.data[j].num++;
								break zhi;
							}
						}
					}
				}
				if ( index == 4 ){
					_this.animateIndex += 1000;
					var str = _this.getMaxIndex();
					if ( str != "" ){
						_this.selectIndex = str;
					}
					else{
						for ( var i=0;i<_this.data.length;i++ ){
							if ( _this.data[i].name == text ){
								_this.selectIndex = i;
								break;
							}
						}
					}
					setTimeout(function(){
						_this.shengcheng();
					},1000)
				}
				_this.answer[index] = ask;
				var answer = box.getChildByName("answer");
				answer.x = el.x - 15;
				answer.y = el.y - 15;
				answer.alpha = 1;
				setTimeout(function(){
					createjs.Tween.get(box).to({alpha:0},300).call(function(){
						if ( index == 0 ){
							_this.step = 2;
							_this.goTo(3300,4,true);
						}
						if ( index == 1 ){
							_this.step = 4;
							_this.goTo(4650,5,false);
						}
						if ( index == 2 ){
							_this.step = 5;
							_this.goTo(5700,4,false);
						}
						if ( index == 3 ){
							_this.step = 6;
							_this.goTo(6250,4,true);
						}
					});
					switch ( ask ){
						case 0:
							_czc.push(["_trackEvent", "答题", "第"+ (index+1) +"题","选择A"]);
							break;
						case 1:
							_czc.push(["_trackEvent", "答题", "第"+ (index+1) +"题","选择B"]);
							break;
						case 2:
							_czc.push(["_trackEvent", "答题", "第"+ (index+1) +"题","选择C"]);
							break;
						case 3:
							_czc.push(["_trackEvent", "答题", "第"+ (index+1) +"题","选择D"]);
							break;
					}
				},1000)
				sound.play("answer");
			})
		},
		data:[
			{"name":"朋友","num":0},
			{"name":"恋人","num":0},
			{"name":"家人","num":0},
			{"name":"自己","num":0}
		],
		getMaxIndex:function(){
			var _this = this;
			var arr = [];
			for ( var i=0;i<_this.data.length;i++ ){
				arr.push(_this.data[i].num);
			}
			var max = Math.max.apply(Math,arr);
			var arrs = [];
			for ( var i=0;i<_this.data.length;i++ ){
				if ( _this.data[i].num == max ){
					arrs.push(_this.data[i].name);
				}
			}
			if ( arrs.length > 1 ){
				return ""
			}
			else{
				var r = parseInt(Math.random()*arrs.length);
				for ( var i=0;i<_this.data.length;i++ ){
					if ( _this.data[i].name == arrs[r] ){
						return i;
					}
				}
			}
		},
		getBitmap:function(name,x,y,regX,regY,alpha){
			var _this = this;
			var bitmap = new createjs.Bitmap(_this.imgarr[name]);
			bitmap.name = name;
			bitmap.regX = regX;
			bitmap.regY = regY;
			bitmap.x = _this.setNewX(bitmap,x);
			bitmap.y = _this.setNewY(bitmap,y);
			bitmap.alpha = alpha;
			bitmap.cache(0,0,bitmap.getBounds().width,bitmap.getBounds().height);
			return bitmap;
		},
		getContainer:function(name,x,y,regX,regY,alpha){
			var _this = this;
			var container = new createjs.Container();
			container.name = name;
			container.regX = regX;
			container.regY = regY;
			container.x = _this.setNewX(container,x);
			container.y = _this.setNewY(container,y);
			container.alpha = alpha;
			return container;
		},
		guagou:function(ele){
			var _this = game;
			createjs.Tween.get(ele).to({rotation:-3},1000,createjs.Ease.quadInOut).call(function(){
				createjs.Tween.get(ele).to({rotation:3},1000,createjs.Ease.quadInOut).call(function(){
					_this.guagou(ele);
				});
			});
		},
		guagous:function(ele){
			var _this = game;
			createjs.Tween.get(ele).to({rotation:-1},1000,createjs.Ease.quadInOut).call(function(){
				createjs.Tween.get(ele).to({rotation:1},1000,createjs.Ease.quadInOut).call(function(){
					_this.guagous(ele);
				});
			});
		},
		setNewX:function(ele,x){
			return x + ele.regX;
		},
		setNewY:function(ele,y){
			return y + ele.regY;
		},
		init:function(){
			var _this = this;
			var callback = function(){
				_this.imgarr.length ++;
				page.downPercent();
				if ( _this.imgarr.length >= _this.imgTotal ){
					_this.imgdownload = true;
					game.ready();
				}
			}
			var imgarr = [
				"images/game/text.png",
				"images/game/texts.png",
				"images/game/hand.png",
				"images/game/trainhouse.png",
				"images/game/trainroad.png",
				"images/game/train3.png",
				"images/game/ren2bg.png",
				"images/game/guagou.png",
				"images/game/ren2b.png",
				"images/game/ren2bx.png",
				"images/game/ren2a.png",
				"images/game/ren2ax.png",
				"images/game/ren2c1.png",
				"images/game/ren2c2.png",
				"images/game/ren2cx.png",
				"images/game/ask1bg.png",
				"images/game/door1.png",
				"images/game/door2.png",
				"images/game/pad.png",
				"images/game/ask1title.png",
				"images/game/ask1a.png",
				"images/game/ask1b.png",
				"images/game/ask1c.png",
				"images/game/ask1d.png",
				"images/game/officehouse.png",
				"images/game/officeboxbg.png",
				"images/game/girlx.png",
				"images/game/girlt1.png",
				"images/game/girlt2.png",
				"images/game/girls.png",
				"images/game/boyhand.png",
				"images/game/boys.png",
				"images/game/dn.png",
				"images/game/dnpm.png",
				"images/game/wenjianjia1.png",
				"images/game/wenjianjia2.png",
				"images/game/wenjianjia3.png",
				"images/game/shubiao.png",
				"images/game/shubiaowhite.png",
				"images/game/ask2title.png",
				"images/game/ask2a.png",
				"images/game/ask2b.png",
				"images/game/ask2c.png",
				"images/game/ask2d.png",
				"images/game/huwaibg.png",
				"images/game/zou1.png",
				"images/game/zou2.png",
				"images/game/zou3.png",
				"images/game/zou4.png",
				"images/game/ask3title.png",
				"images/game/ask3a.png",
				"images/game/ask3b.png",
				"images/game/ask3c.png",
				"images/game/ask3d.png",
				"images/game/yushibg1.png",
				"images/game/yushibg2.png",
				"images/game/yugang.png",
				"images/game/yugangtext.png",
				"images/game/men1.png",
				"images/game/men2.png",
				"images/game/hua.png",
				"images/game/gebo.png",
				"images/game/lian1.png",
				"images/game/lian2.png",
				"images/game/pao0.png",
				"images/game/pao1.png",
				"images/game/pao2.png",
				"images/game/pao3.png",
				"images/game/pao4.png",
				"images/game/pao5.png",
				"images/game/pao6.png",
				"images/game/pao7.png",
				"images/game/ask4title.png",
				"images/game/ask4a.png",
				"images/game/ask4b.png",
				"images/game/ask4c.png",
				"images/game/ask4d.png",
				"images/game/woshibg.png",
				"images/game/xiaobi.png",
				"images/game/lians1.png",
				"images/game/lians2.png",
				"images/game/ask5title.png",
				"images/game/ask5a.png",
				"images/game/ask5b.png",
				"images/game/ask5c.png",
				"images/game/ask5d.png",
				"images/game/answer0.png",
				"images/game/answer1.png"
			];
			_this.imgarr = {"length":0};
			_this.imgTotal = imgarr.length;
			var lengths = 10;
			_this.imgTotal += lengths;
			var img = $("body").find("img[loadsrc]");//图片数组
			_this.imgTotal += img.length;
			var k = 0;
			var auto = setInterval(function(){
				k++;
				callback();
				if ( k >= lengths ){
					clearInterval(auto);
				}
			},60)
			_this.downImgs(imgarr,_this.imgarr,callback);
			for ( var i=0;i<img.length;i++ ){
				var imgs = new Image();
				var imgDiv = img.eq(i);
				var imgsrc = imgDiv.attr("loadsrc");
				imgs.src = imgsrc;
				if(imgs.complete){
			    	imgDiv.attr("src",imgsrc).removeAttr("loadsrc");//有缓存
			    	callback();
				}
				else{
				    imgDiv.attr("src",imgsrc).load(function(){
				    	$(this).removeAttr("loadsrc");//无缓存
				    	callback();
				    })
				}
			}
			/*
			 * 再玩一次
			 */
			$(document).on("tap",".again",function(event){
				event.preventDefault();
				_this.shengcheng();
				_czc.push(["_trackEvent", "结果页", "重新生成","点击"]);
			})
			/*
			 * 条款
			 */
			_this.homescroll = new IScroll("#tiaokuan", { probeType: 3, scrollX: false, freeScroll: true, bounce: false });
			$(document).on("tap",".detail",function(event){
				event.preventDefault();
				page.changePower(0,"#tiaokuan",function(){
					_this.homescroll.refresh();
				});
				_czc.push(["_trackEvent", "结果页", "查看条款","点击"]);
			})
			$(document).on("tap",".return",function(event){
				event.preventDefault();
				page.closePower("#tiaokuan");
				_czc.push(["_trackEvent", "条款页", "返回","点击"]);
			})
			/*
			 * 弹窗
			 */
			$(document).on("tap",".get-1",function(event){
				event.preventDefault();
				$("#save-img").empty();
				page.changePower(0,"#shade",function(){
					$(".code").html("<img src='images/page/shade.png'/>");
				});
				_czc.push(["_trackEvent", "结果页", "领取全月畅读卡","点击"]);
			})
			$(document).on("tap",".close",function(event){
				event.preventDefault();
				$("#save-img").html("<img src='"+ _this.img.src +"'/>");
				page.closePower("#shade");
				_czc.push(["_trackEvent", "领取全月畅读卡", "返回","点击"]);
			})
			/*
			 * 外链
			 */
			$(document).on("tap",".get-2",function(event){
				event.preventDefault();
				_czc.push(["_trackEvent", "结果页", "领取五折咖啡券","点击"]);
				window.location.href = this.href;
			})
		},
		getEle:function(){
			var _this = game;
			/*
			 * 火车
			 */
			if ( !_this.stage.getChildByName("trainBox") ){
				var trainBox = _this.getContainer("trainBox",0,0,0,0,1);
				_this.stage.addChild(trainBox);
				var trainhouseBox = _this.getContainer("trainhouseBox",0,0,320,620,1);
				trainBox.addChild(trainhouseBox);
				var trainhouse1 = _this.getBitmap("trainhouse",0,0,0,0,1);
				trainhouseBox.addChild(trainhouse1);
				var trainhouse2 = _this.getBitmap("trainhouse",-2980,0,0,0,1);
				trainhouseBox.addChild(trainhouse2);
				var trainBoxs = _this.getContainer("trainBoxs",640,0,0,0,1);
				trainBox.addChild(trainBoxs);
				var ren2Box = _this.getContainer("ren2Box",1434,0,530,620,0);
				trainBoxs.addChild(ren2Box);
				ren2Box.addChild(_this.getBitmap("ren2bg",0,0,0,0,1));
				var ren2guagou1 = _this.getBitmap("guagou",166,116,30,20,1);
				ren2guagou1.rotation = 3;
				ren2Box.addChild(ren2guagou1);
				_this.guagou(ren2guagou1);
				var ren2guagou2 = _this.getBitmap("guagou",543,116,30,20,1);
				ren2guagou2.rotation = 3;
				ren2Box.addChild(ren2guagou2);
				_this.guagou(ren2guagou2);
				var ren2guagou3 = _this.getBitmap("guagou",354,116,30,20,1);
				ren2guagou3.rotation = 3;
				ren2Box.addChild(ren2guagou3);
				_this.guagou(ren2guagou3);
				var ren2Boxshow = _this.getContainer("ren2Boxshow",1734,0,530,620,0);
				trainBoxs.addChild(ren2Boxshow);
				var ren2b = _this.getBitmap("ren2b",242,479,83,270,1);
				ren2b.rotation = 1;
				_this.guagous(ren2b);
				ren2Boxshow.addChild(ren2b);
				ren2Boxshow.addChild(_this.getBitmap("ren2bx",250,732,0,0,1));
				var ren2a = _this.getBitmap("ren2a",63,518,65,240,1);
				ren2a.rotation = 1;
				_this.guagous(ren2a);
				ren2Boxshow.addChild(ren2a);
				ren2Boxshow.addChild(_this.getBitmap("ren2ax",75,745,0,0,1));
				var ren2c1 = _this.getBitmap("ren2c1",473,512,64,250,1);
				ren2Boxshow.addChild(ren2c1);
				_this.guagous(ren2c1);
				var ren2c2 = _this.getBitmap("ren2c2",473,512,64,250,0);
				ren2Boxshow.addChild(ren2c2);
				_this.guagous(ren2c2);
				_this.eye(ren2c1,ren2c2);
				ren2Boxshow.addChild(_this.getBitmap("ren2cx",475,744,0,0,1));
				trainBoxs.addChild(_this.getBitmap("train3",0,0,2068,692,1));
				trainBox.addChild(_this.getBitmap("trainroad",0,1158,0,0,1));
			}
			/*
			 * 问题一
			 */
			if ( !_this.stage.getChildByName("ask1Box") ){
				var ask1Box = _this.getContainer("ask1Box",0,0,320,320,1);
				_this.stage.addChildAt(ask1Box,0);
				ask1Box.addChild(_this.getBitmap("ask1bg",0,0,0,0,1));
				var shape1 = new createjs.Shape();
				shape1.graphics.beginFill("#ff0000").drawRoundRectComplex(105,105,214,956,10,0,0,10);
				var door1 = _this.getBitmap("door1",105,105,0,0,1);
				door1.mask = shape1;
				ask1Box.addChild(door1);
				var shape2 = new createjs.Shape();
				shape2.graphics.beginFill("#ff0000").drawRoundRectComplex(319,105,214,956,0,10,10,0);
				var door2 = _this.getBitmap("door2",319,105,0,0,1);
				door2.mask = shape2;
				ask1Box.addChild(door2);
				ask1Box.addChild(_this.getBitmap("pad",0,1240,0,0,1));
				var ask1BoxTimu = _this.getContainer("ask1BoxTimu",0,0,0,0,0);
				ask1Box.addChild(ask1BoxTimu);
				ask1BoxTimu.addChild(_this.getBitmap("ask1title",127,294,0,0,1));
				var ask1a = _this.getBitmap("ask1a",125,361,0,0,1);
				ask1BoxTimu.addChild(ask1a);
				var ask1b = _this.getBitmap("ask1b",131,460,0,0,1);
				ask1BoxTimu.addChild(ask1b);
				var ask1c = _this.getBitmap("ask1c",135,557,0,0,1);
				ask1BoxTimu.addChild(ask1c);
				var ask1d = _this.getBitmap("ask1d",148,689,0,0,1);
				ask1BoxTimu.addChild(ask1d);
				_this.dati(ask1a,ask1BoxTimu,0,0);
				_this.dati(ask1b,ask1BoxTimu,0,1);
				_this.dati(ask1c,ask1BoxTimu,0,2);
				_this.dati(ask1d,ask1BoxTimu,0,3);
				var answer = _this.getBitmap("answer0",0,0,0,0,0);
				answer.name = "answer";
				ask1BoxTimu.addChild(answer);
			}
			/*
			 * 办公室及题二
			 */
			if (  !_this.stage.getChildByName("office") ){
				var office = _this.getContainer("office",0,0,264,520,0);
				_this.stage.addChildAt(office,0);
				office.addChild(_this.getBitmap("officehouse",0,0,0,0,1));
				var officebox = _this.getContainer("officebox",0,0,0,0,1);
				office.addChild(officebox);
				officebox.addChild(_this.getBitmap("officeboxbg",0,0,0,0,1));
				var girlbox = _this.getContainer("girlbox",547,287,0,0,1);
				officebox.addChild(girlbox);
				girlbox.addChild(_this.getBitmap("girlx",47,373,0,0,1));
				var girlt1 = _this.getBitmap("girlt1",38,0,77,166,1);
				girlt1.rotation = 1;
				_this.guagous(girlt1);
				girlbox.addChild(girlt1);
				var girlt2 = _this.getBitmap("girlt2",38,0,77,166,1);
				girlt2.rotation = 1;
				_this.guagous(girlt2);
				girlbox.addChild(girlt2);
				_this.eye(girlt1,girlt2);
				girlbox.addChild(_this.getBitmap("girls",0,152,0,0,1));
				var dnbox = _this.getContainer("dnbox",426,-42,669,610,1);
				dnbox.scaleX = 0.22;
				dnbox.scaleY = 0.22;
				officebox.addChild(dnbox);
				dnbox.addChild(_this.getBitmap("dn",0,0,0,0,1));
				dnbox.addChild(_this.getBitmap("dnpm",0,0,0,0,1));
				var dnsbox = _this.getContainer("dnsbox",0,0,0,0,1);
				dnbox.addChild(dnsbox);
				dnsbox.addChild(_this.getBitmap("wenjianjia1",372,124,0,0,1));
				dnsbox.addChild(_this.getBitmap("wenjianjia2",372,124,0,0,0));
				dnsbox.addChild(_this.getBitmap("wenjianjia3",372,124,0,0,0));
				dnsbox.addChild(_this.getBitmap("shubiao",483,222,0,0,1));
				dnsbox.addChild(_this.getBitmap("shubiaowhite",430,167,0,0,0));
				var ask2BoxTimu = _this.getContainer("ask2BoxTimu",0,0,0,0,0);
				dnbox.addChild(ask2BoxTimu);
				ask2BoxTimu.addChild(_this.getBitmap("ask2title",417,146,0,0,1));
				var ask2a = _this.getBitmap("ask2a",412,266,0,0,1);
				ask2BoxTimu.addChild(ask2a);
				var ask2b = _this.getBitmap("ask2b",412,358,0,0,1);
				ask2BoxTimu.addChild(ask2b);
				var ask2c = _this.getBitmap("ask2c",412,450,0,0,1);
				ask2BoxTimu.addChild(ask2c);
				var ask2d = _this.getBitmap("ask2d",413,545,0,0,1);
				ask2BoxTimu.addChild(ask2d);
				_this.dati(ask2a,ask2BoxTimu,1,0,"朋友");
				_this.dati(ask2b,ask2BoxTimu,1,1,"恋人");
				_this.dati(ask2c,ask2BoxTimu,1,2,"家人");
				_this.dati(ask2d,ask2BoxTimu,1,3,"自己");
				var boybox = _this.getContainer("boybox",1003,389,0,0,1);
				officebox.addChild(boybox);
				var boyhand = _this.getBitmap("boyhand",0,231,26,140,1);
				boyhand.rotation = 3;
				_this.guagou(boyhand);
				boybox.addChild(boyhand);
				boybox.addChild(_this.getBitmap("boys",0,0,0,0,1));
				var answer = _this.getBitmap("answer1",0,0,0,0,0);
				answer.name = "answer";
				ask2BoxTimu.addChild(answer);
			}
			/*
			 * 户外及题三
			 */
			if (  !_this.stage.getChildByName("huwai") ){
				var huwai = _this.getContainer("huwai",-78,-40,490,280,0);
				_this.stage.addChildAt(huwai,0);
				huwai.addChild(_this.getBitmap("huwaibg",0,0,0,0,1));
				var zoubox = _this.getContainer("zoubox",270,366,108,346,1);
				zoubox.k = -1;
				huwai.addChild(zoubox);
				zoubox.addChild(_this.getBitmap("zou1",0,0,0,0,1));
				zoubox.addChild(_this.getBitmap("zou2",0,0,0,0,0));
				zoubox.addChild(_this.getBitmap("zou3",0,0,0,0,0));
				zoubox.addChild(_this.getBitmap("zou4",0,0,0,0,0));
				var ask3BoxTimu = _this.getContainer("ask3BoxTimu",0,0,0,0,0);
				huwai.addChild(ask3BoxTimu);
				ask3BoxTimu.addChild(_this.getBitmap("ask3title",592,871,0,0,1));
				var ask3a = _this.getBitmap("ask3a",534,969,0,0,1);
				ask3BoxTimu.addChild(ask3a);
				var ask3b = _this.getBitmap("ask3b",534,1059,0,0,1);
				ask3BoxTimu.addChild(ask3b);
				var ask3c = _this.getBitmap("ask3c",534,1150,0,0,1);
				ask3BoxTimu.addChild(ask3c);
				var ask3d = _this.getBitmap("ask3d",534,1269,0,0,1);
				ask3BoxTimu.addChild(ask3d);
				_this.dati(ask3a,ask3BoxTimu,2,0,"朋友");
				_this.dati(ask3b,ask3BoxTimu,2,1,"家人");
				_this.dati(ask3c,ask3BoxTimu,2,2,"恋人");
				_this.dati(ask3d,ask3BoxTimu,2,3,"自己");
				var answer = _this.getBitmap("answer1",0,0,0,0,0);
				answer.name = "answer";
				ask3BoxTimu.addChild(answer);
			}
			/*
			 * 浴室及题四
			 */
			if (  !_this.stage.getChildByName("yushi") ){
				var yushi = _this.getContainer("yushi",0,0,0,0,0);
				yushi.scaleX = 0.7;
				yushi.scaleY = 0.7;
				_this.stage.addChildAt(yushi,0);
				var yushibox = _this.getContainer("yushibox",0,0,2362,400,1);
				yushi.addChild(yushibox);
				yushibox.addChild(_this.getBitmap("yushibg1",0,0,0,0,1));
				yushibox.addChild(_this.getBitmap("yushibg2",1458,0,0,0,1));
				yushibox.addChild(_this.getBitmap("men1",2009,0,0,0,1));
				yushibox.addChild(_this.getBitmap("men2",2009,0,0,0,0));
				yushibox.addChild(_this.getBitmap("hua",1408,468,0,0,1));
				var gebo = _this.getBitmap("gebo",502,672,50,338,1);
				yushibox.addChild(gebo);
				_this.guagous(gebo);
				var lian1 = _this.getBitmap("lian1",766,594,0,0,1);
				yushibox.addChild(lian1);
				var lian2 = _this.getBitmap("lian2",766,594,0,0,0);
				yushibox.addChild(lian2);
				_this.eye(lian1,lian2);
				var pao = _this.getContainer("pao",65,934,0,0,1);
				yushibox.addChild(pao);
				pao.k = -1;
				pao.addChild(_this.getBitmap("pao0",0,0,0,0,1));
				pao.addChild(_this.getBitmap("pao1",0,0,0,0,1));
				pao.addChild(_this.getBitmap("pao2",0,0,0,0,1));
				pao.addChild(_this.getBitmap("pao3",0,0,0,0,1));
				pao.addChild(_this.getBitmap("pao4",0,0,0,0,1));
				pao.addChild(_this.getBitmap("pao5",0,0,0,0,1));
				pao.addChild(_this.getBitmap("pao6",0,0,0,0,1));
				pao.addChild(_this.getBitmap("pao7",0,0,0,0,1));
				_this.movePao(pao);
				yushibox.addChild(_this.getBitmap("yugang",49,984,0,0,1));
				var ask4BoxTimu = _this.getContainer("ask4BoxTimu",0,0,0,0,0);
				yushibox.addChild(ask4BoxTimu);
				ask4BoxTimu.addChild(_this.getBitmap("ask4title",442,253,0,0,1));
				var ask4a = _this.getBitmap("ask4a",375,352,0,0,1);
				ask4BoxTimu.addChild(ask4a);
				var ask4b = _this.getBitmap("ask4b",375,444,0,0,1);
				ask4BoxTimu.addChild(ask4b);
				var ask4c = _this.getBitmap("ask4c",375,537,0,0,1);
				ask4BoxTimu.addChild(ask4c);
				var ask4d = _this.getBitmap("ask4d",375,629,0,0,1);
				ask4BoxTimu.addChild(ask4d);
				_this.dati(ask4a,ask4BoxTimu,3,0,"自己");
				_this.dati(ask4b,ask4BoxTimu,3,1,"朋友");
				_this.dati(ask4c,ask4BoxTimu,3,2,"恋人");
				_this.dati(ask4d,ask4BoxTimu,3,3,"家人");
				var answer = _this.getBitmap("answer1",0,0,0,0,0);
				answer.name = "answer";
				ask4BoxTimu.addChild(answer);
				ask4BoxTimu.addChild(_this.getBitmap("yugangtext",697,1048,0,0,1));
			}
			/*
			 * 卧室及题五
			 */
			if (  !_this.stage.getChildByName("woshi") ){
				var woshi = _this.getContainer("woshi",0,0,0,0,0);
				woshi.scaleX = 0.78;
				woshi.scaleY = 0.78;
				_this.stage.addChildAt(woshi,0);
				woshi.addChild(_this.getBitmap("woshibg",0,0,0,0,1));
				var xiaobi = _this.getBitmap("xiaobi",368,642,24,208,1);
				woshi.addChild(xiaobi);
				_this.guagous(xiaobi);
				var lians1 = _this.getBitmap("lians1",406,416,0,0,1);
				woshi.addChild(lians1);
				var lians2 = _this.getBitmap("lians2",406,416,0,0,0);
				woshi.addChild(lians2);
				_this.eye(lians1,lians2);
				var ask5BoxTimu = _this.getContainer("ask5BoxTimu",0,0,0,0,0);
				woshi.addChild(ask5BoxTimu);
				ask5BoxTimu.addChild(_this.getBitmap("ask5title",663,210,0,0,1));
				var ask5a = _this.getBitmap("ask5a",601,318,0,0,1);
				ask5BoxTimu.addChild(ask5a);
				var ask5b = _this.getBitmap("ask5b",602,416,0,0,1);
				ask5BoxTimu.addChild(ask5b);
				var ask5c = _this.getBitmap("ask5c",602,512,0,0,1);
				ask5BoxTimu.addChild(ask5c);
				var ask5d = _this.getBitmap("ask5d",603,607,0,0,1);
				ask5BoxTimu.addChild(ask5d);
				_this.dati(ask5a,ask5BoxTimu,4,0,"恋人");
				_this.dati(ask5b,ask5BoxTimu,4,1,"家人");
				_this.dati(ask5c,ask5BoxTimu,4,2,"自己");
				_this.dati(ask5d,ask5BoxTimu,4,3,"朋友");
				var answer = _this.getBitmap("answer1",0,0,0,0,0);
				answer.name = "answer";
				ask5BoxTimu.addChild(answer);
			}
		},
		movePao:function(pao){
			var _this = this;
			for ( var i=0;i<pao.children.length;i++ ){
				if ( i != 0 ){
					pao.children[i].alpha = parseInt(Math.random()*2);
				}
			}
			setTimeout(function(){
				_this.movePao(pao);
			},parseInt(Math.random()*300+200))
		},
		tick:function(){
			var _this = game;
			/*
			 * 火车
			 */
			var trainBox = _this.stage.getChildByName("trainBox");
			var trainhouseBox = trainBox.getChildByName("trainhouseBox");
			var trainBoxs = trainBox.getChildByName("trainBoxs");
			var ren2Box = trainBoxs.getChildByName("ren2Box");
			var ren2Boxshow = trainBoxs.getChildByName("ren2Boxshow");
			var train3 = trainBoxs.getChildByName("train3");
			var trainroad = trainBox.getChildByName("trainroad");
			if ( _this.animateIndex <= 2340 ){
				//火车第一步匀速
				if ( _this.animateIndex <= 600 ){
					trainBoxs.x = Tween.Linear(_this.animateIndex,640,-1208-640,600);
					if ( _this.animateIndex > 0 ){
						sound.play("trainvoice");
					}
				}
				else if ( _this.animateIndex >= 600 ){
					trainBoxs.x = -1208;
				}
				//火车第二步加速4
				if ( _this.animateIndex > 600 && _this.animateIndex <= 1500 ){
					trainBoxs.x = Tween.Quad.easeOut(_this.animateIndex-600,-1208,-1934+1208,900);
					sound.play("trainvoice");
				}
				else if ( _this.animateIndex > 1500 ){
					trainBoxs.x = -1934;
				}
				//火车第三步放大100
				if ( _this.animateIndex < 700 ){
					train3.scaleX = 1;
					train3.scaleY = 1;
					trainhouseBox.scaleX = 1;
					trainhouseBox.scaleY = 1;
				}
				else if ( _this.animateIndex >= 700 && _this.animateIndex <= 900 ){
					train3.scaleX = Tween.Quad.easeOut(_this.animateIndex-700,1,2,200);
					train3.scaleY = Tween.Quad.easeOut(_this.animateIndex-700,1,2,200);
					trainhouseBox.scaleX = Tween.Quad.easeOut(_this.animateIndex-700,1,2,200);
					trainhouseBox.scaleY = Tween.Quad.easeOut(_this.animateIndex-700,1,2,200);
				}
				else if ( _this.animateIndex > 900 ){
					train3.scaleX = 3;
					train3.scaleY = 3;
					trainhouseBox.scaleX = 3;
					trainhouseBox.scaleY = 3;
				}
				//火车第四步消失100
				if ( _this.animateIndex <= 880 ){
					train3.alpha = 1;
					trainroad.alpha = 1;
				}
				else if ( _this.animateIndex > 880 && _this.animateIndex <= 940 ){
					train3.alpha = Tween.Linear(_this.animateIndex-880,1,-1,60);
					trainroad.alpha = Tween.Linear(_this.animateIndex-880,1,-1,60);
				}
				else if ( _this.animateIndex > 940 ){
					train3.alpha = 0;
					trainroad.alpha = 0;
				}
				//火车内出现
				if ( _this.animateIndex <= 900 ){
					ren2Box.alpha = 0;
					ren2Boxshow.alpha = 0;
				}
				else if ( _this.animateIndex > 880 && _this.animateIndex <= 1040 ){
					ren2Box.alpha = Tween.Linear(_this.animateIndex-880,0,1,160);
					ren2Boxshow.alpha = Tween.Linear(_this.animateIndex-880,0,1,160);
				}
				else if ( _this.animateIndex > 1040 ){
					ren2Box.alpha = 1;
					ren2Boxshow.alpha = 1;
				}
				//火车第六步眨眼女孩拉近
				if ( _this.animateIndex > 1500 && _this.animateIndex < 1600 ){
					ren2Box.scaleX = 1;
					ren2Box.scaleY = 1;
					ren2Boxshow.scaleX = 1;
					ren2Boxshow.scaleY = 1;
					trainBox.alpha = 1;
				}
				else if ( _this.animateIndex >= 1600 && _this.animateIndex < 1740 ){
					ren2Box.scaleX = Tween.Quad.easeOut(_this.animateIndex-1600,1,6,140);
					ren2Box.scaleY = Tween.Quad.easeOut(_this.animateIndex-1600,1,6,140);
					ren2Boxshow.scaleX = Tween.Quad.easeOut(_this.animateIndex-1600,1,6,140);
					ren2Boxshow.scaleY = Tween.Quad.easeOut(_this.animateIndex-1600,1,6,140);
					trainBox.alpha = Tween.Linear(_this.animateIndex-1600,1,-1,140);
					sound.pause();
				}
				else if ( _this.animateIndex >= 1740 ){
					ren2Box.scaleX = 7;
					ren2Box.scaleY = 7;
					ren2Boxshow.scaleX = 7;
					ren2Boxshow.scaleY = 7;
					trainBox.alpha = 0;
				}
			}
			else if ( _this.animateIndex > 2040 ){
				trainBox.alpha = 0;
			}
			/*
			 * 题目一
			 */
			var ask1Box = _this.stage.getChildByName("ask1Box");
			var door1 = ask1Box.getChildByName("door1");
			var door2 = ask1Box.getChildByName("door2");
			var pad = ask1Box.getChildByName("pad");
			var ask1BoxTimu = ask1Box.getChildByName("ask1BoxTimu");
			if ( _this.animateIndex < 1740 ){
				if ( _this.animateIndex > 1200 && _this.animateIndex < 1440 ){
					ask1Box.alpha = 0;
				}
				else if ( _this.animateIndex >= 1440 ){
					ask1Box.alpha = Tween.Linear(_this.animateIndex-1440,0,1,300);
				}
				pad.y = 1240;
			}
			else if ( _this.animateIndex >= 1740 && _this.animateIndex <= 2800 ){
				//pad升起
				if ( _this.animateIndex > 1750 && _this.animateIndex <= 1950 ){
					pad.y = Tween.Sine.easeOut(_this.animateIndex-1750,1240,-1240,200);
				}
				else if ( _this.animateIndex > 1950 ){
					pad.y = 0;
				}
				//题一
				if ( _this.answer[0] < 0 ){
					if ( _this.animateIndex <= 1950 ){
						ask1BoxTimu.alpha = 0;
					}
					else if ( _this.animateIndex > 1950 && _this.animateIndex <= 2000 ){
						ask1BoxTimu.alpha = Tween.Sine.easeOut(_this.animateIndex-1950,0,1,50);
					}
					else if ( _this.animateIndex > 2000 ){
						ask1BoxTimu.alpha = 1;
						_this.cantouch = false;
						_this.stopInertiaMove = true;
						_this.animateIndex = 2000;
					}
				}
				//pad落下
				if ( _this.animateIndex > 1950 && _this.animateIndex <= 2000 ){
					pad.y = 0;
				}
				else if ( _this.animateIndex > 2000 && _this.animateIndex <= 2200 ){
					pad.y = Tween.Sine.easeOut(_this.animateIndex-2000,0,1240,200);
				}
				else if ( _this.animateIndex > 2200 ){
					pad.y = 1240;
				}
				//开门
				if ( _this.animateIndex <= 2300 ){
					door1.x = 105;
					door2.x = 319;
				}
				else if ( _this.animateIndex > 2300 && _this.animateIndex <= 2500 ){
					door1.x = Tween.Sine.easeOut(_this.animateIndex-2300,105,-214,300);
					door2.x = Tween.Sine.easeOut(_this.animateIndex-2300,319,214,300);
					sound.play("traindoor");
				}
				else if ( _this.animateIndex > 2500 ){
					door1.x = -109;
					door2.x = 533;
				}
				//题目一场景消失
				if ( _this.animateIndex < 2500 ){
					ask1Box.scaleX = 1;
					ask1Box.scaleY = 1;
					ask1Box.alpha = 1;
				}
				else if ( _this.animateIndex >= 2500 && _this.animateIndex < 2800 ){
					ask1Box.scaleX = Tween.Quad.easeOut(_this.animateIndex-2500,1,0.6,300);
					ask1Box.scaleY = Tween.Quad.easeOut(_this.animateIndex-2500,1,0.6,300);
					ask1Box.alpha = Tween.Linear(_this.animateIndex-2500,1,-1,300);
				}
				else if ( _this.animateIndex >= 2800 ){
					ask1Box.scaleX = 1.6;
					ask1Box.scaleY = 1.6;
					ask1Box.alpha = 0;
				}
			}
			else if ( _this.animateIndex > 2800 ){
				ask1Box.alpha = 0;
			}
			/*
			 * 办公室
			 */
			var office = _this.stage.getChildByName("office");
			var officehouse = office.getChildByName("officehouse");
			var officebox = office.getChildByName("officebox");
			var boybox = officebox.getChildByName("boybox");
			var officeboxbg = officebox.getChildByName("officeboxbg");
			var dnbox = officebox.getChildByName("dnbox");
			var dnpm = dnbox.getChildByName("dnpm");
			var dnsbox = dnbox.getChildByName("dnsbox");
			var wenjianjia1 = dnsbox.getChildByName("wenjianjia1");
			var wenjianjia2 = dnsbox.getChildByName("wenjianjia2");
			var wenjianjia3 = dnsbox.getChildByName("wenjianjia3");
			var shubiao = dnsbox.getChildByName("shubiao");
			var shubiaowhite = dnsbox.getChildByName("shubiaowhite");
			var ask2BoxTimu = dnbox.getChildByName("ask2BoxTimu");
			if ( _this.animateIndex < 1950 ){
				if ( _this.animateIndex < 1740 ){
					if ( _this.animateIndex > 1200 && _this.animateIndex < 1440 ){
						office.alpha = 0;
					}
					else if ( _this.animateIndex >= 1440 ){
						office.alpha = Tween.Linear(_this.animateIndex-1440,0,1,300);
					}
					else{
						office.alpha = 1;
					}
				}
			}
			else if ( _this.animateIndex > 1950 && _this.animateIndex < 6100 ){
				office.alpha = 1;
				//移动
				if ( _this.animateIndex <= 2600 ){
					officehouse.x = 0;
					officebox.x = 0;
				}
				else if ( _this.animateIndex > 2600 && _this.animateIndex <= 3300 ){
					officehouse.x = Tween.Sine.easeOut(_this.animateIndex-2600,0,-500,700);
					officebox.x = Tween.Sine.easeOut(_this.animateIndex-2600,0,-810,700);
					if ( _this.animateIndex > 2800 ){
						sound.play("officeprint");
					}
				}
				else if ( _this.animateIndex > 3300 ){
					officehouse.x = -500;
					officebox.x = -810;
				}
				//放大
				if ( _this.animateIndex <= 3300 ){
					office.scaleX = 1;
					office.scaleY = 1;
					office.y = _this.setNewY(office,0);
					boybox.x = 1003;
					boybox.y = 389;
					officeboxbg.alpha = 1;
					officehouse.alpha = 1;
					dnbox.scaleX = 0.22;
					dnbox.scaleY = 0.22;
				}
				else if ( _this.animateIndex > 3300 && _this.animateIndex <= 3600 ){
					office.scaleX = Tween.Sine.easeOut(_this.animateIndex-3300,1,(page.clientHeight*640/page.clientWidth*3.43)/1008-1,300);
					office.scaleY = Tween.Sine.easeOut(_this.animateIndex-3300,1,(page.clientHeight*640/page.clientWidth*3.43)/1008-1,300);
					office.y = Tween.Sine.easeOut(_this.animateIndex-3300,_this.setNewY(office,0),(page.clientHeight*640/page.clientWidth*-50)/1008,300);
					boybox.x = Tween.Sine.easeOut(_this.animateIndex-3300,1003,400,300);
					boybox.y = Tween.Sine.easeOut(_this.animateIndex-3300,389,400,300);
					officeboxbg.alpha = 1;
					officehouse.alpha = 1;
					dnbox.scaleX = Tween.Sine.easeOut(_this.animateIndex-3300,0.22,0.04,300);
					dnbox.scaleY = Tween.Sine.easeOut(_this.animateIndex-3300,0.22,0.04,300);
				}
				else if ( _this.animateIndex > 3600 ){
					office.scaleX = (page.clientHeight*640/page.clientWidth*3.43)/1008;
					office.scaleY = (page.clientHeight*640/page.clientWidth*3.43)/1008;
					office.y = _this.setNewY(office,(page.clientHeight*640/page.clientWidth*-50)/1008);
					boybox.x = 1642;
					boybox.y = 762;
					officeboxbg.alpha = 0;
					officehouse.alpha = 0;
					dnbox.scaleX = 0.26;
					dnbox.scaleY = 0.26;
				}
				//鼠标
				if ( _this.animateIndex <= 3600 ){
					shubiao.x = 483;
					shubiao.y = 222;
				}
				else if ( _this.animateIndex > 3600 && _this.animateIndex <= 3700 ){
					shubiao.x = Tween.Sine.easeOut(_this.animateIndex-3600,483,-53,100);
					shubiao.y = Tween.Sine.easeOut(_this.animateIndex-3600,222,-55,100);
					sound.pause();
				}
				else if ( _this.animateIndex > 3700 && _this.animateIndex < 3800 ){
					shubiao.x = 430;
					shubiao.y = 167;
					sound.play("officeclick");
				}
				if ( _this.animateIndex <= 3700 ){
					shubiao.alpha = 1;
					shubiaowhite.alpha = 0;
				}
				else if ( _this.animateIndex > 3700 ){
					shubiao.alpha = 0;
					shubiaowhite.alpha = 1;
				}
				//文件夹
				if ( _this.animateIndex <= 3700 ){
					wenjianjia1.alpha = 1;
					wenjianjia2.alpha = 0;
					wenjianjia3.alpha = 0;
				}
				else if ( _this.animateIndex > 3700 && _this.animateIndex <= 3720 ){
					wenjianjia1.alpha = 0;
					wenjianjia2.alpha = 1;
					wenjianjia3.alpha = 0;
				}
				else if ( _this.animateIndex > 3720 ){
					wenjianjia1.alpha = 0;
					wenjianjia2.alpha = 0;
					wenjianjia3.alpha = 1;
				}
				//文件夹及鼠标
				if ( _this.animateIndex <= 3750 ){
					dnsbox.alpha = 1;
				}
				else if ( _this.animateIndex > 3750 && _this.animateIndex <= 3850 ){
					dnsbox.alpha = Tween.Sine.easeOut(_this.animateIndex-3750,1,-1,100);
				}
				else if ( _this.animateIndex > 3850 ){
					dnsbox.alpha = 0;
				}
				//题二
				if ( _this.answer[1] < 0 ){
					if ( _this.animateIndex <= 3750 ){
						ask2BoxTimu.alpha = 0;
					}
					else if ( _this.animateIndex > 3750 && _this.animateIndex <= 3850 ){
						ask2BoxTimu.alpha = Tween.Sine.easeOut(_this.animateIndex-3750,0,1,100);
					}
					else if ( _this.animateIndex > 3850 ){
						ask2BoxTimu.alpha = 1;
						_this.cantouch = false;
						_this.stopInertiaMove = true;
						_this.animateIndex = 4150;
					}
				}
				//屏幕消失
				if ( _this.animateIndex <= 3900 ){
					dnpm.alpha = 1;
				}
				else if ( _this.animateIndex > 3900 && _this.animateIndex <= 3950 ){
					dnpm.alpha = Tween.Sine.easeOut(_this.animateIndex-3900,1,-1,50);
				}
				else if ( _this.animateIndex > 3950 ){
					dnpm.alpha = 0;
				}
				//办公室场景消失
				if ( _this.animateIndex > 3650 && _this.animateIndex <= 3950 ){
					office.scaleX = (page.clientHeight*640/page.clientWidth*3.43)/1008;
					office.scaleY = (page.clientHeight*640/page.clientWidth*3.43)/1008;
				}
				else if ( _this.animateIndex > 3950 && _this.animateIndex <= 4250 ){
					office.scaleX = Tween.Sine.easeOut(_this.animateIndex-3950,(page.clientHeight*640/page.clientWidth*3.43)/1008,12,300);
					office.scaleY = Tween.Sine.easeOut(_this.animateIndex-3950,(page.clientHeight*640/page.clientWidth*3.43)/1008,12,300);
				}
				else if ( _this.animateIndex > 4250 ){
					office.scaleX = (page.clientHeight*640/page.clientWidth*3.43)/1008+12;
					office.scaleY = (page.clientHeight*640/page.clientWidth*3.43)/1008+12;
				}
			}
			else if ( _this.animateIndex > 4150 ){
				office.alpha = 0;
			}
			/*
			 * 户外
			 */
			var huwai = _this.stage.getChildByName("huwai");
			var zoubox = huwai.getChildByName("zoubox");
			var zou1 = zoubox.getChildByName("zou1");
			var zou2 = zoubox.getChildByName("zou2");
			var zou3 = zoubox.getChildByName("zou3");
			var zou4 = zoubox.getChildByName("zou4");
			var ask3BoxTimu = huwai.getChildByName("ask3BoxTimu");
			if ( _this.animateIndex > 3350 && _this.animateIndex <= 3650 ){
				huwai.alpha = 0;
			}
			else if ( _this.animateIndex > 3650 && _this.animateIndex <= 5650 ){
				huwai.alpha = 1;
				//场景归位
				if ( _this.animateIndex > 3650 && _this.animateIndex <= 3900 ){
					huwai.y = _this.setNewY(huwai,-40);
					zoubox.y = _this.setNewY(zoubox,366);
					huwai.scaleX = 0.9;
					huwai.scaleY = 0.9;
				}
				else if ( _this.animateIndex > 3950 && _this.animateIndex <= 4250 ){
					huwai.y = Tween.Sine.easeOut(_this.animateIndex-3950,_this.setNewY(huwai,-40),-238,300);
					zoubox.y = Tween.Sine.easeOut(_this.animateIndex-3950,_this.setNewY(zoubox,366),200,300);
					huwai.scaleX = Tween.Sine.easeOut(_this.animateIndex-3950,0.9,0.1,300);
					huwai.scaleY = Tween.Sine.easeOut(_this.animateIndex-3950,0.9,0.1,300);
				}
				else if ( _this.animateIndex > 4250 ){
					huwai.y = _this.setNewY(huwai,-278);
					zoubox.y = _this.setNewY(zoubox,566);
					huwai.scaleX = 1;
					huwai.scaleY = 1;
				}
				//场景移动
				if ( _this.animateIndex > 3650 && _this.animateIndex <= 3950 ){
					huwai.x = _this.setNewX(huwai,-78);
				}
				else if ( _this.animateIndex > 3950 && _this.animateIndex <= 4550 ){
					huwai.x = Tween.Sine.easeOut(_this.animateIndex-3950,_this.setNewX(huwai,-78),-207,600);
					sound.play("huwaimove");
				}
				else if ( _this.animateIndex > 4550 ){
					huwai.x = _this.setNewX(huwai,-285);
				}
				//人物行走
				if ( _this.animateIndex > 3650 && _this.animateIndex <= 3950 ){
					zoubox.scaleX = 1;
					zoubox.scaleY = 1;
				}
				else if ( _this.animateIndex > 3950 && _this.animateIndex <= 5150 ){
					zoubox.scaleX = Tween.Sine.easeOut(_this.animateIndex-3950,1,-0.4,1200);
					zoubox.scaleY = Tween.Sine.easeOut(_this.animateIndex-3950,1,-0.4,1200);
					if ( parseInt((_this.animateIndex-3950)/80%4) != zoubox.k ){
						zoubox.k = parseInt((_this.animateIndex-3950)/80%4);
						for ( var i=0;i<zoubox.children.length;i++ ){
							zoubox.children[i].alpha = 0;
						}
						zoubox.children[zoubox.k].alpha = 1;
					}
				}
				else if ( _this.animateIndex > 5150 ){
					zoubox.scaleX = 0.6;
					zoubox.scaleY = 0.6;
				}
				//题三
				if ( _this.answer[2] < 0 ){
					if ( _this.animateIndex <= 4550 ){
						ask3BoxTimu.alpha = 0;
					}
					else if ( _this.animateIndex > 4550 && _this.animateIndex <= 4650 ){
						ask3BoxTimu.alpha = Tween.Sine.easeOut(_this.animateIndex-4550,0,1,100);
					}
					else if ( _this.animateIndex > 4650 ){
						ask3BoxTimu.alpha = 1;
						_this.cantouch = false;
						_this.stopInertiaMove = true;
						_this.animateIndex = 4650;
					}
				}
				//场景放大
				if ( _this.animateIndex > 4550 && _this.animateIndex <= 4700 ){
					huwai.scaleX = 1;
					huwai.scaleY = 1;
					huwai.x = _this.setNewX(huwai,-285);
					huwai.y = _this.setNewY(huwai,-278);
				}
				else if ( _this.animateIndex > 4700 && _this.animateIndex <= 5200 ){
					sound.pause();
					huwai.scaleX = Tween.Linear(_this.animateIndex-4700,1,15,200);
					huwai.scaleY = Tween.Linear(_this.animateIndex-4700,1,15,200);
					huwai.x = Tween.Linear(_this.animateIndex-4700,_this.setNewX(huwai,-285),115,200);
					huwai.y = Tween.Linear(_this.animateIndex-4700,_this.setNewY(huwai,-278),618,200);
				}
				else if ( _this.animateIndex > 4900 ){
					huwai.scaleX = 16;
					huwai.scaleY = 16;
					huwai.x = _this.setNewX(huwai,-170);
					huwai.y = _this.setNewY(huwai,340);
				}
				//场景消失
				if ( _this.animateIndex > 4700 && _this.animateIndex <= 4900 ){
					huwai.alpha = 1;
				}
				else if ( _this.animateIndex > 4900 && _this.animateIndex <= 5000 ){
					huwai.alpha = Tween.Linear(_this.animateIndex-4900,1,-1,100);
				}
				else if ( _this.animateIndex > 5000 ){
					huwai.alpha = 0;
				}
			}
			else if ( _this.animateIndex > 5350 ){
				huwai.alpha = 0;
			}
			/*
			 * 浴室及题四
			 */
			var yushi = _this.stage.getChildByName("yushi");
			var yushibox = yushi.getChildByName("yushibox");
			var ask4BoxTimu = yushibox.getChildByName("ask4BoxTimu");
			var men1 = yushibox.getChildByName("men1");
			var men2 = yushibox.getChildByName("men2");
			if ( _this.animateIndex > 4450 && _this.animateIndex <= 4700 ){
				yushi.alpha = 0;
			}
			else if ( _this.animateIndex > 4700 && _this.animateIndex <= 7400 ){
				yushi.alpha = 1;
				//缩小
				if ( _this.animateIndex > 4700 && _this.animateIndex <= 5000 ){
					yushi.x = 0;
					yushi.y = 0;
					yushi.scaleX = 0.7;
					yushi.scaleY = 0.7;
				}
				else if ( _this.animateIndex > 5000 && _this.animateIndex <= 5600 ){
					yushi.x = Tween.Sine.easeOut(_this.animateIndex-5000,0,-334,600);
					yushi.y = Tween.Sine.easeOut(_this.animateIndex-5000,0,-32,600);
					yushi.scaleX = Tween.Sine.easeOut(_this.animateIndex-5000,0.7,0.3,600);
					yushi.scaleY = Tween.Sine.easeOut(_this.animateIndex-5000,0.7,0.3,600);
					//sound.play("yushixizao");
				}
				else if ( _this.animateIndex > 5600 ){
					yushi.x = -334;
					yushi.y = -32;
					yushi.scaleX = 1;
					yushi.scaleY = 1;
				}
				//题四
				if ( _this.answer[3] < 0 ){
					if ( _this.animateIndex <= 5600 ){
						ask4BoxTimu.alpha = 0;
					}
					else if ( _this.animateIndex > 5600 && _this.animateIndex <= 5700 ){
						ask4BoxTimu.alpha = Tween.Sine.easeOut(_this.animateIndex-5600,0,1,100);
						//sound.play("yushixizao");
					}
					else if ( _this.animateIndex > 5700 ){
						ask4BoxTimu.alpha = 1;
						_this.cantouch = false;
						_this.stopInertiaMove = true;
						_this.animateIndex = 5700;
					}
				}
				//移动
				if ( _this.animateIndex > 5600 && _this.animateIndex <= 5750 ){
					yushi.x = -334;
					yushi.y = -32;
					yushi.scaleX = 1;
					yushi.scaleY = 1;
				}
				else if ( _this.animateIndex > 5750 && _this.animateIndex <= 6350 ){
					yushi.x = Tween.Sine.easeOut(_this.animateIndex-5750,-334,-1000,600);
					yushi.y = Tween.Sine.easeOut(_this.animateIndex-5750,-32,32,600);
					yushi.scaleX = Tween.Sine.easeOut(_this.animateIndex-5750,1,-0.3,600);
					yushi.scaleY = Tween.Sine.easeOut(_this.animateIndex-5750,1,-0.3,600);
				}
				else if ( _this.animateIndex > 6350 ){
					yushi.x = -1334;
					yushi.y = 0;
					yushi.scaleX = 0.7;
					yushi.scaleY = 0.7;
				}
				//门
				if ( _this.animateIndex <= 6350 ){
					men1.alpha = 1;
					men2.alpha = 0;
				}
				else{
					men1.alpha = 0;
					men2.alpha = 1;
				}
				//场景放大
				if ( _this.animateIndex <= 6400 ){
					yushibox.scaleX = 1;
					yushibox.scaleY = 1;
				}
				else if ( _this.animateIndex > 6400 && _this.animateIndex <= 6500 ){
					yushibox.scaleX = Tween.Sine.easeOut(_this.animateIndex-6400,1,2,100);
					yushibox.scaleY = Tween.Sine.easeOut(_this.animateIndex-6400,1,2,100);
				}
				else if ( _this.animateIndex > 6500 ){
					yushibox.scaleX = 3;
					yushibox.scaleY = 3;
				}
				//场景消失
				if ( _this.animateIndex <= 6400 ){
					yushi.alpha = 1;
				}
				else if ( _this.animateIndex > 6400 && _this.animateIndex <= 6700 ){
					yushi.alpha = Tween.Sine.easeOut(_this.animateIndex-6400,1,-1,300);
				}
				else if ( _this.animateIndex > 6700 ){
					yushi.alpha = 0;
				}
			}
			else if ( _this.animateIndex > 7200 ){
				yushi.alpha = 0;
			}
			/*
			 * 卧室及题五
			 */
			var woshi = _this.stage.getChildByName("woshi");
			var ask5BoxTimu = woshi.getChildByName("ask5BoxTimu");
			if ( _this.animateIndex > 5700 && _this.animateIndex <= 6000 ){
				woshi.alpha = 0;
			}
			else if ( _this.animateIndex > 6000 && _this.animateIndex <= 8900 ){
				woshi.alpha = 1;
				//移动
				if ( _this.animateIndex > 6500 && _this.animateIndex <= 6700 ){
					woshi.x = 0;
					woshi.scaleX = 0.78;
					woshi.scaleY = 0.78;
				}
				else if ( _this.animateIndex > 6700 && _this.animateIndex <= 7300 ){
					woshi.x = Tween.Sine.easeOut(_this.animateIndex-6700,0,-415,600);
					woshi.scaleX = Tween.Sine.easeOut(_this.animateIndex-6700,0.78,0.22,600);
					woshi.scaleY = Tween.Sine.easeOut(_this.animateIndex-6700,0.78,0.22,600);
				}
				else if ( _this.animateIndex > 7300 ){
					woshi.x = -415;
					woshi.scaleX = 1;
					woshi.scaleY = 1;
				}
				//题五
				if ( _this.answer[4] < 0 ){
					if ( _this.animateIndex <= 7300 ){
						ask5BoxTimu.alpha = 0;
					}
					else if ( _this.animateIndex > 7300 && _this.animateIndex <= 7400 ){
						ask5BoxTimu.alpha = Tween.Sine.easeOut(_this.animateIndex-7300,0,1,100);
					}
					else if ( _this.animateIndex > 7400 ){
						ask5BoxTimu.alpha = 1;
						_this.cantouch = false;
						_this.stopInertiaMove = true;
						_this.animateIndex = 7400;
					}
				}
			}
			_this.stage.update();
		},
		answer:[-1,-1,-1,-1,-1],
		imgarrs:{},
		shengcheng:function(){
			var _this = this;
			if ( _this.busy ){
				return false;
			}
			_this.busy = true;
			do{
				var r = parseInt(Math.random()*4+1);
			}
			while ( _this.rom == r )
			_this.rom = r;
			$(".button").hide().eq(_this.selectIndex).show();
			windowAlert.show("正在准备你的暖心书语和感恩福利",0);
			_this.downloads("images/shengcheng/bg-"+ _this.selectIndex +".png","bg");
			_this.downloads("images/shengcheng/photo-"+ _this.selectIndex +"-"+ _this.rom +".png","photo");
			_this.downloads("images/shengcheng/photos-"+ _this.selectIndex +"-"+ _this.rom +".png","photos");
			_this.downloads("images/shengcheng/code.png","code");
			_czc.push(["_trackEvent", "测试结果", _this.data[_this.selectIndex].name,"样式" + _this.rom]);
		},
		getTimestamp:function(){
		    var date = new Date();
		    var year = date.getFullYear();
		    var month = date.getMonth()+1;
		    if ( month < 10 ){
		    	month = "0" + month;
		    }
		    var day = date.getDate();
		    if ( day < 10 ){
		    	day = "0" + day;
		    }
		    var hours = date.getHours();
		    if ( hours < 10 ){
		    	hours = "0" + hours;
		    }
		    var minutes = date.getMinutes();
		    if ( minutes < 10 ){
		    	minutes = "0" + minutes;
		    }
		    var second = date.getSeconds();
		    if ( second < 10 ){
		    	second = "0" + second;
		    }
		    var random = parseInt(Math.random()*1000);
		    if ( random < 10 ){
		    	random = "00" + second;
		    }
		    else if ( random < 100 && random >= 10 ){
		    	random = "0" + second;
		    }
		    return ( year.toString() + month.toString() + day.toString() + hours.toString() + minutes.toString() + second.toString() + random.toString() );
		},
		downloads:function(src,name){
			var _this = this;
			var img = new Image();
			img.crossOrigin = 'anonymous';
			img.onload = function(){
				_this.imgarrs[name] = img;
				_this.completes();
			};
			img.onerror = function(){
				windowAlert.show("加载图片时发生错误-" + name);
				_this.busy = false;
			}
			img.src = src;
		},
		completes:function(){
			var _this = this;
			if ( _this.imgarrs["bg"] && _this.imgarrs["photo"] && _this.imgarrs["photos"] && _this.imgarrs["code"] ){
				var bgCanvas = document.getElementById("bg-canvas");
				var bgContext = bgCanvas.getContext("2d");
				bgCanvas.width = 640;
				bgCanvas.height = 1240;
				bgContext.clearRect(0,0,bgCanvas.width,bgCanvas.height);
				bgContext.drawImage(_this.imgarrs.bg,0,0,_this.imgarrs.bg.width,_this.imgarrs.bg.height);
				var showCanvas = document.getElementById("show-canvas");
				var showContext = showCanvas.getContext("2d");
				showCanvas.width = 640;
				showCanvas.height = 1040;
				showContext.clearRect(0,0,showCanvas.width,showCanvas.height);
				showContext.drawImage(_this.imgarrs.photo,0,0,_this.imgarrs.photo.width,_this.imgarrs.photo.height);
				showContext.restore();
				var canvas = document.getElementById("canvas");
				var context = canvas.getContext("2d");
				canvas.width = 960;
				canvas.height = 1560;
				context.clearRect(0,0,canvas.width,canvas.height);
				context.drawImage(_this.imgarrs.photos,0,0,_this.imgarrs.photos.width,_this.imgarrs.photos.height);
				if ( args.fr ){
					$("#qrcode").empty();
					$("#qrcode").qrcode({
						render: "canvas",
						width: 280,
						height: 280,
						text: "https://www.html5case.com.cn/case/luckin-coffee/2/1/?fr=" + args.fr
					});
					var cvs = document.getElementById("qrcode").getElementsByTagName("canvas")[0];
					context.drawImage(cvs,78,1208,260,260);
				}
				else{
					context.drawImage(_this.imgarrs.code,78,1208,260,260);
				}
				context.fillStyle = "#000";
				context.font = "bold 29px arial";
				context.textAlign = "center";
				context.textBaseline = "top";
				context.fillText("码上书情收获福利",208,1472);
				_this.img = new Image();
				_this.img.src = canvas.toDataURL();
				_this.img.onload = function(){
					$("#save-img").html("<img src='"+ _this.img.src +"'/>");
					if ( !$("#result").is(":visible") ){
						page.changePower("#game","#result");
					}
					_this.busy = false;
					windowAlert.hide();
				}
			}
		}
	}
	/*
	 * url参数
	 */
	window.args = function(){
		var qs = (location.search.length > 0 ? location.search.substring(1) : "");
		var args = {};
		var items = qs.length ? qs.split("&") : [];
		for ( var i=0;i<items.length;i++ ){
			var item = items[i].split("=");
			var name = decodeURIComponent(item[0]);
			var value = decodeURIComponent(item[1]);
			if ( name.length ){
				args[name] = value;
			}
		}
		return args;
	}()
	/*
	 * 冒出式弹层
	 */
	window.windowAlert = {
		show:function(text,alertTime){
			if ( typeof(autoTip) != "undefined" ){
				clearTimeout(autoTip);
			}
			$("#tip").remove();
			$("body").append("<div id='tip'><span></span></div>");
			var $tip = $("#tip");
			$tip.find("span").html(text);
			$tip.show();
			var height = $("#tip").height();
			$tip.css({bottom:-height}).transition({y:-height-16,complete:function(){
				if ( alertTime != 0 ){
					autoTip = setTimeout(function(){
						$tip.transition({y:0,complete:function(){
							$tip.hide();
						}},300);
					},1000)
				}
			}},300);
		},
		close:function(text){
			if ( typeof(autoTip) != "undefined" ){
				clearTimeout(autoTip);
			}
			var $tip = $("#tip");
			$tip.find("span").html(text);
			autoTip = setTimeout(function(){
				$tip.transition({y:0,complete:function(){
					$tip.hide();
				}},300);
			},1000)
		},
		hide:function(){
			var $tip = $("#tip");
			$tip.transition({opacity:0,complete:function(){
				$tip.remove();
			}},300);
		}
	};
	/*
	 * 背景音乐
	 */
	window.bgm = {
		playing:0,
		init:function(){
			this.music = new Audio();
			this.music.src = "js/bgm.mp3";
			this.music.loop = "loop";
			this.music.addEventListener("canplay",bgm.load);
			this.music.addEventListener("playing",bgm.complete);
			this.music.load();
			$("#music").on("tap",function(){
				if ( Boolean(bgm.playing) ){
					bgm.pause();
				}
				else{
					bgm.play();
				}
			})
			document.addEventListener("visibilitychange", startStopVideo);
			function startStopVideo() {
				if ( document.visibilityState === "hidden" ){
					if ( bgm.playing ){
						bgm.need = true;
						bgm.pause();
					}
					else{
						bgm.need = false;
					}
				}
				else{
					if ( bgm.need ){
						setTimeout(function(){
							bgm.play();
						},800)
					}
				}
			}
		},
		load:function(){
			bgm.play();
			this.removeEventListener("canplay",bgm.load);
		},
		complete:function(){
			$("#music").css({"visibility":"visible",opacity:0}).transition({opacity:1},500);
			this.removeEventListener("playing",bgm.complete);
		},
		play:function(){
			this.music.play();
			this.playing = 1;
			$("#music").addClass("play");
		},
		pause:function(){
			this.music.pause();
			this.playing = 0;
			$("#music").removeClass("play");
		}
	};
	/*
	 * 音效
	 */
	window.sound = {
		list:[{"src":"js/trainvoice.mp3","title":"trainvoice","loop":""},{"src":"js/traindoor.mp3","title":"traindoor","loop":""},{"src":"js/officeprint.mp3","title":"officeprint","loop":""},{"src":"js/officeclick.mp3","title":"officeclick","loop":""},{"src":"js/huwaimove.mp3","title":"huwaimove","loop":""},{"src":"js/yushixizao.mp3","title":"yushixizao","loop":""},{"src":"js/answer.mp3","title":"answer","loop":""},{"src":"js/date.mp3","title":"date","loop":""}],
		init:function(){
			this.music = {};
			for ( var i=0;i<this.list.length;i++ ){
				var m = new Audio();
				m.src = this.list[i].src;
				m.loop = this.list[i].loop;
				m.playing = 0;
				m.load();
				this.music[this.list[i].title] = m;
				m.addEventListener("ended",function(){
					this.playing = 0;
				})
			}
		},
		play:function(obj){
			if ( this.music[obj].playing ){
				return false;
			}
			this.music[obj].play();
			this.music[obj].playing = 1;
		},
		pause:function(){
			for ( var key in this.music ){
				this.music[key].currentTime = 0;
				this.music[key].pause();
			}
		}
	};
}();
$(function(){
	page.init();
})