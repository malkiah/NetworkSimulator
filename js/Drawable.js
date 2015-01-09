var Drawable = function(c_owner) 
{
    this.id = getNextID();
    var X = 0;
    var Y = 0;
    var image = null;
    var owner = c_owner;
    var rect = new UIRectangle(null, null, this, 0, 0, 0, 0, 0, false);
    uimanager.addClickable(rect);
    var observers = [];
    
    this.save = function() 
    {
        var result = {};
        result.version = 1;
        result.id = this.id;
        result.X = X;
        result.Y = Y;
        
        return result;
    };
    
    this.load = function(data) 
    {
        X = data.X;
        Y = data.Y;
        this.id = data.id;
        notifyObservers();
    };
    
    this.setPosition = function(x, y) 
    {
        X = x;
        Y = y;
        if (image !== null) 
        {
            rect.setCoords(X, Y, image.width, image.height, 0);
        }
        notifyObservers();
    };
    
    this.getX = function() 
    {
        return X;
    };
    
    this.getY = function() 
    {
        return Y;
    };
    
    this.getCenterX = function() 
    {
        return X + image.width / 2;
    };
    
    this.getCenterY = function() 
    {
        return Y + image.height / 2;
    };
    
    this.setImage = function(img) 
    {
        image = img;
        if (image !== null) 
        {
            rect.setCoords(X, Y, image.width, image.height, 0);
        }
        notifyObservers();
    };
    
    function drawInfo(ctx) 
    {
        var pos = 8;
        ctx.font = '8pt';
        ctx.fillStyle = "black";
        var parts = owner.getStrInfo().split("\n");
        for (var i = 0; i < parts.length; i++) 
        {
            ctx.fillText(parts[i], 0, image.height + pos);
            pos += 8;
        }    
    }
    
    this.draw = function(ctx) 
    {
        ctx.save();
        ctx.translate(X, Y);
        ctx.drawImage(image, 0, 0);
        drawInfo(ctx);
        ctx.restore();
    };
    
    this.getOwner = function() 
    {
        return owner;
    };
    
    this.getRect = function() 
    {
        var data = {};
        data.x = X;
        data.y = Y;
        data.width = image.width;
        data.height = image.height;
        
        return data;
    };
    
    this.addObserver = function(obs) 
    {
        observers.push(obs);
    };
    
    this.deleteObserver = function(obs) 
    {
        var pos = observers.indexOf(obs);
        observers.splice(pos, 1);
    };
    
    function notifyObservers() 
    {
        if (image !== null) 
        {
            for (var i = 0; i < observers.length; i++) 
            {
                observers[i].drawableChanged();
            }
        }
    }

    this.dispose = function()
    {
        uimanager.removeClickable(rect);
    };
};
