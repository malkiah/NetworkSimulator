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

var lastMessageId = 0;

function getNextMessageId()
{
    return ++lastMessageId;
}

var Message = function(type, origIP, dstIP, origMAC, dstMAC, origPort, dstPort, dat, img) 
{
    var originIP = origIP;
    var destinationIP = dstIP;
    var originMAC = origMAC;
    var destinationMAC = dstMAC;
    var origPort = origPort;
    var dstPort = dstPort;
    var data = dat;
    var image = img;
    var id = getNextMessageId();
    var type = type;
    
    this.getId = function() {
        return id;
    };
    
    this.getImage = function() {
        return image;
    };
    
    this.getOriginIP = function() {
        return originIP;
    };
    
    this.setOriginIP = function(ip) {
        originIP = ip;
    };
    
    this.getOriginMAC = function() {
        return originMAC;
    };
    
    this.setOriginMAC = function(mac) {
        originMAC = mac;
    };
    
    this.getDestinationIP = function() {
        return destinationIP;
    };
    
    this.setDestinationIP = function(ip) {
        destinationIP = ip;
    };
    
    this.getDestinationMAC = function() {
        return destinationMAC;
    };
    
    this.setDestinationMAC = function(mac) {
        destinationMAC = mac;
    };
    
    this.getOrigPort = function() {
        return origPort;
    };
    
    this.setOrigPort = function(port) {
        origPort = port;
    };
    
    this.getDstPort = function() {
        return dstPort;
    };
    
    this.setDstPort = function(port) {
        dstPort = port;
    };
    
    this.getData = function() {
        return data;
    };
    
    this.getType = function() 
    {
        return type;
    };

    this.getStrInfo = function()
    {
        var result = "Src: " + ((this.getOriginIP() === null)?"-":this.getOriginIP()) + "\n";
        result += "Dst: " + ((this.getDestinationIP() === null)?"-":this.getDestinationIP());
        if (data.description)
        {
            result += "\n";
            result += data.description;
        }

        return result;
    };
};
