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

function editNameGroup(id)
{
    createBkDiv();
    createNameGroupDiv(id);    
}

function createNameGroupDiv(id)
{
    var host = network.getElement(id);
    /*var div = document.createElement("div");
    var l = window.innerWidth / 2 - 200;
    var t = window.innerHeight / 2 - 200;
    
    div.setAttribute('style', 'position:absolute;top:' + t + 'px;left:' + l + 'px;z-index:110;background-color:white;width:700px;height:400px;border-radius:10px;border:1px solid;padding:10px;text-align:center;');
    div.setAttribute('id', 'divnamegroup');*/
    var innerHTML = '<p>';
    innerHTML += '<label for="nametxt">'+_("Name:")+'</label>';
    innerHTML += '<input type="text" id="nametxt" value="'+ ((host.getName() === null)?"":host.getName()) +'" /><br/>';
    innerHTML += '<label for="grouptxt">'+_("Group:")+'</label>';
    innerHTML += '<input type="text" id="grouptxt" value="'+ ((host.getGroup() === null)?"":host.getGroup()) +'" />';
    innerHTML += '</p>';
    var controls = '<p>\
  <input type="button" id="save" value="'+_("Save")+'" onclick="saveNameGroup('+id+');" />\
  <input type="button" id="cancel" value="'+_("Exit")+'" onclick="cancelNameGroup();" />\
  </p>';
    /*div.innerHTML = innerHTML;
    document.body.appendChild(div);*/
    var w = new UIWindow('divnamegroup', _('Edit name / group'), 400, 150, false, 1.0);
    w.setContent(innerHTML);
    w.setControls(controls);
    w.render();
}

function cancelNameGroup()
{
    uimanager.getWindow("divnamegroup").dispose();
    removeBodyDiv('divbk');    
}

function saveNameGroup(id)
{
    var host = network.getElement(id);
    var name = document.getElementById("nametxt").value;
    var group = document.getElementById("grouptxt").value;
    group = (group === "")?null:group;
    host.setName(name);
    host.setGroup(group);
    uimanager.getWindow("divnamegroup").dispose();
    removeBodyDiv('divbk');    
}

function networkDiagnostics(id)
{
    createBkDiv();
    createDiagnosticsDiv(id);    
}

function createDiagnosticsDiv(id)
{
    var host = network.getElement(id);
    var div = document.createElement("div");
    /*var l = window.innerWidth / 2 - 200;
    var t = window.innerHeight / 2 - 200;
    
    div.setAttribute('style', 'position:absolute;top:' + t + 'px;left:' + l + 'px;z-index:110;background-color:white;width:700px;height:400px;border-radius:10px;border:1px solid;padding:10px;text-align:center;opacity:0.5;');
    div.setAttribute('id', 'divdiagnostics');*/
    var innerHTML = '<p>';
    innerHTML += '<select id="ifacepos">';
    for (var i = 0; i < host.getConnectable().getConnectorNumber(); i++)
    {
        innerHTML += '<option value="'+ i +'">' + host.getConnectorDesc(i) + "</option>";
    }
    innerHTML += '</select>';
    innerHTML += '<input type="text" id="diagnosticstxt" />';
    innerHTML += '</p>';
    innerHTML += '<p>';
    innerHTML += '<input type="button" id="ping" value="Ping" onclick="diagnosticsPing('+id+')" />';
    innerHTML += '<input type="button" id="traceroute" value="Trace Route" onclick="diagnosticsTraceroute('+id+')" />';
    innerHTML += '</p>';
    innerHTML += '<div style="width:100%;height:250px;text-align:left;font-size:0.8em;font-style:italic;overflow-y:scroll;" id="diagnosticsconsole" >';
    innerHTML += host.getConnectable().getTrafficManager().getDiagnosticsInfo();
    innerHTML += '</div>';
    var controls = '<p><input type="button" id="cancel" value="'+_("Exit")+'" onclick="cancelDiagnostics();" /></p>';
    /*div.innerHTML = innerHTML;
    document.body.appendChild(div);*/
    var window = new UIWindow('divdiagnostics','Network diagnostics',400,400,false,1.0);
    window.setContent(innerHTML);
    window.setControls(controls);
    window.render();
}

function diagnosticsPing(id)
{
    var host = network.getElement(id);
    var dst = document.getElementById("diagnosticstxt").value;
    var ifacepos = document.getElementById("ifacepos").value;
    host.getConnectable().getTrafficManager().ping(dst, ifacepos);
}

