function editHTTPServerInfo(id) 
{
    createBkDiv();
    createHTTPServerInfoDiv1(id);
}

function createHTTPServerInfoDiv1(id) 
{
    var host = network.getElement(id);
    var app = host.getApp("HTTPServer");
    var div = document.createElement("div");
    var l = window.innerWidth / 2 - 200;
    var t = window.innerHeight / 2 - 200;
    
    var headers = ["Domain"];
    var data = app.getAppControllerData1();
    var uihttptable = new UITable(headers, data, 'httptable');
    uihttptable.setSecondary(true, "editDomainHTTPServerInfo");
    uihttptable.setParam("hostid", id);
    
    div.setAttribute('style', 'position:absolute;top:' + t + 'px;left:' + l + 'px;z-index:110;background-color:white;width:400px;height:400px;border-radius:10px;border:1px solid;padding:10px;text-align:center;overflow-y:scroll;');
    div.setAttribute('id', 'divhttpserverinfo');
    div.innerHTML = app.getAppController1();
    div.innerHTML += '<p>\
  <input type="button" id="upload" value="Save" onclick="saveHTTPServerData1(' + id + ',\'' + uihttptable.getId() + '\');" />\
  <input type="button" id="cancel" value="Cancel" onclick="cancelHTTPServerData1(\'' + uihttptable.getId() + '\');" />\
  </p>';
    document.body.appendChild(div);
    uihttptable.render();
}

function createHTTPServerInfoDiv1back(id, uitableid) 
{
    var host = network.getElement(id);
    var app = host.getApp("HTTPServer");
    var div = document.createElement("div");
    var l = document.body.clientWidth / 2 - 200;
    var t = document.body.clientHeight / 2 - 200;
    
    var primaryuitableid = uitables[uitableid].getParam("primaryuitableid");
    var headers = ["Domain"];
    var data = uitables[primaryuitableid].getData();
    var uihttptable = uitables[primaryuitableid];
    
    div.setAttribute('style', 'position:absolute;top:' + t + 'px;left:' + l + 'px;z-index:110;background-color:white;width:400px;height:400px;border-radius:10px;border:1px solid;padding:10px;text-align:center;overflow-y:scroll;');
    div.setAttribute('id', 'divhttpserverinfo');
    div.innerHTML = app.getAppController1();
    div.innerHTML += '<p>\
  <input type="button" id="upload" value="Save" onclick="saveHTTPServerData1(' + id + ',\'' + uihttptable.getId() + '\');" />\
  <input type="button" id="cancel" value="Cancel" onclick="cancelHTTPServerData1(\'' + uihttptable.getId() + '\');" />\
  </p>';
    document.body.appendChild(div);
    uihttptable.render();
}

function createHTTPServerInfoDiv2(id, primaryuitableid, filedata) 
{
    var host = network.getElement(id);
    var app = host.getApp("HTTPServer");
    var div = document.createElement("div");
    var l = document.body.clientWidth / 2 - 200;
    var t = document.body.clientHeight / 2 - 200;
    
    var headers = ["File"];
    var data = filedata;
    var uihttpfiletable = new UITable(headers, data, 'httpfiletable');
    uihttpfiletable.setSecondary(true, "editFileHTTPServerInfo");
    uihttpfiletable.setParam("hostid", id);
    uihttpfiletable.setParam("primaryuitableid", primaryuitableid);
    
    div.setAttribute('style', 'position:absolute;top:' + t + 'px;left:' + l + 'px;z-index:110;background-color:white;width:400px;height:400px;border-radius:10px;border:1px solid;padding:10px;text-align:center;overflow-y:scroll;');
    div.setAttribute('id', 'divhttpfileserverinfo');
    div.innerHTML = app.getAppController2();
    div.innerHTML += '<p>\
  <input type="button" id="upload" value="Back" onclick="backHTTPServerData2(' + id + ',\'' + uihttpfiletable.getId() + '\');" />\
  </p>';
    document.body.appendChild(div);
    uihttpfiletable.render();
}

