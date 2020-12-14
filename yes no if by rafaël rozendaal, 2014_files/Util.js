var Util = window.Util || {};

Util.splitPolygon = function(poly,x,y, count, dbg)
{
	//Let 45deg radial point to closest corner of poly bounds. Other radials follow from that.
	var PIQ = Math.PI/4;
	var PI2 = Math.PI*2;
	var b = poly.getBounds();//xMin etc
	if (dbg) log("Util.splitPolygon",x,y, count);
	var r = (b.xMax-b.xMin) + (b.yMax-b.yMin);//ample radius
	var angleStart = Math.random()*PI2;
	var angleStep = PI2/count;
	var angleRandom = angleStep/2 * Config.angleRandomFactor;
	var res = [];
	var ps = [];
	var angle = angleStart;
	for (var i=0;i<count;i++)
	{
		ps.length = 0;
		ps.push(x,y);
		ps.push(x+Math.cos(angle)*r, y+Math.sin(angle)*r);
		angle += angleStep;
		if (i==count-1) angle = angleStart;
		else angle += RandomUtil.between(-angleRandom,angleRandom);
		ps.push(x+Math.cos(angle)*r, y+Math.sin(angle)*r);
		var polySub = poly.clipXY(ps);
		//rotate polySub points so x,y is again at index 0
		var ps2 = polySub.getPoints();
		var m = .000001;
		while(1)
		{
			if (Math.abs(ps2[0]-x)>m || Math.abs(ps2[1]-y)>m)
			{
				ps2.push(ps2[0],ps2[1]);
				ps2.splice(0,2);
			}
			else
			{
				break;
			}
		}
		//
		res.push(polySub);
		if (dbg) log.apply(null, ps);
	}
	return res;
}

Util.getIndexOfClosest = function(x,y,xys)
{
	var bestIdx = null, bestD = Infinity;
	for (var i=0;i<xys.length;i+=2)
	{
		var d = Math.pow(xys[i]-x,2) + Math.pow(xys[i+1]-y,2);
		if (d<bestD)
		{
			bestD = d;
			bestIdx = i;
		}
	}
	return bestIdx;
}

Util.getIndexOfRemotest = function(x,y,xys)
{
	var bestIdx = null, bestD = -Infinity;
	for (var i=0;i<xys.length;i+=2)
	{
		var d = Math.pow(xys[i]-x,2) + Math.pow(xys[i+1]-y,2);
		if (d>bestD)
		{
			bestD = d;
			bestIdx = i;
		}
	}
	return bestIdx;
}


var ExtPoly = function(id, level, tick, poly, originX, originY, cornerX, cornerY, parent)
{
	this.id = id;
	this.level = level;
	this.tick = tick;
	this.poly = poly;
	this.originX = originX;
	this.originY = originY;
	this.cornerX = cornerX;
	this.cornerY = cornerY;
	this.parent = parent;
	//
	this.originAngle = Math.atan2(originY,originX);
	this.originLength = Math.sqrt(originX*originX + originY*originY);
	this.cornerAngle = Math.atan2(cornerY,cornerX);
	this.cornerLength = Math.sqrt(cornerX*cornerX + cornerY*cornerY);
	this.polyClipped = poly;
	this.isParent = false;
}

ExtPoly.prototype.scaleAroundOrigin = function(scale)
{
	//Never clip the poly in place!
	//	Clipping and scaling will eventually result in originX and originY being outside the clipped poly,
	//	Then, after a certain cumulative scale, the transformAroundXY(0,0) will no longer be compensated by the transformAroundXY(this.originX, this.originY)
	//	and the poly will move inward from the viewport edges
	this.poly = this.poly.transformAroundXY(0,0, 0,0, 0, scale);
	//grow to compensate scaling around 0,0
	//TODO: calc precise scale to compensate?
	this.poly = this.poly.transformAroundXY(this.originX, this.originY, 0,0, 0, scale*scale);//(scale-1)*2+1);
	//also scale origin and corner
	this.originLength *= scale;
	this.cornerLength *= scale;
	this.originX = this.originLength * Math.cos(this.originAngle);
	this.originY = this.originLength * Math.sin(this.originAngle);
	this.cornerX = this.cornerLength * Math.cos(this.cornerAngle);
	this.cornerY = this.cornerLength * Math.sin(this.cornerAngle);
	//
	if (this.parent) 
	{
		var pp = this.parent.polyClipped;
		this.polyClipped = pp.getPoints().length? this.poly.clipXY(pp.getPoints()) : pp;
	}
}