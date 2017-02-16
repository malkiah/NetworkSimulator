/*
 * This file is part of the Education Network Simulator project and covered 
 * by GPLv3 license. See full terms in the LICENSE file at the root folder
 * or at http://www.gnu.org/licenses/gpl-3.0.html.
 * 
 * (c) 2015 Jorge García Ochoa de Aspuru
 * bardok@gmail.com
 * 
 * Images are copyrighted by their respective authors and have been 
 * downloaded from http://pixabay.com/
 * 
 */

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