function createHTTPServerInfoDiv3(id, secondarytableid, row) 
{
    var secondarydata = uitables[secondarytableid].getData();
    var contents = secondarydata[row][1];
    var host = network.getElement(id);
    var app = host.getApp("HTTPServer");
    var div = document.createElement("div");
    var l = document.body.clientWidth / 2 - 200;
    var t = document.body.clientHeight / 2 - 75;
    
    div.setAttribute('style', 'position:absolute;top:' + t + 'px;left:' + l + 'px;z-index:110;background-color:white;width:400px;height:150px;border-radius:10px;border:1px solid;padding:10px;text-align:center;');
    div.setAttribute('id', 'divhttpcontentsserverinfo');
    div.innerHTML = app.getAppController3(contents);
    div.innerHTML += '<p>\
  <input type="button" id="upload" value="Back" onclick="backHTTPServerData3(' + id + ',\'' + secondarytableid + '\',' + row + ');" />\
  </p>';
    document.body.appendChild(div);
}

function backHTTPServerData3(id, secondarytableid, row) 
{
    var secondarydata = uitables[secondarytableid].getData();
    var contents = document.getElementById("httpcontents").value;
    secondarydata[row][1] = contents;
    removeBodyDiv('divhttpcontentsserverinfo');
    var primaryuitableid = uitables[secondarytableid].getParam("primaryuitableid");
    createHTTPServerInfoDiv2(id, primaryuitableid, secondarydata);
}

function editFileHTTPServerInfo(secondarytableid, row) 
{
    var id = uitables[secondarytableid].getParam("hostid");
    var secondarydata = uitables[secondarytableid].getData();
    if (secondarydata[row].length == 1) 
    {
        secondarydata[row][1] = "";
    }
    removeBodyDiv('divhttpfileserverinfo');
    createHTTPServerInfoDiv3(id, secondarytableid, row);
}

function editDomainHTTPServerInfo(primaryuitableid, row) 
{
    var id = uitables[primaryuitableid].getParam("hostid");
    var primarydata = uitables[primaryuitableid].getData();
    if (primarydata[row].length == 1) 
    {
        primarydata[row][1] = [];
    }
    var filedata = primarydata[row][1];
    removeBodyDiv('divhttpserverinfo');
    createHTTPServerInfoDiv2(id, primaryuitableid, filedata);
}

function backHTTPServerData2(id, uitableid) 
{
    removeBodyDiv('divhttpfileserverinfo');
    createHTTPServerInfoDiv1back(id, uitableid);
}

function saveHTTPServerData1(id, uitableid) 
{
    var data = uitables[uitableid].getData();
    var host = network.getElement(id);
    var app = host.getApp("HTTPServer");
    app.resetHTTPServerInfo();
    for (var i = 0; i < data.length; i++) 
    {
        var domain = data[i][0];
        app.addDomain(domain);
        if (data[i].length > 1) 
        {
            for (var j = 0; j < data[i][1].length; j++) 
            {
                var filename = data[i][1][j][0];
                if (data[i][1][j].length === 1) 
                {
                    data[i][1][j][1] = "";
                }
                var contents = data[i][1][j][1];
                app.setFileContents(domain, filename, contents);
            }
        }
    }
    
    removeBodyDiv('divhttpserverinfo');
    removeBodyDiv('divbk');
    uitables[uitableid].dispose();
}

function cancelHTTPServerData1(uitableid) 
{
    removeBodyDiv('divhttpserverinfo');
    removeBodyDiv('divbk');
    uitables[uitableid].dispose();
}

