var Switch = function(ports)
{
    this.id = getNextID();
    var connectable = null;
    var drawable = null;
    var _self = this;
    var ports = ports;
    
    this.save = function() 
    {
        var result = {};
        result.version = 1;
        result.id = this.id;
        result.type = "switch";
        result.drawable = drawable.save();
        result.connectable = connectable.save();
        result.ports = ports;

        return result;
    };
    
    this.load = function(data) 
    {
        this.id = data.id;
        type = data.type;
        drawable.load(data.drawable);
        drawable.setImage(network.getImages()[IMAGE_SWITCH]);
        connectable.load(data.connectable);
    };
    
    function init()
    {
      connectable = new Connectable(_self, MACMODE_SHARED, IPMODE_NOIP, false, false);
      for (var i = 0; i < ports; i++)
      {
	var connector = new Connector(connectable);
      }
      drawable = new Drawable(_self);
    }

    this.getConnectable = function()
    {
      return connectable;
    }
    
    this.getDrawable = function()
    {
      return drawable;
    };
    
    this.getStrInfo = function()
    {
      return "";
    };
    
    init();  
};
