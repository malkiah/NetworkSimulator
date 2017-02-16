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

function deleteSelected() 
{
    if ((network.getSelected() !== null) && (network.getSelected() instanceof Host)) 
    {
        if (confirm("Do you really want to delete the selected element?")) 
        {
            network.deleteSelectedElement();
            uimanager.selectedElementDeleted();
        }
    } 
    else if ((network.getSelected() !== null) && (network.getSelected() instanceof Link)) 
    {
        if (confirm("Do you really want to delete the selected link?")) 
        {
            network.deleteSelectedLink();
            uimanager.selectedLineDeleted();
        }
    }
}

var Network = function(imgs, context, w, h) 
{
    var elements = [];
    var links = [];
    var images = imgs;
    var ctx = context;
    var _self = this;
    var W = w;
    var H = h;
    var selected = null;
    
    this.init = function() 
    {
        setInterval(render, REFRESH_INTERVAL);
    };
    
    this.getImages = function() 
    {
        return images;
    };
    
    this.createComputer = function(x, y) 
    {
        c = new Host("computer", 1);
        c.getDrawable().setPosition(x, y);
        c.getDrawable().setImage(images[IMAGE_COMPUTER]);
        
        var dhcpClient = new DHCPClient(0);
        c.addApp(dhcpClient, -1, false);
        
        var dnsClient = new DNSClient(0);
        c.addApp(dnsClient, -1, false);
        
        var httpClient = new HTTPClient(0);
        c.addApp(httpClient, -1, false);
        
        elements[c.id] = c;
        
        return c.id;
    };
    
    this.createDHCPServer = function(x, y) 
    {
        c = new Host("dhcpserver", 1);
        c.getDrawable().setPosition(x, y);
        c.getDrawable().setImage(images[IMAGE_SERVERDHCP]);
        var dhcpServer = new DHCPServer(0);
        c.addApp(dhcpServer, 67, true);
        elements[c.id] = c;
        
        return c.id;
    };
    
    this.createDNSServer = function(x, y) 
    {
        c = new Host("dnsserver", 1);
        c.getDrawable().setPosition(x, y);
        c.getDrawable().setImage(images[IMAGE_SERVERDNS]);
        var dnsServer = new DNSServer(0);
        c.addApp(dnsServer, 53, true);
        elements[c.id] = c;
        
        return c.id;
    };
    
    this.createHTTPServer = function(x, y) 
    {
        c = new Host("httpserver", 1);
        c.getDrawable().setPosition(x, y);
        c.getDrawable().setImage(images[IMAGE_SERVERWEB]);
        var httpServer = new HTTPServer(0);
        c.addApp(httpServer, 80, true);
        elements[c.id] = c;
        
        return c.id;
    };
    
    this.createSwitch = function(x, y, ports) 
    {
        s = new Host("switch", ports);
        s.getDrawable().setPosition(x, y);
        s.getDrawable().setImage(images[IMAGE_SWITCH]);
        elements[s.id] = s;
        
        return s.id;
    };
    
    this.createRouter = function(x, y) 
    {
        r = new Host("router", 2);
        r.getDrawable().setPosition(x, y);
        r.getDrawable().setImage(images[IMAGE_ROUTER]);
        elements[r.id] = r;
        
        return r.id;
    };
    
    this.createLink = function(e1, c1, e2, c2) 
    {
        var element1 = elements[e1];
        var element2 = elements[e2];
        
        var connector1 = element1.getConnectable().getConnector(c1);
        var connector2 = element2.getConnectable().getConnector(c2);
        var success = false;
        
        if ((connector1 !== null) && (connector2 !== null)) 
        {
            var link = new Link(connector1, connector2);
            links.push(link);
            success = links.length;
        }
        
        return success;
    };
    
    this.getElement = function(id) 
    {
        var result = null;
        
        result = elements[id];
        
        return result;
    };
    
    this.getLink = function(pos) 
    {
        var result = null;
        
        if (pos < links.length) 
        {
            result = links[pos];
        }
        
        return result;
    };
    
    function countUntilDestination(connector, dstIP, dstMAC, visited) 
    {
        var result = -1;
        // Si el conector no tiene link, devolvemos -1
        if (connector.isConnected()) 
        {
            // Si el conector tiene link, cogemos el conectable del otro extremo
            var c = connector.getConnectedConnector().getConnectable();
            // Si no lo hemos visitado
            if (visited.indexOf(c) === -1) 
            {
                // Si tiene la dirección, devolvemos 0
                if (c.compatibleIP(dstIP, false) || c.compatibleMAC(dstMAC, false)) 
                {
                    result = 0;
                } 
                else 
                {
                    // Si no, contamos hasta el destino en cada uno de sus conectores
                    var min = 100000;
                    for (var i = 0; i < c.getConnectorNumber(); i++) 
                    {
                        visited.push(c);
                        var num = countUntilDestination(c.getConnector(i), dstIP, dstMAC, visited);
                        num = (num === -1) ? -1 : num + 1;
                        if ((num !== -1) && (num < min)) 
                        {
                            result = c.getConnector(i);
                            min = num;
                        }
                    }
                    
                    if (min !== 100000) 
                    {
                        result = min;
                    }
                }
            }
        }
        
        return result;
    }
    
    this.findNextConnectorInPath = function(currentConnectable, dstIP, dstMAC) 
    {
        // Por cada uno de los conectores del conectable, contamos cuántos pasos hay desde cada uno
        var result = null;
        var min = 100000;
        for (var i = 0; i < currentConnectable.getConnectorNumber(); i++) 
        {
            var visited = [];
            visited.push(currentConnectable);
            var num = countUntilDestination(currentConnectable.getConnector(i), dstIP, dstMAC, visited);
            num = (num === -1) ? -1 : num + 1;
            if ((num !== -1) && (num < min)) 
            {
                result = currentConnectable.getConnector(i);
                min = num;
            }
        }
        
        return result;
    };
    
    this.getElementInCoords = function(x, y) 
    {
        var result = null;
        var i = 0;
        var keys = Object.keys(elements);
        while ((result === null) && (i < keys.length)) 
        {
            if (elements[keys[i]].getDrawable().hasCoords(x, y)) 
            {
                result = elements[keys[i]];
            } 
            else 
            {
                i++;
            }
        }
        
        return result;
    };
    
    this.getMessageInCoords = function(x, y) 
    {
        var result = null;
        var i = 0;
        
        while ((result === null) && (i < links.length)) 
        {
            var messagecount = links[i].getMessageCount();
            var j = 0;
            while ((result === null) && (j < messagecount)) 
            {
                if (links[i].messageHasCoords(j, x, y)) 
                {
                    result = links[i].getMessage(j);
                } 
                else 
                {
                    j++;
                }
            }
            if (result === null) 
            {
                i++;
            }
        }
        
        return result;
    };
    
    this.getPosForElement = function(elem) 
    {
        return elements.indexOf(elem);
    };
    
    this.getLinkInCoords = function(x, y) 
    {
        var result = null;
        var i = 0;
        
        while ((result === null) && (i < links.length)) 
        {
            if (links[i].hasCoords(x, y)) 
            {
                result = links[i];
            } 
            else 
            {
                i++;
            }
        }
        
        return result;
    };
    
    this.setSelected = function(s) 
    {
        selected = s;
    };
    
    this.getSelected = function() 
    {
        return selected;
    };
    
    function deleteLink(link) 
    {
        link.getConnector1().setLink(null);
        link.getConnector2().setLink(null);
        var pos = links.indexOf(link);
        links.splice(pos, 1);
        link.dispose();
    }
    
    function deleteElement(element) 
    {
        var num = selected.getConnectable().getConnectorNumber();
        for (var i = 0; i < num; i++) 
        {
            var connector = selected.getConnectable().getConnector(i);
            if (connector.getLink() !== null) 
            {
                deleteLink(connector.getLink());
            }
        }
        var pos = elements.indexOf(element);
        //elements.splice(pos, 1);
        delete elements[pos];
    }
    
    this.deleteSelectedLink = function() 
    {
        deleteLink(selected);
        selected = null;
    };
    
    this.deleteSelectedElement = function() 
    {
        deleteElement(selected);
        selected.dispose();
        selected = null;
    };
    
    function renderGroups(ctx) 
    {
        var groups = [];
        var keys = Object.keys(elements);
        for (var i = 0; i < keys.length; i++) 
        {
            var host = elements[keys[i]];
            if (host.getGroup() !== null) 
            {
                if (!(host.getGroup() in groups)) 
                {
                    var data = {};
                    data.minx = 1000000;
                    data.miny = 1000000;
                    data.maxx = 0;
                    data.maxy = 0;
                    
                    groups[host.getGroup()] = data;
                }
                var data = groups[host.getGroup()];
                var rect = host.getDrawable().getRect();
                if (data.minx > rect.x) 
                {
                    data.minx = rect.x;
                }
                if (data.miny > rect.y) 
                {
                    data.miny = rect.y;
                }
                if (data.maxx < rect.x + rect.width) 
                {
                    data.maxx = rect.x + rect.width;
                }
                if (data.maxy < rect.y + rect.height) 
                {
                    data.maxy = rect.y + rect.height;
                }
            }
        }
        
        keys = Object.keys(groups);
        for (var i = 0; i < keys.length; i++) 
        {
            var data = groups[keys[i]];
            ctx.strokeStyle = "rgba(255,255,255,0.5)";
            ctx.lineWidth = 4;
            ctx.strokeRect(data.minx - 10, data.miny - 10, data.maxx - data.minx + 20, data.maxy - data.miny + 20);
            ctx.font = '16pt';
            ctx.fillStyle = "rgba(255,255,255,1.0)";
            ctx.fillText(keys[i], data.minx, data.maxy + 20);
        }
    }
    
    function render() 
    {
        ctx.fillStyle = "#DDDDDD";
        ctx.fillRect(0, 0, W, H);
        
        for (var i = 0; i < links.length; i++) 
        {
            links[i].update();
            links[i].draw(ctx, selected === links[i]);
        }
        
        var keys = Object.keys(elements);
        for (var i = 0; i < keys.length; i++) 
        {
            elements[keys[i]].getDrawable().draw(ctx);
        }
        
        renderGroups(ctx);
        
        uimanager.render(ctx);
    }
    
    this.save = function() 
    {
        var result = {};
        result.version = 1;
        result.lastusedid = lastusedid;
        result.elements = [];
        result.links = [];
        
        var keys = Object.keys(elements);
        for (var i = 0; i < keys.length; i++) 
        {
            result.elements.push(elements[keys[i]].save());
        }
        
        for (var i = 0; i < links.length; i++) 
        {
            result.links.push(links[i].save());
        }
        
        return JSON.stringify(result);
    };
    
    this.load = function(data) 
    {
        uimanager.reset();
        switch (data.version) 
        {
            case 1:
                loadv1(data);
                break;
        }
        ;
    };
    
    function loadv1(data) 
    {
        links = [];
        elements = [];
        
        for (var i = 0; i < data.elements.length; i++) 
        {
            var element = null;
            var ports = 1;
            if (data.elements[i].ports) 
            {
                ports = data.elements[i].ports;
            } 
            else if (data.elements[i].type === "router") 
            {
                ports = 2;
            }
            element = new Host(data.elements[i].type, ports);
            element.load(data.elements[i]);
            elements[element.id] = element;
        }
        
        for (var i = 0; i < data.links.length; i++) 
        {
            var c1 = _self.findConnector(data.links[i].connector1);
            var c2 = _self.findConnector(data.links[i].connector2);
            var link = new Link(c1, c2);
            link.load(data.links[i]);
            links.push(link);
        }
        
        lastusedid = data.lastusedid;
    }
    
    this.findConnector = function(id) 
    {
        var keys = Object.keys(elements);
        var result = null;
        var i = 0;
        while ((result === null) && (i < keys.length)) 
        {
            result = elements[keys[i]].getConnectable().findConnector(id);
            i++;
        }
        
        return result;
    };
};
