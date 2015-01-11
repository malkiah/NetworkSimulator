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

var Router = function() 
{
    this.id = getNextID();
    var connectable = null;
    var drawable = null;
    var _self = this;
    
    this.save = function() 
    {
        var result = {};
        result.version = 1;
        result.id = this.id;
        result.type = "router";
        result.drawable = drawable.save();
        result.connectable = connectable.save();

        return result;
    };
    
    this.load = function(data) 
    {
        this.id = data.id;
        type = data.type;
        drawable.load(data.drawable);
        drawable.setImage(network.getImages()[IMAGE_ROUTER]);
        connectable.load(data.connectable);
    };
    
    function init() 
    {
        connectable = new Connectable(_self, MACMODE_UNIQUE, IPMODE_UNIQUE, true, true);
        new Connector(connectable);
        new Connector(connectable);
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
        lan = "-";
        wan = "-";
        
        if ((connectable.getIPInfo(ROUTER_LAN) != null) && (connectable.getIPInfo(ROUTER_LAN).getIPv4() != null)) 
        {
            lan = connectable.getIPInfo(ROUTER_LAN).getIPv4();
        }
        if ((connectable.getIPInfo(ROUTER_WAN) != null) && (connectable.getIPInfo(ROUTER_WAN).getIPv4() != null)) 
        {
            wan = connectable.getIPInfo(ROUTER_WAN).getIPv4();
        }
        
        result = "LAN: " + lan + "\nWAN: " + wan;
        
        return result;
    };

    this.getNATInfo = function()
    {
        return connectable.getTrafficManager().getFixedNATtable();
    };
    
    init();
};
