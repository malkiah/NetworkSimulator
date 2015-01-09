UIRectangle.prototype = new UIClickable();
UIRectangle.prototype.constructor = UIRectangle;
function UIRectangle(callback, params, object, X, Y, W, H, Z, fixed)
{
    UIClickable.call(this,callback,params,object);
    this.X = X;
    this.Y = Y;
    this.W = W;
    this.H = H;
    this.Z = Z;
    var fixed = fixed;

    this.setCoords = function(cX,cY,cW,cH,cZ)
    {
        this.X = cX;
        this.Y = cY;
        this.W = cW;
        this.H = cH;
        this.Z = cZ;
    };

    //UIRectangle.prototype.isInCoords = function(cX,cY)
    this.isInCoords = function(cX,cY)
    {
        if (fixed)
        {
            cX -= document.body.scrollLeft;
            cY -= document.body.scrollTop;
        }
        return (this.X <= cX) && (cX <= (this.X + this.W)) && (this.Y < cY) && (cY < (this.Y + this.H));
    };

};

