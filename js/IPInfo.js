function isValidIPv4(ipv4) 
{
    var result = false;
    if (ipv4 !== null) 
    {
        var parts = ipv4.split(".");
        if (parts.length === 4) 
        {
            var part1 = parseInt(parts[0]);
            var part2 = parseInt(parts[1]);
            var part3 = parseInt(parts[2]);
            var part4 = parseInt(parts[3]);
            
            result = (part1 !== NaN) && (part1 >= 0) && (part1 <= 255) && 
            (part2 !== NaN) && (part2 >= 0) && (part2 <= 255) && 
            (part3 !== NaN) && (part3 >= 0) && (part3 <= 255) && 
            (part4 !== NaN) && (part4 >= 0) && (part4 <= 255);
        }
    } 
    else 
    {
        result = true;
    }
    
    return result;
}
;

function ipStringToInt(ip) 
{
    var result = null;
    if (ip !== null) 
    {
        var parts = ip.split(".");
        
        result = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | (parts[3]);
    }
    
    return result;
}

function ipIntToString(ip) 
{
    result = null;
    
    if (ip !== null) 
    {
        var byte1 = ip & 0XFF;
        var byte2 = ip >> 8 & 0xFF;
        var byte3 = ip >> 16 & 0xFF;
        var byte4 = ip >> 24 & 0xFF;
        
        result = byte4 + "." + byte3 + "." + byte2 + "." + byte1;
    }
    
    return result;
}

var IPInfo = function() 
{
    var IPv4 = null;
    var DNS1 = null;
    var DNS2 = null;
    var netmask = null;
    var static = false;
    
    this.save = function() 
    {
        var result = {};
        result.IPv4 = static ? IPv4 : null;
        result.DNS1 = static ? DNS1 : null;
        result.DNS2 = static ? DNS2 : null;
        result.netmask = static ? netmask : null;
        result.static = static;
        
        return result;
    };
    
    this.load = function(data) 
    {
        if (data != null) 
        {
            IPv4 = data.IPv4;
            DNS1 = data.DNS1;
            DNS2 = data.DNS2;
            netmask = data.netmask;
            static = data.static;
        }
    };
    
    this.sameNetwork = function(ip) 
    {
        var result = false;
        if (isValidIPv4(ip)) 
        {
            //console.log("Is "+ip+" in my network "+ipIntToString(IPv4)+"?");
            var intip = ipStringToInt(ip);
            var testnetwork = intip & netmask;
            var thisnetwork = IPv4 & netmask;
            result = testnetwork === thisnetwork;
        }
        return result;
    };
    
    this.setIPv4 = function(ipv4) 
    {
        if (isValidIPv4(ipv4)) 
        {
            IPv4 = ipStringToInt(ipv4);
        }
    };
    
    this.setNetmask = function(mask) 
    {
        if (isValidIPv4(mask)) 
        {
            netmask = ipStringToInt(mask);
        }
    };
    
    this.setDNS1 = function(dns) 
    {
        if (isValidIPv4(dns)) 
        {
            DNS1 = ipStringToInt(dns);
        }
    };
    
    this.setDNS2 = function(dns) 
    {
        if (isValidIPv4(dns)) 
        {
            DNS2 = ipStringToInt(dns);
        }
    };
    
    this.setStatic = function(s) 
    {
        static = s;
    };
    
    this.getIPv4 = function() 
    {
        return ipIntToString(IPv4);
    };
    
    this.getDNS1 = function() 
    {
        return ipIntToString(DNS1);
    };
    
    this.getDNS2 = function() 
    {
        return ipIntToString(DNS2);
    };
    
    this.getNetmask = function() 
    {
        return ipIntToString(netmask);
    };
    
    this.getStatic = function() 
    {
        return static;
    };
};