function diagnosticsTraceroute(id)
{
    var host = network.getElement(id);
    var dst = document.getElementById("diagnosticstxt").value;
    var ifacepos = document.getElementById("ifacepos").value;
    host.getConnectable().getTrafficManager().traceroute(dst, ifacepos);
}

function cancelDiagnostics()
{
    removeBodyDiv('divbk');    
    uimanager.getWindow("divdiagnostics").dispose();
}

function editNATTable(id) 
{
    createBkDiv();
    createNATDiv(id);
}

function createNATDiv(id) 
{
    var host = network.getElement(id);
    var div = document.createElement("div");
    /*var l = window.innerWidth / 2 - 350;
    var t = window.innerHeight / 2 - 200;*/
    
    var headers = [_("Input interface"),_("WAN Port"),_("LAN Port"),_("IP")];
    var data = host.getConnectable().getTrafficManager().getNATData();
    var uinattable = new UITable(headers,data,'nattable');
    
    /*div.setAttribute('style', 'position:absolute;top:' + t + 'px;left:' + l + 'px;z-index:110;background-color:white;width:700px;height:400px;border-radius:10px;border:1px solid;padding:10px;text-align:center;');
    div.setAttribute('id', 'divnatconfig');*/
    var innerHTML = "";
    if (host.getType() === "router")
    {
        var chktxt = (host.getConnectable().getPerformNAT()?"checked='checked'":"");
        innerHTML += "<p>";
        innerHTML += "<input type='checkbox' id='performNAT' "+chktxt+" />";
        innerHTML += "<label for='performNAT'>"+_("Gateway mode (uses NAT).")+"</label>";
        innerHTML += "</p>";
    }
    innerHTML += '<table id="nattable" style="font-size:0.8em;width:100%;"></table>';
    var controls = '<p>\
  <input type="button" id="upload" value="'+_("Save")+'" onclick="saveNATConfig(' + id + ',\''+uinattable.getId()+'\');" />\
  <input type="button" id="cancel" value="'+_("Cancel")+'" onclick="cancelNATConfig(\''+uinattable.getId()+'\');" />\
  </p>';
    /*div.innerHTML = innerHTML;
    document.body.appendChild(div);*/
    var w = new UIWindow('divnatconfig', 'Edit NAT', 700, 400, false, 1.0);
    w.setContent(innerHTML);
    w.setControls(controls);
    w.render();
    uinattable.render();
}

function cancelNATConfig(uitableid) 
{
    uimanager.getWindow("divnatconfig").dispose();
    removeBodyDiv('divbk');
    uitables[uitableid].dispose();
}

function saveNATConfig(id, uitableid) 
{
    var host = network.getElement(id);
    host.getConnectable().getTrafficManager().removeFixedNATData();
    var data = uitables[uitableid].getData();
    for (var i = 0; i < data.length; i++)
    {
        host.getConnectable().getTrafficManager().addNATEntry(data[i][2],data[i][1],data[i][3],data[i][0],true);
    }
    var performNAT = document.getElementById("performNAT");
    if (performNAT !== null)
    {
        host.getConnectable().setPerformNAT(performNAT.checked);
    };
    uimanager.getWindow("divnatconfig").dispose();
    removeBodyDiv('divbk');
    uitables[uitableid].dispose();
}

function editIpInfo(id, pos) 
{
    createBkDiv();
    createIpDiv(id, pos);
}

function createIpDiv(id, pos) 
{
    var host = network.getElement(id);
    var connectable = host.getConnectable();
    var ipinfo = connectable.getIPInfo(pos);
    var div = document.createElement("div");
    var l = window.innerWidth / 2 - 200;
    var t = window.innerHeight / 2 - 75;
    
    var ip = ipinfo.getIPv4() !== null?ipinfo.getIPv4():"";
    var nm = ipinfo.getNetmask() !== null?ipinfo.getNetmask():"255.255.255.0";
    var dns1 = ipinfo.getDNS1() !== null?ipinfo.getDNS1():"";
    var dns2 = ipinfo.getDNS2() !== null?ipinfo.getDNS2():"";
    
    div.setAttribute('style', 'position:absolute;top:' + t + 'px;left:' + l + 'px;z-index:110;background-color:white;width:400px;height:150px;border-radius:10px;border:1px solid;padding:10px;text-align:center;');
    div.setAttribute('id', 'divipinfo');
    var innerHTML = '<label for="ip">'+_("IP Address:")+'</label>';
    innerHTML += '<input id="ip" type="text" value="'+ ip +'" /><br/>';
    innerHTML += '<label for="nm">'+_("Network Mask:")+'</label>';
    innerHTML += '<input id="nm" type="text" value="'+ nm +'" /><br/>';
    innerHTML += '<label for="dns1">'+_("DNS 1:")+'</label>';
    innerHTML += '<input id="dns1" type="text" value="'+ dns1 +'" /><br/>';
    innerHTML += '<label for="dns2"'+_(">DNS 2:")+'</label>';
    innerHTML += '<input id="dns2" type="text" value="'+ dns2 +'" /><br/>';
    var controls = '<p>\
  <input type="button" id="upload" value="'+_("Save")+'" onclick="saveIpInfo('+id+','+pos+');" />\
  <input type="button" id="cancel" value="'+_("Cancel")+'" onclick="cancelIpInfo();" />\
  </p>';
    //document.body.appendChild(div);
    var w = new UIWindow('divipinfo', 'Edit IP Info', 400, 150, false, 1.0);
    w.setContent(innerHTML);
    w.setControls(controls);
    w.render();
}

