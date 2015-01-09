function viewWebBrowser(id) 
{
    createBkDiv();
    
    var host = network.getElement(id);
    var app = host.getApp("HTTPClient");
    var div = document.createElement("div");
    var l = window.innerWidth / 2 - 200;
    var t = window.innerHeight / 2 - 200;
    
    div.setAttribute('style', 'position:absolute;top:' + t + 'px;left:' + l + 'px;z-index:110;background-color:white;width:400px;height:400px;border-radius:10px;border:1px solid;padding:10px;text-align:center;opacity:0.5;');
    div.setAttribute('id', 'divhttpclient');
    div.innerHTML = app.getAppController();
    div.innerHTML += '<p>\
  <input type="button" id="close" value="Close" onclick="closeWebBrowser();" />\
  </p>';
    document.body.appendChild(div);
}

function closeWebBrowser() 
{
    removeBodyDiv('divhttpclient');
    removeBodyDiv('divbk');
}

function requestHTTPWebSite(id) 
{
    var host = network.getElement(id);
    var app = host.getApp("HTTPClient");
    var url = document.getElementById("httpclienturl").value;
    app.requestHTTPWebSite(url);
}

var HTTPClient = function(ifacepos) 
{
    var owner = null;
    var ifacepos = ifacepos;
    var lastCode = null;
    var lastContent = null;
    var lastURL = null;
    var _self = this;
    
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
    
    this.setOwner = function(c_owner) 
    {
        owner = c_owner;
    };
    
    this.getOwner = function() 
    {
        return owner;
    };
    
    this.getIfacepos = function() 
    {
        return ifacepos;
    };
    
    this.getId = function() 
    {
        return "HTTPClient";
    };
    
    this.resetHTTPServerInfo = function() 
    {
        domains = [];
    };
    
    this.getMenuEntries = function() 
    {
        var data = [];
        
        data[0] = {};
        data[0].img = 'img/64/envelope-HTTP.png';
        data[0].text = 'Web browser (HTTP client)';
        data[0].js = 'viewWebBrowser(' + owner.id + ');';
        
        return data;
    };
    
    this.getBrowserContents = function() 
    {
        var result = "";
        switch (lastCode) 
        {
            case 0:
                result = "Loading...";
                break;
            case 404:
                result = "404 - Not found";
                break;
            case 200:
                result = lastContent;
                break;
            case 997:
                result = "Malformed URL.\n\nUse only 'domain_or_ip/filename.html'.";
                break;
            case 998:
                result = "DNS client not present.";
                break;
            case 999:
                result = "Domain not in local DNS cache. Look up first.\n\nIf you already performed a lookup, the domain does not exist.";
                break;
        }
        
        result = result.replace(/\n/g, '<br/>');
        
        return result;
    };
    
    function updateBrowser() 
    {
        var browsercontents = document.getElementById("httpbrowsercontents");
        if (browsercontents !== null) 
        {
            browsercontents.innerHTML = _self.getBrowserContents();
        }
    }
    
    this.getAppController = function() 
    {
        result = "<p>";
        result += "<input type='text' id='httpclienturl' style='width:80%;' value='"+((lastURL !== null)?lastURL:"")+"' /> ";
        result += "<a href='#' onclick='requestHTTPWebSite(\"" + owner.id + "\");'>";
        result += "<img src='img/64/right-arrow.png' style='height:1em;' />";
        result += "</a>";
        result += "</p>";
        result += "<div id='httpbrowsercontents' style='font-style:italic;overflow:scroll;text-align:left;min-height:300px;'>";
        result += this.getBrowserContents();
        result += "</div>";
        return result;
    };
    
    function performHTTPRequest(domain, ip, filename) 
    {
        lastCode = 0;
        updateBrowser();
        var MAC = owner.getConnectable().getDstMAC(ip);
        if (MAC !== null) 
        {
            var data = {};
            data.domain = domain;
            data.filename = filename;
            data.ip = ip;
            data.description = "GET: " + filename;
            var message = new Message(
            "tcp",
            owner.getConnectable().getIPInfo(ifacepos).getIPv4(), 
            ip, 
            owner.getConnectable().getMAC(ifacepos), 
            MAC, 
            getDinamycPort(), 
            80, 
            data, images[IMAGE_ENVELOPEHTTP]
            );
            owner.getConnectable().getTrafficManager().registerApplication(_self, message.getOrigPort(), false);
            owner.getConnectable().getConnector(ifacepos).send(message);
        }
    }
    
    this.requestHTTPWebSite = function(url) 
    {
        var url = document.getElementById("httpclienturl").value;
        lastURL = url;
        var urlparts = url.split("/", 2);
        if (urlparts.length === 2) 
        {
            var ip = null;
            var domain = urlparts[0];
            if (isValidIPv4(domain)) 
            {
                ip = urlparts[0];
                performHTTPRequest(ip, ip, urlparts[1]);
            } 
            else 
            {
                var dnsclientapp = owner.getApp("DNSClient");
                if (dnsclientapp === null) 
                {
                    lastCode = 998;
                    updateBrowser();
                } 
                else 
                {
                    var ip = dnsclientapp.getIp(domain);
                    if (ip === null) 
                    {
                        lastCode = 999;
                        updateBrowser();
                    } 
                    else 
                    {
                        performHTTPRequest(domain, ip, urlparts[1]);
                    }
                }
            }
        } 
        else 
        {
            lastCode = 997;
            updateBrowser();
        }
    };

    this.receiveMessage = function(message) 
    {
        lastCode = message.getData().code;
        lastContent = message.getData().contents;
        updateBrowser();
    };
};
