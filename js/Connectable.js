var Connectable = function(c_owner, macmode, ipmode, limitbroadcast, performNAT) 
{
    this.id = getNextID();
    var connectors = [];
    var macaddresses = [];
    var ipinfos = [];
    var macmode = macmode;
    var ipmode = ipmode;
    var trafficManager = null;
    var ARPtable = [];
    var addressingTable = [];
    var performNAT = performNAT;
    var gateways = null;
    
    var _self = this;
    var owner = c_owner;
    
    this.save = function() 
    {
        var result = {};
        result.version = 1;
        result.id = this.id;
        result.connectors = [];
        result.macaddresses = [];
        result.ipinfos = [];
        result.macmode = macmode;
        result.ipmode = ipmode;
        result.trafficManager = trafficManager.save();
        result.gateways = gateways.save();
        result.performNAT = performNAT;
        
        for (var i = 0; i < connectors.length; i++) 
        {
            result.connectors.push(connectors[i].save());
        }
        
        result.macaddresses = macaddresses;
        
        for (var i = 0; i < ipinfos.length; i++) 
        {
            result.ipinfos.push(ipinfos[i].save());
        }
        
        return result;
    };
    
    this.load = function(data) 
    {
        this.id = data.id;
        for (var i = 0; i < data.connectors.length; i++) 
        {
            connectors[i].load(data.connectors[i]);
        }
        macaddresses = data.macaddresses;
        for (var i = 0; i < data.ipinfos.length; i++) 
        {
            ipinfos[i].load(data.ipinfos[i]);
        }
        macmode = data.macmode;
        ipmode = data.ipmode;
        if (typeof data.performNAT !== 'undefined')
        {
            this.setPerformNAT(data.performNAT);
        }
        trafficManager.load(data.trafficManager);
        gateways.load(data.gateways ? data.gateways : null);
    };
    
    this.updateAddressing = function(mac, ifacepos) 
    {
        addressingTable[mac] = ifacepos;
    };

    /*this.getDstMAC = function(ifacepos, ip) 
    {
        var result = null;

        // Si es broadcast
        if (ip == "255.255.255.255") 
        {
            result = "FF:FF:FF:FF:FF:FF";
        } 
        // Si es de mi red, pido la MAC de esa IP
        else if (this.getIPInfo(ifacepos).sameNetwork(ip)) 
        {
            result = this.getMACforIP(ip);
        } 
        // Si no es de mi red, pido la MAC de la IP de mi GW
        else 
        {
            result = this.getMACforIP(this.getIPInfo(ifacepos).getGateway());
        }
        return result;
    };*/
    
    this.isInMyNetworks = function(ip) 
    {
        var result = false;
        var i = 0;
        
        while ((result === false) && (i < connectors.length)) 
        {
            result = this.getIPInfo(i).sameNetwork(ip);
            i++;
        }
        
        return result;
    };
    
    this.getDstMAC = function(ip) 
    {
        var result = null;

        // Si es broadcast
        if (ip == "255.255.255.255") 
        {
            result = "FF:FF:FF:FF:FF:FF";
        } 
        // Si es de la red de alguna de mis interfaces, pido la MAC de esa IP
        else if (this.isInMyNetworks(ip)) 
        {
            result = this.findMACforIP(ip, null);
        } 
        // Si no es de mi red, pido la MAC de la IP del GW de esa IP.
        else 
        {
            result = this.findMACforIP(gateways.getGatewayForIP(ip, null));
        }
        return result;
    };

    this.findMACforIP = function(ip, exclude) 
    {
        var result = null;
        var i = 0;
        while ((result === null) && (i < connectors.length)) 
        {
            if (connectors[i] !== exclude) 
            {
                var c = connectors[i].getConnectedConnector();
                if (c !== null) 
                {
                    // Si el conector no tiene IP, o es de la misma subred que la ip solicitada...
                    var nextip = c.getIPInfo();
                    if ((nextip === null) || nextip.sameNetwork(ip)) 
                    {
                        result = c.whoHas(ip);
                        if (result !== null) 
                        {
                            ARPtable[ip] = result;
                            addressingTable[result] = i;
                        }
                    }
                }
            }
            i++;
        }
        return result;
    };
    
    function addNewMAC() 
    {
        var chars = "0123456789ABCDEF";
        var mac = "";
        
        for (var i = 0; i < 12; i++) 
        {
            mac += chars.charAt(Math.floor(Math.random() * chars.length));
            if ((i % 2 == 1) && (i !== 11)) 
            {
                mac += ":";
            }
        }
        
        macaddresses.push(mac);
    }
    
    function addNewIPInfo() 
    {
        ipinfos.push(new IPInfo());
    }
    
    function init() 
    {
        trafficManager = new TrafficManager(_self, limitbroadcast, performNAT);
        gateways = new GatewayManager(_self);
        if (macmode === MACMODE_SHARED) 
        {
            addNewMAC();
        }
        if (ipmode === IPMODE_SHARED) 
        {
            addNewIPInfo();
        }
    }
    
    this.getTrafficManager = function() 
    {
        return trafficManager;
    };
    
    this.getGatewayManager = function() 
    {
        return gateways;
    };
    
    this.addConnector = function(connector) {
        connectors.push(connector);
        if (macmode === MACMODE_UNIQUE) 
        {
            addNewMAC();
        }
        if (ipmode === IPMODE_UNIQUE) 
        {
            addNewIPInfo();
        }
    };
    
    this.removeConnector = function(pos) {
        connectors.slice(pos, 1);
    };
    
    this.getConnector = function(pos) {
        return connectors[pos];
    };
    
    this.getConnectorNumber = function() {
        return connectors.length;
    };
    
    this.getOwner = function() 
    {
        return owner;
    };
    
    this.getMAC = function(pos) 
    {
        var result = null;
        if (pos < macaddresses.length) 
        {
            if (macmode === MACMODE_SHARED) 
            {
                pos = 0;
            }
            result = macaddresses[pos];
        }
        return result;
    }
    
    this.getIPInfo = function(pos) 
    {
        var result = null;
        if (pos < ipinfos.length) 
        {
            if (ipmode === IPMODE_SHARED) 
            {
                pos = 0;
            }
            result = ipinfos[pos];
        }
        return result;
    }
    
    this.getFirstFreeConnector = function() 
    {
        var result = false;
        var i = 0;
        while (result === false && i < connectors.length) 
        {
            if (!connectors[i].isConnected()) 
            {
                result = connectors[i];
            } 
            else 
            {
                i++;
            }
        }
        
        return result;
    };
    
    this.compatibleIP = function(ip, allowBroadcast) 
    {
        // Broadcast o alguna de las IPs de la lista
        var result = allowBroadcast && this.compatibleBroadcastIP(ip);
        
        if (!result) 
        {
            var i = 0;
            while (!result && i < ipinfos.length) 
            {
                result = ipinfos[i].getIPv4() === ip;
                i++;
            }
        }
        
        return result;
    };
    
    this.compatibleBroadcastIP = function(ip) 
    {
        // En esta versión sólo aceptamos ésta dir de Broadcast
        return ip === "255.255.255.255";
    };
    
    this.compatibleMAC = function(mac, allowBroadcast) 
    {
        // Broadcast o alguna de las MACs de la lista
        var result = allowBroadcast && this.compatibleBroadcastMAC(mac);
        
        if (!result) 
        {
            var i = 0;
            while (!result && i < macaddresses.length) 
            {
                result = macaddresses[i] === mac;
                i++;
            }
        }
        
        return result;
    };
    
    this.compatibleBroadcastMAC = function(mac) 
    {
        // En esta versión sólo aceptamos ésta dir de Broadcast
        return mac === "FF:FF:FF:FF:FF:FF";
    };
    
    this.getConnectorPos = function(connector) 
    {
        return connectors.indexOf(connector);
    };
    
    this.getIpMode = function() 
    {
        return ipmode;
    };
    
    this.getSenderConnectorForMAC = function(mac) 
    {
        var result = null;
        
        if (mac in addressingTable) 
        {
            result = connectors[addressingTable[mac]];
        }
        
        return result;
    };
    
    this.findConnector = function(id) 
    {
        var result = null;
        var i = 0;
        while ((result === null) && (i < connectors.length)) 
        {
            if (connectors[i].id === id) 
            {
                result = connectors[i];
            }
            i++;
        }
        
        return result;
    };
    
    this.getPerformNAT = function() 
    {
        return performNAT;
    };

    this.setPerformNAT = function(pnat)
    {
        performNAT = pnat;
        trafficManager.setPerformNAT(pnat);
    };
    
    init();
};