function saveIpInfo(id, pos) 
{
    var host = network.getElement(id);
    
    var ipv4 = document.getElementById("ip").value;
    var netmask = document.getElementById("nm").value;
    var dns1 = document.getElementById("dns1").value;
    var dns2 = document.getElementById("dns2").value;

    ipv4 = ipv4 === ""?null:ipv4;
    netmask = netmask === ""?null:netmask;
    dns1 = dns1 === ""?null:dns1;
    dns2 = dns2 === ""?null:dns2;
    
    host.getConnectable().getIPInfo(pos).setIPv4(ipv4);
    host.getConnectable().getIPInfo(pos).setNetmask(netmask);
    host.getConnectable().getIPInfo(pos).setDNS1(dns1);
    host.getConnectable().getIPInfo(pos).setDNS2(dns2);
    host.getConnectable().getIPInfo(pos).setStatic(true);

    uimanager.getWindow("divipinfo").dispose();
    removeBodyDiv('divbk');
}

function cancelIpInfo() 
{
    uimanager.getWindow("divipinfo").dispose();
    removeBodyDiv('divbk');
}

var Host = function(type, ports) 
{
    this.id = getNextID();
    var type = type;
    var connectable = null;
    var drawable = null;
    var _self = this;
    var ports = ports;
    var menu = null;
    var name = type + " " + this.id;
    var group = null;
    
    var apps = [];
    
    this.save = function() 
    {
        var result = {};
        result.version = 1;
        result.id = this.id;
        result.type = type;
        result.drawable = drawable.save();
        result.connectable = connectable.save();
        result.ports = ports;
        result.apps = [];
        result.name = name;
        result.group = group;
        
        for (var id in apps) 
        {
            var data = {};
            data.app = apps[id].app.save();
            data.port = apps[id].port;
            data.fixed = apps[id].fixed;
            data.type = id;
            data.ifacepos = apps[id].app.getIfacepos();
            result.apps.push(data);
        }
        
        return result;
    };
    
    this.load = function(data) 
    {
        this.id = data.id;
        type = data.type;
        drawable.load(data.drawable);
        switch (type) 
        {
            case "computer":
                drawable.setImage(network.getImages()[IMAGE_COMPUTER]);
                break;
            case "dhcpserver":
                drawable.setImage(network.getImages()[IMAGE_SERVERDHCP]);
                break;
            case "dnsserver":
                drawable.setImage(network.getImages()[IMAGE_SERVERDNS]);
                break;
            case "httpserver":
                drawable.setImage(network.getImages()[IMAGE_SERVERWEB]);
                break;
            case "router":
                drawable.setImage(network.getImages()[IMAGE_ROUTER]);
                break;
            case "switch":
                drawable.setImage(network.getImages()[IMAGE_SWITCH]);
                break;
        }
        connectable.load(data.connectable);
        if (data.apps) 
        {
            for (var i = 0; i < data.apps.length; i++) 
            {
                var app = eval('new ' + data.apps[i].type + '(' + data.apps[i].ifacepos + ')');
                app.load(data.apps[i].app);
                this.addApp(app, data.apps[i].port, data.apps[i].fixed);
            }
        }

        if (data.name)
        {
            this.setName(data.name);
        }
        if (data.group)
        {
            group = data.group;
        }

        redoMenu();
    };
    
    function init() 
    {
        switch (type) 
        {
            case "router":
                connectable = new Connectable(_self, MACMODE_UNIQUE, IPMODE_UNIQUE, true, true);
                break;
            case "switch":
                connectable = new Connectable(_self, MACMODE_SHARED, IPMODE_NOIP, false, false);
                break;
            default:
                connectable = new Connectable(_self, MACMODE_UNIQUE, IPMODE_UNIQUE, true, false);
                break;
        }
        for (var i = 0; i < ports; i++) 
        {
            var connector = new Connector(connectable);
        }
        drawable = new Drawable(_self);
        drawable.addObserver(_self);
        menu = new UIMenu(name, 0, 0, false);
        addStaticMenu();
        uimanager.addMenu(menu);
    }

    this.setName = function(n)
    {
        name = n;
        redoMenu();
    };
    
    this.setGroup = function(g)
    {
        group = g;
    };

    this.getName = function()
    {
        return name;
    };
    
    this.getGroup = function()
    {
        return group;
    };
    
    this.getConnectorDesc = function(i) 
    {
        var result = _("Interface ") + i;
        if (type === "router") 
        {
            result = (i === ROUTER_WAN) ? "WAN" : "LAN";
        }
        
        return result;
    }
    
    function addStaticMenu() 
    {
        menu.addEntry("img/64/delete.png", "Delete element", "deleteSelected();");
        menu.addEntry("img/64/edit.png", "Edit Name / Group", "editNameGroup(" + _self.id + ");");            
        menu.addEntry("img/64/link.png", "Create Link", "createLinkAction();");
        if (connectable.getIpMode() !== IPMODE_NOIP) 
        {
            menu.addEntry("img/64/inspect.png", "Network diagnostics", "networkDiagnostics(" + _self.id + ");");
            menu.addEntry("img/64/edit.png", "Edit Gateways", "editGateways(" + _self.id + ");");            
        }
        
        if (connectable.getIpMode() === IPMODE_UNIQUE) 
        {
            for (var i = 0; i < connectable.getConnectorNumber(); i++) 
            {
                menu.addEntry("img/64/edit.png", "Edit IP Info - " + _self.getConnectorDesc(i), "editIpInfo(" + _self.id + "," + i + ");");
            }
        }

        if (type === "router")
        {
            menu.addEntry("img/64/edit.png", "Edit NAT table", "editNATTable(" + _self.id + ");");
        }
    }
    
    this.drawableChanged = function() 
    {
        var rect = drawable.getRect();
        
        menu.setPos(rect.x + rect.width, rect.y);
    };
    
    function redoMenu() 
    {
        menu.purge();
        menu.setDescription(name);
        
        addStaticMenu();
        
        for (var id in apps) 
        {
            var app = apps[id];
            var entries = app.app.getMenuEntries();
            for (var i = 0; i < entries.length; i++) 
            {
                menu.addEntry(entries[i].img, entries[i].text, entries[i].js);
            }
        }
    }
    
    this.addApp = function(app, port, fixed) 
    {
        apps[app.getId()] = {};
        apps[app.getId()].app = app;
        apps[app.getId()].port = port;
        apps[app.getId()].fixed = fixed;
        app.setOwner(_self);
        if (fixed) 
        {
            connectable.getTrafficManager().registerApplication(app, port, true);
        }
        
        redoMenu();
    };
    
    this.getAppNames = function(id) 
    {
        return Object.keys(apps);
    };
    
    this.getApp = function(id) 
    {
        var result = null;
        
        if (id in apps) 
        {
            result = apps[id].app;
        }
        
        return result;
    };
    
    this.getConnectable = function() 
    {
        return connectable;
    }
    
    this.getDrawable = function() 
    {
        return drawable;
    };
    
    this.getType = function() 
    {
        return type;
    };
    
    this.getStrInfo = function() 
    {
        result = name;
        
        if (connectable.getIpMode() === IPMODE_UNIQUE)
        {
            for (var i = 0; i < connectable.getConnectorNumber();i++)
            {
                result += "\n";
                result += this.getConnectorDesc(i);
                result += ": ";
                result += (connectable.getIPInfo(i).getIPv4() === null)?"-":connectable.getIPInfo(i).getIPv4();
            }
        }
        else if (connectable.getIpMode() === IPMODE_SHARED)
        {
            result += "\n";
            result += _("IP: ");
            result += ": ";
            result += (connectable.getIPInfo(0).getIPv4() === null)?"-":connectable.getIPInfo(0).getIPv4();
        }
        
        return result;
    };
    
    this.getMenu = function() 
    {
        return menu;
    };
    
    this.dispose = function() 
    {
        if (menu.getVisible()) 
        {
            menu.hide();
        }
        uimanager.deleteMenu(menu);
        drawable.dispose();
    };

    init();
};
