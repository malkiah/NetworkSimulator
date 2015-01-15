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

function setupDNSServerConfig(id) 
{
    createBkDiv();
    createDNSServerConfigDiv(id);
}

function createDNSServerConfigDiv(id) 
{
    var host = network.getElement(id);
    var app = host.getApp("DNSServer");
    /*var div = document.createElement("div");
    var l = window.innerWidth / 2 - 200;
    var t = window.innerHeight / 2 - 200;*/
    
    var headers = ["Domain", "IP"];
    var data = app.getAppControllerData();
    var uidnstable = new UITable(headers, data, 'dnstable');
    
    /*div.setAttribute('style', 'position:absolute;top:' + t + 'px;left:' + l + 'px;z-index:110;background-color:white;width:400px;height:400px;border-radius:10px;border:1px solid;padding:10px;text-align:center;');
    div.setAttribute('id', 'divdnsserverconfig');
    div.innerHTML = app.getAppController();*/
    var controls = '<input type="button" id="upload" value="Save" onclick="saveDNSServerConfig(' + id + ',\'' + uidnstable.getId() + '\');" />\
  <input type="button" id="cancel" value="Cancel" onclick="cancelDNSServerConfig(\'' + uidnstable.getId() + '\');" />';
    var w = new UIWindow('divdnsserverconfig', 'DNS Server', 400, 400, false, 1.0);
    w.setContent(app.getAppController());
    w.setControls(controls);
    w.render();
    uidnstable.render();
}

function saveDNSServerConfig(id, uitableid) 
{
    var data = uitables[uitableid].getData();
    var host = network.getElement(id);
    var app = host.getApp("DNSServer");
    app.resetDNSTable();
    for (var i = 0; i < data.length; i++) 
    {
        app.setEntry(data[i][0], data[i][1]);
    }
    
    var fwderval = document.getElementById('forwarder').value;
    app.setForwarder(fwderval);
    
    uimanager.getWindow("divdnsserverconfig").dispose();
    removeBodyDiv('divbk');
    uitables[uitableid].dispose();
}

function cancelDNSServerConfig(uitableid) 
{
    uimanager.getWindow("divdnsserverconfig").dispose();
    removeBodyDiv('divbk');
    uitables[uitableid].dispose();
}

