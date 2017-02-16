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

function selectLinkConnectors(id1, id2) 
{
    createBkDiv();
    createLinkConnectorsDiv(id1, id2);
}

function getElementConnectorsSelectables(host) 
{
    var result = "";
    for (var i = 0; i < host.getConnectable().getConnectorNumber(); i++) 
    {
        var connector = host.getConnectable().getConnector(i);
        var disabledTxt = connector.isConnected() ? " disabled='disabled' " : "";
        result += "<input type='radio' name='link_host_" + host.id + "' value='" + i + "' id='link_host_" + host.id + "_" + i + "' " + disabledTxt + "/>";
        result += host.getConnectorDesc(i);
        result += "<br/>";
    }
    return result;
}

function createLinkConnectorsDiv(id1, id2) 
{
    var host1 = network.getElement(id1);
    var host2 = network.getElement(id2);
    /*var div = document.createElement("div");
    var l = window.innerWidth / 2 - 200;
    var t = window.innerHeight / 2 - 200;
    
    div.setAttribute('style', 'position:absolute;top:' + t + 'px;left:' + l + 'px;z-index:110;background-color:white;width:400px;height:400px;border-radius:10px;border:1px solid;padding:10px;text-align:center;');
    div.setAttribute('id', 'divlinkconnectors');*/
    var html = '<table style="font-size:0.8em;">';
    html += '<tr><th>'+host1.getName()+'</th><th>'+host2.getName()+'</th></tr>';
    html += '<tr>';
    html += '<td>';
    html += getElementConnectorsSelectables(host1);
    html += '</td>';
    html += '<td>';
    html += getElementConnectorsSelectables(host2);
    html += '</td>';
    html += '</tr>';
    html += '</table>';
    var controls = '<p>\
  <input type="button" id="upload" value="'+_("Save")+'" onclick="saveLinkConnectors(' + id1 + ',' + id2 + ');" />\
  <input type="button" id="cancel" value="'+_("Cancel")+'" onclick="cancelLinkConnectors();" />\
  </p>';
    /*div.innerHTML = html;
    document.body.appendChild(div);*/
    var w = new UIWindow('divlinkconnectors', 'Create Link', 400, 400, false, 1.0);
    w.setContent(html);
    w.setControls(controls);
    w.render();
}

function saveLinkConnectors(id1, id2) 
{
    var selected1 = document.querySelector('input[name="link_host_' + id1 + '"]:checked');
    var selected2 = document.querySelector('input[name="link_host_' + id2 + '"]:checked');
    if ((selected1 !== null) && (selected2 !== null)) 
    {
        var c1 = selected1.value;
        var c2 = selected2.value;
        if ((c1 !== null) && (c2 !== null)) 
        {
            network.createLink(id1, c1, id2, c2);
            uimanager.getWindow("divlinkconnectors").dispose();
            removeBodyDiv('divbk');
        }
    }
}

function cancelLinkConnectors() 
{
    uimanager.getWindow("divlinkconnectors").dispose();
    removeBodyDiv('divbk');
}

/*
- El link tiene un UILine asociado
- Cada vez que se mueve uno de los drawables se actualiza el UILine
- Dispose: borra el UILine
*/

