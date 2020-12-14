
var RandomUtil = {};

RandomUtil.exponential = function(e)
{
	var p = Math.random();
	var h = p < .5;
	var p = Math.pow(h ? p * 2 : (1 - p) * 2, e);
	p = h ? p / 2 : 1 - (p / 2);
	return p;
}

RandomUtil.pick = function(pool, exceptions)
{
	if (exceptions != null)
	{
		var pool2 = [];
		var n = pool.length;
		for (var i = 0; i < n; i++)
		{
			var item = pool[i];
			if (exceptions.indexOf(item) == -1) pool2.push(item);
		}
		pool = pool2;
	}
	return pool[Math.floor(Math.random() * pool.length)];
}

RandomUtil.between = function(min, max, integer, extremeFactor)
{
	var p = Math.random();
	if (extremeFactor)
	{
		var f = Math.pow((p < .5) ? p * 2 : (1 - p) * 2, extremeFactor);
		p = (p < .5) ? f / 2 : 1 - (f / 2);
	}
	var n = min + p * (max-min);
	if (integer) return Math.floor(n);
	else return n;
}

/**
 * Picks a random index/value from array using weights
 * @param	weights Array with numerical values for weights, e.g: [3, 5.4, 7.454, 2.1, 0]
 * @param	values Optional. Array with values. If no values are specified, index will be returned.
 * @return
 */
RandomUtil.pickWeighted = function(weights, values)
		{
			//create cumulative weights
			var cw = [];
			var sum = 0;
			for (var i = 0; i < weights.length; i++)
			{
				sum += weights[i];
				cw.push(sum);
			}
			var idx = ArrayUtil.indexOfClosest(cw, Math.random() * sum, ArrayUtil.HIGHER);
			return values ? values[idx] : idx;
		}