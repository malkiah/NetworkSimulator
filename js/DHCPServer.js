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

function editDHCPServerInfo(id) 
{
    createBkDiv();
    createDHCPServerInfoDiv(id);
}

function createDHCPServerInfoDiv(id) 
{
    var host = network.getElement(id);
    var app = host.getApp("DHCPServer");
    var div = document.createElement("div");
    /*var l = innerWidth / 2 - 200;
    var t = innerHeight / 2 - 75;
    
    div.setAttribute('style', 'position:absolute;top:' + t + 'px;left:' + l + 'px;z-index:110;background-color:white;width:400px;height:150px;border-radius:10px;border:1px solid;padding:10px;text-align:center;');
    div.setAttribute('id', 'divdhcpserverinfo');
    div.innerHTML = app.getAppController();
    div.innerHTML += '<p>\
  <input type="button" id="upload" value="Save" onclick="saveDHCPServerData('+id+');" />\
  <input type="button" id="cancel" value="Cancel" onclick="cancelDHCPServerData();" />\
  </p>';
    document.body.appendChild(div);*/
    
    var controls = '<input type="button" id="upload" value="Save" onclick="saveDHCPServerData(' + id + ');" />';
    controls += '<input type="button" id="cancel" value="Cancel" onclick="cancelDHCPServerData();" />';
    
    var window = new UIWindow('divdhcpserverinfo', 'DHCP Server', 400, 250, false, 1.0);
    window.setContent(app.getAppController());
    window.setControls(controls);
    window.render();
}

function saveDHCPServerData(id) 
{
    var elem = network.getElement(id);
    var initial = document.getElementById('dhcpinitial').value;
    var final = document.getElementById('dhcpend').value;
    var gateway = document.getElementById('dhcpgw').value;
    var dns1 = document.getElementById('dhcpdns1').value;
    var dns2 = document.getElementById('dhcpdns2').value;
    elem.getApp("DHCPServer").setData(initial, final, gateway, dns1, dns2);
    
    removeBodyDiv('divbk');
    uimanager.getWindow("divdhcpserverinfo").dispose();
}

function cancelDHCPServerData() 
{
    removeBodyDiv('divbk');
    uimanager.getWindow("divdhcpserverinfo").dispose();
}

var DHCPServer = function(ifacepos) 
{
    var owner = null;
    var ifacepos = ifacepos;
    var initial = 100;
    var end = 200;
    var gateway = null;
    var dns1 = null;
    var dns2 = null;
    var leases = [];
    var leasesbymac = [];
    
    this.save = function() 
    {
        var result = {};
        result.version = 1;
        result.id = this.getId();
        result.ifacepos = ifacepos;
        result.initial = initial;
        result.end = end;
        result.gateway = gateway;
        result.dns1 = dns1;
        result.dns2 = dns2;
        
        return result;
    };
    
    this.load = function(data) 
    {
        initial = data.initial;
        end = data.end;
        gateway = data.gateway;
        dns1 = data.dns1;
        dns2 = data.dns2;
    };
    
    this.getId = function() 
    {
        return "DHCPServer";
    };
    
    this.setData = function(initial_p, end_p, gateway_p, dns1_p, dns2_p) 
    {
        initial = initial_p;
        end = end_p;
        gateway = gateway_p;
        dns1 = dns1_p;
        dns2 = dns2_p;
    };
    
    function newLease(mac) 
    {
        var result = initial;
        var free = false;
        while (!free) 
        {
            if (result in leases) 
            {
                result++;
            } 
            else 
            {
                free = true;
            }
        }
        
        var ipdata = owner.getConnectable().getIPInfo(ifacepos).getIPv4().split(".");
        var ipbase = ipdata[0] + "." + ipdata[1] + "." + ipdata[2] + ".";
        var data = {};
        data.mac = mac;
        data.ipv4 = ipbase + result
        leases[result] = data;
        leasesbymac[mac] = data;
        return result;
    }
    
    function getExistingLease(mac) 
    {
        var result = null;
        if (mac in leasesbymac) 
        {
            result = leases.indexOf(leasesbymac[mac]);
        }
        
        return result;
    }
    
    this.receiveMessage = function(message) 
    {
        if ((message.getData().type === "request") && 
        (owner.getConnectable().getIPInfo(ifacepos).getIPv4() !== null)) 
        {
            var newip = getExistingLease(message.getOriginMAC());
            if (newip === null) 
            {
                newip = newLease(message.getOriginMAC());
            }
            var data = {};
            data.ipv4 = leases[newip].ipv4;
            data.dns1 = dns1;
            data.dns2 = dns2;
            data.gateway = gateway;
            data.netmask = owner.getConnectable().getIPInfo(ifacepos).getNetmask();
            data.description = "DHCP: offer";
            var response = new Message(
            "tcp", 
            owner.getConnectable().getIPInfo(ifacepos).getIPv4(), 
            leases[newip].ipv4, 
            owner.getConnectable().getMAC(ifacepos), 
            message.getOriginMAC(), 
            67, 
            message.getOrigPort(), 
            data, 
            images[IMAGE_ENVELOPEDHCP]
            );
            owner.getConnectable().getConnector(ifacepos).send(response);
        }
    };

    /*this.proccessCommand = function(name, args)
  {
    switch (name)
    {
      case "setData":
	this.setData(args[0], args[1], args[2], args[3], args[4]);
	break;
    };
  };*/
    
    this.setOwner = function(o) 
    {
        owner = o;
    };

    /*this.getCommands = function()
  {
    var data = [];
    
    data["setData"] = {};
    data["setData"].name = "setData";
    data["setData"].args = [
    {name: "initial", type: "int"},
    {name: "end", type: "int"},
    {name: "gateway", type: "ip"},
    {name: "dns1", type: "ip"},
    {name: "dns2", type: "ip"}
    ];
    
    return data;
  };*/
    
    this.getIfacepos = function() 
    {
        return ifacepos;
    };
    
    this.getAppController = function() 
    {
        var id = network.getPosForElement(owner);
        result = "<label for='dhcpinitial'>Initial:</label> \
    <input type='text' id='dhcpinitial' value='" + initial + "' /><br/> \
    <label for='dhcpend'>Final:</label> \
    <input type='text' id='dhcpend' value='" + end + "' /><br/> \
    <label for='dhcpgw'>Gateway:</label> \
    <input type='text' id='dhcpgw' value='" + ((gateway === null) ? "" : gateway) + "' /><br/> \
    <label for='dhcpdns1'>DNS 1:</label> \
    <input type='text' id='dhcpdns1' value='" + ((dns1 === null) ? "" : dns1) + "' /><br/> \
    <label for='dhcpdns2'>DNS 2:</label> \
    <input type='text' id='dhcpdns2' value='" + ((dns2 === null) ? "" : dns2) + "' /><br/> \
    ";
        return result;
    };
    
    this.getMenuEntries = function() 
    {
        var data = [];
        
        data[0] = {};
        data[0].img = 'img/64/envelope-DHCP.png';
        data[0].text = 'Edit DHCP server info';
        data[0].js = 'editDHCPServerInfo(' + owner.id + ');';
        
        return data;
    };
};
