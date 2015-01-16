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

var UIWindow = function(windowid, title, w, h, scrollable, opacity) 
{
    var STATE_MOUSE_DOWN = 0;
    var STATE_MOUSE_UP = 1;
    var state = STATE_MOUSE_UP;
    
    var ACTION_MOUSE_DOWN = 0;
    var ACTION_MOUSE_UP = 1;
    var ACTION_MOUSE_MOVE = 2;
    
    var title = title;
    var w = w;
    var h = h;
    var x = window.innerWidth / 2 - w / 2;
    var y = window.innerHeight / 2 - h / 2;
    var opacity = opacity;
    var scrollable = scrollable;
    var windowid = windowid;
    var contentid = contentid + "_contents";
    var controlsid = controlsid + "_controls";
    var outerdiv = null;
    var titlediv = null;
    var contentDiv = null;
    var controlsDiv = null;
    
    var click_offset_x = 0;
    var click_offset_y = 0;
    var move_X = 0;
    var move_Y = 0;

    var _self = this;
    
    function windowMouseDownEvent(e)
    {
        var bbox = titlediv.getBoundingClientRect();
        var evt_x = e.clientX;
        var evt_y = e.clientY;
        
        if ((bbox.left <= evt_x) && (evt_x <= (bbox.left + bbox.width))
            && (bbox.top <= evt_y) && (evt_y <= (bbox.top + bbox.height)))
        {
            dispatchEvent(evt_x, evt_y, ACTION_MOUSE_DOWN);            
        }
    }
    
    function windowMouseUpEvent(e) 
    {
        dispatchEvent(-1, -1, ACTION_MOUSE_UP);
    }
    
    function windowMouseMoveEvent(e)
    {
        var evt_x = e.clientX;
        var evt_y = e.clientY;
        
        dispatchEvent(evt_x, evt_y, ACTION_MOUSE_MOVE);
    }
    
    function dispatchEvent(evt_x, evt_y, action) 
    {
        switch (state)
        {
            case STATE_MOUSE_DOWN:
                switch (action) 
                {
                    case ACTION_MOUSE_UP:
                        state = STATE_MOUSE_UP;
                        break;
                    case ACTION_MOUSE_MOVE:
                        x = evt_x - click_offset_x + scrollX;
                        y = evt_y - click_offset_y + scrollY;
                        outerdiv.setAttribute('style', getOuterStyle());
                        break;
                }
                break;
            case STATE_MOUSE_UP:
                switch (action) 
                {
                    case ACTION_MOUSE_DOWN:
                        var bbox = titlediv.getBoundingClientRect();
                        click_offset_x = evt_x - bbox.left;
                        click_offset_y = evt_y - bbox.top;
                        state = STATE_MOUSE_DOWN;
                        break;
                }
                break;
        }
    }
    
    function getOuterStyle()
    {
        return 'position:absolute;top:' + y + 'px;left:' + x + 'px;z-index:110;background-color:white;width:' + w + 'px;height:' + h + 'px;border-radius:10px;border:1px solid;padding:10px;text-align:center;opacity:' + opacity + ';';
    }

    function init() 
    {
        outerdiv = document.createElement("div");
        outerdiv.setAttribute('id', windowid);
        outerdiv.setAttribute('style', getOuterStyle());
        
        titlediv = document.createElement("div");
        titlediv.setAttribute('id', windowid + "_title");
        titlediv.setAttribute('style', 'width:100%;height:20px;background-color:blue;color:white;font-weight:bold;-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;');
        titlediv.innerHTML = title;
        
        contentDiv = document.createElement("div");
        contentDiv.setAttribute('id', contentid);
        contentDiv.setAttribute('style', 'width:100%; height:' + h - 80 + 'px;')
        
        controlsDiv = document.createElement("div");
        controlsDiv.setAttribute('id', controlsid);
        controlsDiv.setAttribute('style', 'width:100%; height:40px;')
        
        //var bkdiv = document.getElementById('divbk');
        window.addEventListener("mousedown", windowMouseDownEvent, true);
        window.addEventListener("mouseup", windowMouseUpEvent, true);
        window.addEventListener("mousemove", windowMouseMoveEvent, true);

        uimanager.addWindow(_self);
    }
    
    this.render = function() 
    {
        outerdiv.appendChild(titlediv);
        outerdiv.appendChild(contentDiv);
        outerdiv.appendChild(controlsDiv);
        
        document.body.appendChild(outerdiv);
    };
    
    this.setControls = function(controls) 
    {
        controlsDiv.innerHTML = controls;
    };
    
    this.setContent = function(content) 
    {
        contentDiv.innerHTML = content;
    };

    this.dispose = function()
    {
        window.removeEventListener("mousedown", windowMouseDownEvent);
        window.removeEventListener("mouseup", windowMouseUpEvent);
        window.removeEventListener("mousemove", windowMouseMoveEvent);
        uimanager.removeWindow(this);
        removeBodyDiv(windowid);
    };

    this.getId = function()
    {
        return windowid;
    };

    this.getPos = function()
    {
        return {x: x, y: y};
    };

    this.setPos = function(nx, ny)
    {
        x = nx;
        y = ny;
        outerdiv.setAttribute('style', getOuterStyle());
    };
    
    init();
};