var DNSServer = function(ifacepos) 
{
    var owner = null;
    var ifacepos = ifacepos;
    var dnstable = [];
    var forwarder = null;
    var forwarderQueue = [];
    var _self = this;
    
    this.save = function() 
    {
        var result = {};
        result.version = 1;
        result.id = this.getId();
        result.ifacepos = ifacepos;
        result.dnstable = [];
        result.forwarder = forwarder;
        for (var domain in dnstable) 
        {
            var data = {};
            data.domain = domain;
            data.ip = dnstable[domain];
            result.dnstable.push(data);
        }
        
        return result;
    };
    
    this.load = function(data) 
    {
        if (data.forwarder) 
        {
            forwarder = data.forwarder;
        }
        
        for (var i = 0; i < data.dnstable.length; i++) 
        {
            this.setEntry(data.dnstable[i].domain, data.dnstable[i].ip);
        }
    };
    
    this.getId = function() 
    {
        return "DNSServer";
    };
    
    this.getPort = function() 
    {
        return port;
    };
    
    this.resetDNSTable = function() 
    {
        dnstable = [];
    };
    
    this.setEntry = function(domain, ip) 
    {
        dnstable[domain] = ip;
    };
    
    this.deleteDNSEntry = function(domain) 
    {
        if (domain in dnstable) 
        {
            delete dnstable[domain];
        }
    };
    
    function forwardLookup(message) 
    {
        var MAC = owner.getConnectable().getDstMAC(forwarder);
        if (MAC !== null) 
        {
            var data = {};
            data.domain = message.getData().domain;
            data.type = "lookup_forward";
            data.description = "Lookup Fwd: " + message.getData().domain;
            data.originId = message.getId();

            var response = new Message(
            "tcp", 
            owner.getConnectable().getIPInfo(ifacepos).getIPv4(), 
            forwarder, 
            owner.getConnectable().getMAC(ifacepos), 
            MAC, 
            getDinamycPort(), 
            53, 
            data, images[IMAGE_ENVELOPEDNS]
            );

            forwarderQueue[response.getId()] = {};
            forwarderQueue[response.getId()].domain = message.getData().domain;
            forwarderQueue[response.getId()].ip = message.getOriginIP();
            forwarderQueue[response.getId()].port = message.getOrigPort();
            forwarderQueue[response.getId()].originId = message.getId();
            
            owner.getConnectable().getTrafficManager().registerApplication(_self, response.getOrigPort(), false);
            owner.getConnectable().getConnector(ifacepos).send(response);
        }
    }
    ;
    
    function proccessLookup(message) 
    {
        var send = false;
        var data = {};
        data.domain = message.getData().domain;
        data.type = "response";
        if (data.domain in dnstable) 
        {
            data.ip = dnstable[data.domain];
            data.description = "Response: " + data.ip;
            send = true;
        } 
        else 
        {
            if (forwarder !== null) 
            {
                forwardLookup(message);
            } 
            else 
            {
                data.ip = null;
                data.description = "Response: not found";
                send = true;
            }
        }
        
        if (send) 
        {
            var response = new Message(
            "tcp", 
            owner.getConnectable().getIPInfo(ifacepos).getIPv4(), 
            message.getOriginIP(), 
            owner.getConnectable().getMAC(ifacepos), 
            owner.getConnectable().getDstMAC(message.getOriginIP()),  //message.getOriginMAC(), 
            53, 
            message.getOrigPort(), 
            data, 
            images[IMAGE_ENVELOPEDNS]
            );
            owner.getConnectable().getConnector(ifacepos).send(response);
        }
    }
    
    function proccessLookupForward(message) 
    {
        var send = false;
        var data = {};
        data.domain = message.getData().domain;
        data.type = "response_forward";
        data.originId = message.getId();
        if (data.domain in dnstable) 
        {
            data.ip = dnstable[data.domain];
            data.description = "Response Fwd: " + data.ip;
            send = true;
        } 
        else 
        {
            if (forwarder !== null) 
            {
                forwardLookup(message);
            } 
            else 
            {
                data.ip = null;
                data.description = "Response Fwd: not found";
                send = true;
            }
        }
        
        if (send) 
        {
            var response = new Message(
            "tcp", 
            owner.getConnectable().getIPInfo(ifacepos).getIPv4(), 
            message.getOriginIP(), 
            owner.getConnectable().getMAC(ifacepos), 
            owner.getConnectable().getDstMAC(message.getOriginIP()),  //message.getOriginMAC(), 
            53, 
            message.getOrigPort(), 
            data, 
            images[IMAGE_ENVELOPEDNS]
            );
            owner.getConnectable().getConnector(ifacepos).send(response);
        }
    }
    
    function proccessResponseForward(message) 
    {
        if (message.getData().originId in forwarderQueue) 
        {
            var data = {};
            data.domain = message.getData().domain;
            data.type = "response_forward";
            data.originId = forwarderQueue[message.getData().originId].originId;
            if (data.domain !== null) 
            {
                data.ip = message.getData().ip;
                data.description = "Response Fwd: " + data.ip;
            } 
            else 
            {
                data.ip = null;
                data.description = "Response Fwd: not found";
            }
            var response = new Message(
            "tcp", 
            owner.getConnectable().getIPInfo(ifacepos).getIPv4(), 
            forwarderQueue[message.getData().originId].ip, 
            owner.getConnectable().getMAC(ifacepos), 
            owner.getConnectable().getDstMAC(forwarderQueue[message.getData().originId].ip),  //message.getOriginMAC(), 
            53, 
            forwarderQueue[message.getData().originId].port, 
            data, 
            images[IMAGE_ENVELOPEDNS]
            );
            delete forwarderQueue[message.getData().originId];
            owner.getConnectable().getConnector(ifacepos).send(response);
        }
    }
    
    this.receiveMessage = function(message) 
    {
        if ((message.getData().type === "lookup") && (message.getData().domain)) 
        {
            proccessLookup(message);
        } 
        else if ((message.getData().type === "lookup_forward") && (message.getData().domain)) 
        {
            proccessLookupForward(message);
        } 
        else if ((message.getData().type === "response_forward")) 
        {
            proccessResponseForward(message);
        }
    };
    
    this.setOwner = function(o) 
    {
        owner = o;
    };
    
    this.getIfacepos = function() 
    {
        return ifacepos;
    };
    
    this.getAppController = function() 
    {
        var id = network.getPosForElement(owner);
        result = "<table id='dnstable' style='font-size:0.8em;'></table>";
        result += "<p>";
        result += "<label for='forwarder'>Forwarder:</label>";
        var fwderval = (forwarder === null) ? "" : forwarder;
        result += "<input type='text' id='forwarder' value='" + fwderval + "' />";
        result += "</p>";
        return result;
    };
    
    this.getMenuEntries = function() 
    {
        var data = [];
        data[0] = {};
        data[0].img = 'img/64/envelope-DNS.png';
        data[0].text = 'DNS server config';
        data[0].js = 'setupDNSServerConfig(' + owner.id + ');';
        
        return data;
    };
    
    this.getAppControllerData = function() 
    {
        var result = [];
        
        for (var domain in dnstable) 
        {
            var data = [];
            data.push(domain);
            data.push(dnstable[domain]);
            result.push(data);
        }
        
        return result;
    };
    
    this.setForwarder = function(fwder) 
    {
        forwarder = fwder;
    };
};