var Link = function(c1, c2) 
{
    this.id = getNextID();
    var connector1 = c1;
    var connector2 = c2;
    var messages = [];
    var _self = this;
    var uiline = null;
    var menu = null;
    
    this.save = function() 
    {
        var result = {};
        result.version = 1;
        result.id = this.id;
        result.connector1 = connector1.id;
        result.connector2 = connector2.id;
        
        return result;
    };
    
    this.load = function(data) 
    {
        this.id = data.id;
    };
    
    function init() 
    {
        connector1.setLink(_self);
        connector2.setLink(_self);
        var vertices = getVertices();
        uiline = new UILine(null, null, _self, vertices.x1, vertices.y1, vertices.x2, vertices.y2, 0);
        uimanager.addClickable(uiline);
        connector1.getConnectable().getOwner().getDrawable().addObserver(_self);
        connector2.getConnectable().getOwner().getDrawable().addObserver(_self);
        menu = new UIMenu("Link", 0, 0, false);
        addStaticMenu();
        uimanager.addMenu(menu);
    }
    
    function addStaticMenu() 
    {
        menu.addEntry("img/64/delete.png", "Delete element", "deleteSelected();");
    }
    
    this.drawableChanged = function() 
    {
        var vertices = getVertices();
        uiline.setCoords(vertices.x1, vertices.y1, vertices.x2, vertices.y2, 0);
    }
    
    this.dispose = function() 
    {
        uimanager.removeClickable(uiline);
        connector1.getConnectable().getOwner().getDrawable().deleteObserver(_self);
        connector2.getConnectable().getOwner().getDrawable().deleteObserver(_self);
        if (menu.getVisible()) 
        {
            menu.hide();
        }
        uimanager.deleteMenu(menu);
    };
    
    this.getConnector1 = function() 
    {
        return connector1;
    };
    
    this.getConnector2 = function() 
    {
        return connector2;
    };
    
    this.delete = function() 
    {
        connector1.setLink(null);
        connector2.setLink(null);
    };
    
    this.addMessage = function(orig, message) {
        var data = {};
        data.pos = 0;
        data.message = message;
        data.orig = orig;
        data.dst = (orig === connector1) ? connector2 : connector1;
        messages.push(data);
    };
    
    function getMessageCoords(pos) 
    {
        var origX = messages[pos].orig.getConnectable().getOwner().getDrawable().getCenterX();
        var origY = messages[pos].orig.getConnectable().getOwner().getDrawable().getCenterY();
        var dstX = messages[pos].dst.getConnectable().getOwner().getDrawable().getCenterX();
        var dstY = messages[pos].dst.getConnectable().getOwner().getDrawable().getCenterY();
        var X = origX + (dstX - origX) * messages[pos].pos / 100;
        var Y = origY + (dstY - origY) * messages[pos].pos / 100;
        
        return {x: X,y: Y};
    }

    function drawMessageInfo(ctx, message)
    {
        var pos = 8;
        ctx.font = '8pt';
        ctx.fillStyle = "black";
        var parts = message.getStrInfo().split("\n");
        for (var i = 0; i < parts.length; i++) 
        {
            ctx.fillText(parts[i], 0, message.getImage().height + pos);
            pos += 8;
        }        
    }
    
    function drawMessages(ctx) 
    {
        for (var i = 0; i < messages.length; i++) 
        {
            var coords = getMessageCoords(i);
            ctx.save();
            ctx.translate(coords.x, coords.y);
            ctx.drawImage(messages[i].message.getImage(), 0, 0);
            drawMessageInfo(ctx,messages[i].message);
            ctx.restore();
        }
    }
    
    function getVertices() 
    {
        return {
            x1: connector1.getConnectable().getOwner().getDrawable().getCenterX(),
            y1: connector1.getConnectable().getOwner().getDrawable().getCenterY(),
            x2: connector2.getConnectable().getOwner().getDrawable().getCenterX(),
            y2: connector2.getConnectable().getOwner().getDrawable().getCenterY()
        };
    }
    
    /*function drawConnectorDescription(ctx, connector, x1, y1, x2, y2) 
    {
        var mod = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        var X = x1 + (x2 - x1) * 32 / mod;
        var Y = y1 + (y2 - y1) * 32 / mod;
        ctx.font = '8pt';
        ctx.fillStyle = "black";
        ctx.fillText(connector.getDescription(), X, Y);
    }*/
    
    this.draw = function(ctx, selected) 
    {
        var vertices = getVertices();
        ctx.lineWidth = 2;
        ctx.strokeStyle = selected ? "blue" : "red";
        ctx.beginPath();
        ctx.moveTo(vertices.x1, vertices.y1);
        ctx.lineTo(vertices.x2, vertices.y2);
        ctx.stroke();
        
        //drawConnectorDescription(ctx, connector1, vertices.x1, vertices.y1, vertices.x2, vertices.y2);
        //drawConnectorDescription(ctx, connector2, vertices.x2, vertices.y2, vertices.x1, vertices.y1);
        
        drawMessages(ctx);
    };
    
    this.update = function() 
    {
        var newmessages = [];
        for (var i = 0; i < messages.length; i++) 
        {
            messages[i].pos += AnimationControls.MSG_ADVANCE;
            if (messages[i].pos < 100) 
            {
                newmessages.push(messages[i]);
            } 
            else 
            {
                messages[i].dst.receive(messages[i].message);
            }
        }
        
        messages = newmessages;
    }
    
    this.messageHasCoords = function(pos, x, y) 
    {
        var coords = getMessageCoords(pos);
        
        return (coords.x <= x) && (x <= coords.x + messages[pos].message.getImage().width) && 
        (coords.y <= y) && (y <= coords.y + messages[pos].message.getImage().height);
    };
    
    this.getMessage = function(pos) 
    {
        return messages[pos].message;
    };
    
    this.getMessageCount = function() 
    {
        return messages.length;
    };
    
    this.hasCoords = function(x, y) 
    {
        var vertices = getVertices();
        
        return distToSegment({x: x,y: y}, {x: vertices.x1,y: vertices.y1}, {x: vertices.x2,y: vertices.y2}) < LINE_SELECT_TOLERANCE;
    };
    
    this.getCenter = function() 
    {
        var result = {};
        var vertices = getVertices();
        
        result.x = (vertices.x1 + vertices.x2) / 2.0;
        result.y = (vertices.y1 + vertices.y2) / 2.0;
        
        return result;
    };
    
    this.getMenu = function() 
    {
        return menu;
    };
    
    init();
};
