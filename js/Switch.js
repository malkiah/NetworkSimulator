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