/*
- Domains
  - Files
*/
var HTTPServer = function(ifacepos) 
{
    var owner = null;
    var ifacepos = ifacepos;
    var domains = [];
    
    this.save = function() 
    {
        var result = {};
        result.version = 1;
        result.id = this.getId();
        result.ifacepos = ifacepos;
        
        result.domains = [];
        for (domain in domains) 
        {
            var domaindata = {};
            domaindata.domain = domain;
            domaindata.files = [];
            for (filename in domains[domain]) 
            {
                var filedata = {};
                filedata.filename = filename;
                filedata.contents = domains[domain][filename];
                domaindata.files.push(filedata);
            }
            result.domains.push(domaindata);
        }
        
        return result;
    };
    
    this.load = function(data) 
    {
        for (var i = 0; i < data.domains.length; i++) 
        {
            var domain = data.domains[i].domain;
            this.addDomain(domain);
            for (var j = 0; j < data.domains[i].files.length; j++) 
            {
                var filename = data.domains[i].files[j].filename;
                var contents = data.domains[i].files[j].contents;
                this.setFileContents(domain, filename, contents);
            }
        }
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
        return "HTTPServer";
    };
    
    this.addDomain = function(domain) 
    {
        if (!(domain in domains)) 
        {
            domains[domain] = [];
        }
    }
    
    this.deleteDomain = function(domain) 
    {
        if (domain in domains) 
        {
            delete domains[domain];
        }
    }
    
    this.setFileContents = function(domain, filename, contents) 
    {
        if (domain in domains) 
        {
            domains[domain][filename] = contents;
        }
    };
    
    this.deleteFile = function(domain, filename) 
    {
        if (domain in domains) 
        {
            if (file in domains[domain]) 
            {
                delete domains[domain][filename];
            }
        }
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
        data[0].text = 'Edit HTTP server info';
        data[0].js = 'editHTTPServerInfo(' + owner.id + ');';
        
        return data;
    };
    
    this.getAppController1 = function() 
    {
        result = "<table id='httptable' style='font-size:0.8em;'></table>";
        return result;
    };
    
    this.getAppController2 = function() 
    {
        result = "<table id='httpfiletable' style='font-size:0.8em;'></table>";
        return result;
    };
    
    this.getAppController3 = function(contents) 
    {
        result = "<textarea id='httpcontents' style='font-size:0.8em;width:100%;height:100px;'>";
        result += contents;
        result += "</textarea>";
        return result;
    };
    
    this.getAppControllerData1 = function() 
    {
        var result = [];
        
        for (var domain in domains) 
        {
            var data = [];
            data.push(domain);
            var files = [];
            for (var filename in domains[domain]) 
            {
                var fileinfo = [];
                fileinfo[0] = filename;
                fileinfo[1] = domains[domain][filename];
                files.push(fileinfo);
            }
            data.push(files);
            result.push(data);
        }
        
        return result;
    };
    
    this.receiveMessage = function(message) 
    {
        var data = message.getData();
        var domain = data.domain;
        var filename = data.filename;
        var ip = data.ip;
        var code = null;
        var contents = null;
        
        if (domain in domains) 
        {
            if (filename in domains[domain]) 
            {
                code = 200;
                contents = domains[domain][filename];
            } 
            else 
            {
                code = 404;
                contents = "";
            }
        } 
        else 
        {
            if (isValidIPv4(domain)) 
            {
                // Default: 1st domain
                var domainKeys = Object.keys(domains);
                if ((domainKeys.length > 0) && (filename in domains[domainKeys[0]]))
                {
                    code = 200;
                    contents = domains[domainKeys[0]][filename];
                } 
                else 
                {
                    code = 404;
                    contents = "";
                }
            }
            else
            {
                code = 404;
                contents = "";
            }
        }
        var responsedata = {};
        responsedata.code = code;
        responsedata.contents = contents;
        responsedata.description = code + "-"+filename;
        var response = new Message(
        "tcp",
        owner.getConnectable().getIPInfo(ifacepos).getIPv4(), 
        message.getOriginIP(), 
        owner.getConnectable().getMAC(ifacepos), 
        owner.getConnectable().getDstMAC(message.getOriginIP()),  //message.getOriginMAC(), 
        80, 
        message.getOrigPort(), 
        responsedata, 
        images[IMAGE_ENVELOPEHTTP]
        );
        owner.getConnectable().getConnector(ifacepos).send(response);
    };
};
