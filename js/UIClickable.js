function UIClickable(callback, params, object) 
{
    var callback = callback;
    var params = params;
    var object = object;
    
    this.isInCoords = function(X, Y, Z) 
    {
        alert("This function needs to be redefined - isInCoords");
    };
    
    this.performAction = function() 
    {
        if (callback !== null)
        {
            callback(params);
        }
    };

    this.getObject = function()
    {
        return object;
    };
};
