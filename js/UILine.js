// THANK_YOU: http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
function sqr(x) { return x * x }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
function distToSegmentSquared(p, v, w) {
  var l2 = dist2(v, w);
  if (l2 == 0) return dist2(p, v);
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  if (t < 0) return dist2(p, v);
  if (t > 1) return dist2(p, w);
  return dist2(p, { x: v.x + t * (w.x - v.x),
                    y: v.y + t * (w.y - v.y) });
}
function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }

UILine.prototype = new UIClickable();
UILine.prototype.constructor = UILine;
function UILine(callback, params, object, X1, Y1, X2, Y2, Z)
{
    UIClickable.call(this,callback,params, object);
    this.X1 = X1;
    this.Y1 = Y1;
    this.X2 = X2;
    this.Y2 = Y2;
    this.Z = Z;

    this.setCoords = function(cX1, cY1, cX2, cY2, Z)
    {
      this.X1 = cX1;
      this.Y1 = cY1;
      this.X2 = cX2;
      this.Y2 = cY2;
      this.Z = Z;
    };

    this.isInCoords = function(cX,cY)
    {
        return distToSegment({x: cX,y: cY}, {x: this.X1,y: this.Y1}, {x: this.X2,y: this.Y2}) < LINE_SELECT_TOLERANCE;
    };
};
