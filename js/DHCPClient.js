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

function requestDHCPInfoCommand(id) 
{
    var elem = network.getElement(id);
    elem.getApp("DHCPClient").requestInfo();
}

var DHCPClient = function(ifacepos) 
{
    var owner = null;
    var ifacepos = ifacepos;
    var menu = null;
    
    this.save = function() 
    {
        var result = {};
        result.version = 1;
        result.id = this.getId();
        result.ifacepos = ifacepos;

        return result;
    };

    this.load = function(data)
    {
    };

    this.getId = function() 
    {
        return "DHCPClient";
    };
    
    this.requestInfo = function() 
    {
        var data = {};
        data.type = "request";
        data.description = "DHCP: request";
        var message = new Message(
        "tcp",
        owner.getConnectable().getIPInfo(ifacepos).getIPv4(),
        "255.255.255.255",
        owner.getConnectable().getMAC(ifacepos),
        "FF:FF:FF:FF:FF:FF",
         getDinamycPort(),
         67,
         data,
         images[IMAGE_ENVELOPEDHCP]);
        owner.getConnectable().getTrafficManager().registerApplication(this, message.getOrigPort(), false);
        owner.getConnectable().getConnector(ifacepos).send(message);
    };
    
    this.receiveMessage = function(message) 
    {
        owner.getConnectable().getIPInfo(ifacepos).setIPv4(message.getData().ipv4);
        owner.getConnectable().getIPInfo(ifacepos).setDNS1(message.getData().dns1);
        owner.getConnectable().getIPInfo(ifacepos).setDNS2(message.getData().dns2);
        //owner.getConnectable().getIPInfo(ifacepos).setGateway(message.getData().gateway);
        owner.getConnectable().getGatewayManager().addGatewayInfo("0.0.0.0","0.0.0.0",message.getData().gateway);
        owner.getConnectable().getIPInfo(ifacepos).setNetmask(message.getData().netmask);
        owner.getConnectable().getIPInfo(ifacepos).setStatic(false);
    };
    
    this.setOwner = function(o) 
    {
        owner = o;
    };

    this.getIfacepos = function()
    {
        return ifacepos;
    };
    
    /*this.getAppController = function() 
    {
        var id = network.getPosForElement(owner);
        var result = "<input type='button' value='Request Info' onclick='requestDHCPInfoCommand(" + id + ");' />";
        return result;
    };*/

    this.getMenuEntries = function()
    {
        var data = [];
        data[0] = {};
        data[0].img = 'img/64/envelope-DHCP.png';
        data[0].text = 'Request DHCP info';
        data[0].js = 'requestDHCPInfoCommand('+owner.id+');';

        return data;
    };
};
