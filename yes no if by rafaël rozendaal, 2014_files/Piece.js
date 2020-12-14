(function(window) {
	var Piece = function(canvas, config)
	{
		this.initialize(canvas, config);
	}
	var p = Piece.prototype = new BasePiece();
	//
	p.initialize = function(canvas, config)
	{
		BasePiece.prototype.initialize.apply(this, [canvas, config]);
		//
		this.shape = new Shape();
		this.stage.addChild(this.shape);
		this.containerDebug = new Container();
		this.stage.addChild(this.containerDebug);
		this.objs = [];
		this.viewportXYs = [];
		this.initInteraction();
		this.showIds = this.config.debug;
	}

	p.initInteraction = function()
	{
		var that = this;
		//this.stage.addEventListener("stagemousemove", function(e) { that.onMouseMove(e); });
		//this.stage.addEventListener("stagemousedown", function(e) { that.onMouseDown(e); });
		this.stage.addEventListener("stagemouseup", function(e) { that.onMouseUp(e); });
	}
	p.onKeyUp = function(e)
	{
		BasePiece.prototype.onKeyUp.apply(this, [e]);
		if (!this.config.debug) return;
		var c = String.fromCharCode(e.which);
		if (c=="G") this.reset();
		else if (c=="I") this.showIds = !this.showIds;
	}
	p.onMouseDown = function(e)
	{
	}
	p.onMouseUp = function(e)
	{
		var x = Math.round(e.stageX), y = Math.round(e.stageY);
		var p = this.shape.globalToLocal(x,y);
		if (this.splitOnXY(p.x,p.y))
		{
			this.zoomSpeed = this.config.zoomSpeedClick;
		}
		if (Config.autoModeInteractive) this.initAutoMode();
	}

	// automode
	p.autoModeNext = -1;
	p.initAutoMode = function()
	{
		if (Config.autoModeStartAfter>=0) this.autoModeNext = Date.now()+Config.autoModeStartAfter;
	}
	p.updateAutoMode = function()
	{
		if (this.autoModeNext==-1) return false;
		var now = Date.now();
		if (now>this.autoModeNext)
		{
			var w = this.width, h = this.height;
			var rx = Math.pow(Math.random(), this.config.autoModePreferViewportCenterFactor);
			var ry = Math.pow(Math.random(), this.config.autoModePreferViewportCenterFactor);
			var f =  this.config.autoModeMaxDistanceToCenter;
			rx *= f;
			ry *= f;
			if (this.objs.length==1)
			{
				var m = this.config.autoModeFirstSplitMinDistanceToCenter;
				var x = w * (rx * (f-m) + m) * (Math.random()<.5 ? -1 : 1);
				var y = h * (ry * (f-m) + m) * (Math.random()<.5 ? -1 : 1);
			}
			else
			{
				ry *= Math.random()<.5 ? -.5 : .5;
				rx *= Math.random()<.5 ? -.5 : .5;
				var x = w * rx * (Math.random()<.5 ? -1 : 1);
				var y = h * ry * (Math.random()<.5 ? -1 : 1);
			}
			var res = this.splitOnXY(x,y);
			if (res) this.autoModeNext = now + RandomUtil.between(this.config.autoModeIntervalMin,this.config.autoModeIntervalMax);
			else this.autoModeNext = now + 5;
			return true;
		}
		return false;
	}
	//

	p.setSize = function(w,h,dpr)
	{
		this.dpr = dpr;
		w *= dpr;
		h *= dpr;
		this.width = Math.floor(w);
		this.height = Math.floor(h);
		log("setSize",w,this.width);
		this.shape.setTransform(.5*w,.5*h,1,1);
		var f = .5;
		if (this.config.debug) f *= .95;
		this.viewportXYs.length = 0;
		this.viewportXYs.push(-f*w,-f*h,f*w,-f*h,f*w,f*h,-f*w,f*h);
		if (this.tickLast) this.reset();
	}

	p.start = function()
	{
		BasePiece.prototype.start.apply(this);
		log("start",this.width);
		if (this.width) this.reset();
	}

	p.reset = function()
	{
		//TEMP: no random
		//this.paused=1;
		//Math.random = function() { return .5; };
		//create first gradient using random diagonal
		this.objs.length = 0;
		var xys = this.viewportXYs;
		var idx = Math.floor(Math.random()*4)*2, idx2 = (idx+4)%8;
		var obj = new ExtPoly("R",0, this.tickCount, Polygon.fromXYArray(xys), xys[idx],xys[idx+1], xys[idx2],xys[idx2+1]);
		this.objs.push(obj);
		//
		this.draw();
		this.stage.update();
		this.initAutoMode();
	}


	p.splitOnXY = function(x,y)
	{
		for (var i=0;i<this.objs.length;i++)
		{
			var obj = this.objs[i];
			if (obj.isParent) continue;
			var poly = obj.polyClipped;
			if (!poly.containsXY(x,y)) continue;
			var d = poly.getDistanceToXY(x,y,true);
			if (d<15*this.dpr) return false;
			//remove root, no longer needed
			if (obj.level==0) 
			{
				this.objs.shift();
				obj.id = "";
			}
			var n = RandomUtil.between(this.config.splitMin, this.config.splitMax+1, true);
			this.split(obj, x,y, n);
			obj.isParent = true;
			log("splitOnXY in "+obj.id, this.objs.length);
			return true;			
		}
	}

	p.split = function(obj, x,y, count)
	{
		var poly = obj.polyClipped;
		var polys = Util.splitPolygon(poly, x,y, count, false);
		for (var i=0;i<polys.length;i++)
		{
			var child = polys[i];
			var ps = child.getPoints();
			var remotest = Util.getIndexOfRemotest(x,y,ps);
			var obj2 = new ExtPoly(obj.id+i, obj.level+1, this.tickCount, child, ps[0],ps[1], ps[remotest],ps[remotest+1], obj);
			this.objs.push(obj2);
		}
	}

	p.update = function()
	{
		this.updateAutoMode();
		this.draw();
		return true;
	}

	p.draw = function()
	{
		this.containerDebug.removeAllChildren();
		var zoom = this.config.zoomSpeed, t = this.tickCount;
		var pd = this.config.zoomSpeedParallaxDuration, pz = this.config.zoomSpeedParallax-zoom;
		var g = this.shape.graphics.clear();
		var n = this.objs.length;
		var cs = this.config.colors, rs = this.config.ratios;
		//parallax: scaleAroundOrigin
		for (var i=0;i<n;i++)
		{
			var obj = this.objs[i];
			if (obj.parent)
			{
				var z = (1-Math.min(1, (t-obj.tick)/pd)) * pz + zoom;
				obj.scaleAroundOrigin(z);
			}
		}
		//draw polygons + check remove
		for (var i=n-1;i>=0;i--)
		{
			var obj = this.objs[i];
			var poly = obj.polyClipped;
			var ps = poly.getPoints();
			if (ps.length==0) 
			{
				this.objs.splice(i,1);
				log("remove: "+obj.id, obj.isParent, this.tickCount, this.objs.length);
				continue;
			}
			if (!obj.isParent) //leaf: draw
			{
				//g.s('#666').ss(1);
				g.lf(cs,rs, obj.originX, obj.originY, obj.cornerX, obj.cornerY);
				g.ls(cs,rs, obj.originX, obj.originY, obj.cornerX, obj.cornerY);
				//
				this.drawPoly(g, ps);
				g.endFill();
				//
				if (!this.showIds) continue;
				var c = poly.getCentroid();
				var txt = new Text(obj.id, "10px Arial", "#000");
				txt.x = c.x+this.shape.x;
				txt.y = c.y+this.shape.y;
				this.containerDebug.addChild(txt);
			}
		}
		//remove parents who cover viewport
		//by algorithm this can only be objs[0]
		if (this.objs.length<=1) return;
		obj = this.objs[0];
		poly = obj.poly;
		var xys = this.viewportXYs;
		if (poly.containsXY(xys[0],xys[1]) && poly.containsXY(xys[2],xys[3]) && poly.containsXY(xys[4],xys[5]) && poly.containsXY(xys[6],xys[7]))
		{
			obj.parent = null;
			this.objs.shift();
			log("shift: "+obj.id, this.tickCount, this.objs.length);
			for (var i=0;i<this.objs.length;i++) 
			{
				obj = this.objs[i];
				obj.id = obj.id.substr(1);
			}
		}		
	}

	p.drawPoly = function(g, p)
	{
		var n = p.length;
		g.moveTo(p[n-2], p[n-1]);
		for (var i=0;i<n;i+=2) g.lineTo(p[i],p[i+1]);
	}

	p.logIds = function()
	{
		var ids = [];
		for (var i=0;i<this.objs.length;i++) ids.push(this.objs[i].id);
		log.apply(null,ids);
	}

	window.Piece = Piece;
}(window));

