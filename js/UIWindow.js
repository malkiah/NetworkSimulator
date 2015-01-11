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

var UIWindow = function(windowid, contentid, controlsid, title, w, h, scrollable, opacity) 
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
    var contentid = contentid;
    var controlsid = controlsid;
    var outerdiv = null;
    var titlediv = null;
    var contentDiv = null;
    var controlsDiv = null;
    
    var click_offset_x = 0;
    var click_offset_y = 0;
    var move_X = 0;
    var move_Y = 0;
    
    function windowMouseDownEvent(event)
    {
        var bbox = titlediv.getBoundingClientRect();
        //var evt_x = event.clientX - bbox.left * (titlediv.width / bbox.width);
        //var evt_y = event.clientY - bbox.top * (titlediv.height / bbox.height);
        var evt_x = event.clientX;
        var evt_y = event.clientY;
        
        dispatchEvent(evt_x, evt_y, ACTION_MOUSE_DOWN);
    }
    
    function windowMouseUpEvent(e) 
    {
        dispatchEvent(-1, -1, ACTION_MOUSE_UP);
    }
    
    function windowMouseMoveEvent(e)
    {
        var bbox = titlediv.getBoundingClientRect();
        //var evt_x = event.clientX - bbox.left * (titlediv.width / bbox.width);
        //var evt_y = event.clientY - bbox.top * (titlediv.height / bbox.height);
        var evt_x = event.clientX;
        var evt_y = event.clientY;
        
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
                        x = evt_x;
                        y = evt_y;
                        outerdiv.setAttribute('style', getOuterStyle());
                        break;
                }
                break;
            case STATE_MOUSE_UP:
                switch (action) 
                {
                    case ACTION_MOUSE_DOWN:
                        click_offset_x = evt_x;
                        click_offset_y = evt_y;
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
        titlediv.setAttribute('style', 'width:100%;height:20px;background-color:blue;color:white;font-weight:bold;');
        titlediv.innerHTML = title;
        
        contentDiv = document.createElement("div");
        contentDiv.setAttribute('id', contentid);
        contentDiv.setAttribute('style', 'width:100%; height:' + h - 80 + 'px;')
        
        controlsDiv = document.createElement("div");
        controlsDiv.setAttribute('id', controlsid);
        controlsDiv.setAttribute('style', 'width:100%; height:40px;')
        
        //var bkdiv = document.getElementById('divbk');
        titlediv.addEventListener("mousedown", windowMouseDownEvent, false);
        titlediv.addEventListener("mouseup", windowMouseUpEvent, false);
        titlediv.addEventListener("mousemove", windowMouseMoveEvent, false);
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
    
    init();
};
