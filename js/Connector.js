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

var Connector = function(connectable) 
{
    this.id = getNextID();
    var connectable = connectable;
    var link = null;
    var _self = this;
    
    this.save = function() 
    {
        var result = {};
        result.version = 1;
        result.id = this.id;
        
        return result;
    };
    
    this.load = function(data) 
    {
        this.id = data.id;
    };
    
    function init() {
        connectable.addConnector(_self);
    }
    
    this.setLink = function(l) {
        link = l;
    };
    
    this.getLink = function() 
    {
        return link;
    };
    
    this.send = function(message) 
    {
        if (link != null) 
        {
            link.addMessage(_self, message);
        }
    };
    
    this.receive = function(message) 
    {
        connectable.getTrafficManager().proccess(this, message);
    };
    
    this.getConnectable = function() 
    {
        return connectable;
    };
    
    this.isConnected = function() 
    {
        return link !== null;
    };
    
    this.getConnectedConnector = function() 
    {
        var result = null;
        if (this.isConnected()) 
        {
            result = (link.getConnector1() !== this) ? link.getConnector1() : link.getConnector2();
        }
        return result;
    };
    
    this.getDescription = function() 
    {
        var result = "";
        var cpos = connectable.getConnectorPos(this);
        
        if (connectable.getOwner().getType() === "router") 
        {
            result += (cpos === ROUTER_LAN) ? "LAN" : "WAN";
            result += ": ";
        }
        
        var ipinfo = connectable.getIPInfo(cpos);
        if ((ipinfo !== null) && (ipinfo.getIPv4() !== null)) 
        {
            result += ipinfo.getIPv4();
        }
        
        return result;
    };
    
    this.whoHas = function(ip) 
    {
        var result = null;
        var pos = connectable.getConnectorPos(this);
        var ipinfo = connectable.getIPInfo(pos);
        if ((ipinfo !== null) && (ipinfo.getIPv4() === ip)) 
        {
            result = connectable.getMAC(pos);
        } 
        else 
        {
            result = connectable.findMACforIP(ip, this);
        }
        
        return result;
    };
    
    this.getIPInfo = function() 
    {
        var result = null;
        switch (connectable.getIpMode()) 
        {
            case IPMODE_NOIP:
                result = null;
                break;
            case IPMODE_UNIQUE:
                var pos = connectable.getConnectorPos(this);
                result = connectable.getIPInfo(pos);
                break;
            case IPMODE_SHARED:
                result = connectable.getIPInfo(0);
                break;
        }
        
        return result;
    };
    
    init();
};
