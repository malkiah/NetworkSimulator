function createDNSLookup(id) 
{
    createBkDiv();
    createDNSLookupDiv(id);
}

function createDNSLookupDiv(id) 
{
    var host = network.getElement(id);
    var app = host.getApp("DNSClient");
    var div = document.createElement("div");
    var l = document.body.clientWidth / 2 - 200;
    var t = document.body.clientHeight / 2 - 75;
    
    div.setAttribute('style', 'position:absolute;top:' + t + 'px;left:' + l + 'px;z-index:110;background-color:white;width:400px;height:150px;border-radius:10px;border:1px solid;padding:10px;text-align:center;');
    div.setAttribute('id', 'divdnslookup');
    div.innerHTML = app.getAppController();
    div.innerHTML += '<p>\
  <input type="button" id="upload" value="Lookup" onclick="requestDNSLookup(' + id + ');" />\
  <input type="button" id="cancel" value="Cancel" onclick="cancelDNSLookup();" />\
  </p>';
    document.body.appendChild(div);
}

function cancelDNSLookup() 
{
    removeBodyDiv('divdnslookup');
    removeBodyDiv('divbk');
}

function requestDNSLookup(id) 
{
    var elem = network.getElement(id);
    var domain = document.getElementById("dnsclientdomain").value;
    elem.getApp("DNSClient").DNSLookup(domain);
    removeBodyDiv('divdnslookup');
    removeBodyDiv('divbk');
}

var DNSClient = function(ifacepos) 
{
    var owner = null;
    var ifacepos = ifacepos;
    var localtable = [];
    
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
        return "DNSClient";
    };
    
    this.DNSLookup = function(domain) 
    {
        //var MAC = owner.getConnectable().getDstMAC(ifacepos, owner.getConnectable().getIPInfo(ifacepos).getDNS1());
        var MAC = owner.getConnectable().getDstMAC(owner.getConnectable().getIPInfo(ifacepos).getDNS1());
        if (MAC !== null) 
        {
            var data = {};
            data.domain = domain;
            data.type = "lookup";
            data.description = "Lookup: " + domain;
            var message = new Message(
            "tcp",
            owner.getConnectable().getIPInfo(ifacepos).getIPv4(), 
            owner.getConnectable().getIPInfo(ifacepos).getDNS1(), 
            owner.getConnectable().getMAC(ifacepos), 
            MAC, 
            getDinamycPort(), 
            53, 
            data, images[IMAGE_ENVELOPEDNS]
            );
            owner.getConnectable().getTrafficManager().registerApplication(this, message.getOrigPort(), false);
            owner.getConnectable().getConnector(ifacepos).send(message);
        }
    };
    
    this.receiveMessage = function(message) 
    {
        if (message.getData().ip !== null) 
        {
            localtable[message.getData().domain] = message.getData().ip;
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

    this.getIp = function(domain)
    {
        var result = null;
       
        if (domain in localtable)
        {
            result = localtable[domain];
        }

        return result;
    };
    
    this.getAppController = function() 
    {
        var id = network.getPosForElement(owner);
        var result = "<p> \
        <label for='dnsclientdomain' >Domain:</label> \
        <input type='text' id='dnsclientdomain' /> \
        </p>";
        return result;
    };
    
    this.getMenuEntries = function() 
    {
        var data = [];
        data[0] = {};
        data[0].img = 'img/64/envelope-DNS.png';
        data[0].text = 'DNS lookup';
        data[0].js = 'createDNSLookup(' + owner.id + ');';
        
        return data;
    };
};
