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
