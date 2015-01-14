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

function createLinkAction() 
{
    uimanager.createLinkAction();
}

function createBkDiv() 
{
    var div = document.createElement("div");
    var w = document.body.scrollWidth;
    var h = document.body.scrollHeight;
    div.setAttribute('style', 'position:absolute;top:0;left:0;z-index:100;background-color:white;width:' + w + 'px;height:' + h + 'px;opacity:0.25;');
    div.setAttribute('id', 'divbk');
    document.body.appendChild(div);
}

function saveNetwork() 
{
    var download = document.createElement("a");
    download.setAttribute('href', 'data:text/plain;charset:utf-8,' + encodeURIComponent(network.save()));
    download.setAttribute('download', 'network.json');
    document.body.appendChild(download);
    download.click();
    document.body.removeChild(download);
}

function removeBodyDiv(name) 
{
    var div = document.getElementById(name);
    document.body.removeChild(div);
}

function cancelUpload() 
{
    removeBodyDiv('divupload');
    removeBodyDiv('divbk');
}

function confirmUpload() 
{
    var fileinput = document.getElementById('uploaddata');
    var file = fileinput.files[0];
    var reader = new FileReader();
    reader.onload = function(filedata) {
        var data = JSON.parse(filedata.target.result);
        network.load(data);
    };
    reader.readAsText(file);
    removeBodyDiv('divupload');
    removeBodyDiv('divbk');
}

function createUploadDiv() 
{
    var div = document.createElement("div");
    var w = window
    var l = window.innerWidth / 2 - 200;
    var t = window.innerHeight / 2 - 75;
    div.setAttribute('style', 'position:absolute;top:' + t + 'px;left:' + l + 'px;z-index:110;background-color:white;width:400px;height:150px;border-radius:10px;border:1px solid;padding:10px;text-align:center;');
    div.setAttribute('id', 'divupload');
    div.innerHTML = '<p><input type="file" id="uploaddata" name="uploaddata" /></p>\
  <p>\
  <input type="button" id="upload" value="Upload" onclick="confirmUpload();" />\
  <input type="button" id="cancel" value="Cancel" onclick="cancelUpload();" />\
  </p>';
    document.body.appendChild(div);
}

function uploadClick() 
{
    createBkDiv();
    createUploadDiv();
}

/**
 Me falta:
 + Host, Router y Switch son todo hosts, que según el tipo configuran el conectable, e indican si permiten o no instalar aplicaciones
 - Cada aplicación proporciona sus entradas de menú
 - Cada elemento tiene su menú, y lo añade al UIManager cuando se crea
 - Cada elemento tiene su menú, y actualiza sus opciones al añadir / quitar aplicaciones
 - Cada elemento tiene su menú, y actualiza su posición al mover su drawable
 - Dibujar el selector de menú del seleccionado y añadirlo a los clickables
 - Cuando se deselecciona algo, quitar de los clickables el selector de menú del seleccionado
 - El clickable del menú del seleccionado tiene como objeto el propio menú, para detectar el tipo
 - Seleccionar y poder eliminar links
*/
var UIManager = function() 
{
    var STATE_NEUTRAL = 0; // Nada seleccionado, ningún menú visible
    var STATE_ELEMENT_SELECTED_MOUSE_DOWN = 1; //  Un elemento seleccionado, ningún menú visible, no hemos soltado el botón
    var STATE_ELEMENT_SELECTED_MOUSE_UP = 2; //  Un elemento seleccionado, ningún menú visible, hemos soltado el botón
    var STATE_LINE_SELECTED = 3; // Una línea seleccionada, ningún menú visible
    var STATE_DRAGGING = 4; // Un elemento seleccionado, arrastrándolo, ningún menú visible
    var STATE_CREATING_LINK = 5; // Un elemento seleccionado, moviendo, para hacer click en otro y crear un link, ningún menú visible
    var STATE_MAIN_MENU_VISIBLE = 6; // Nada seleccionado, menú principal visible
    var STATE_ELEMENT_MENU_VISIBLE = 7; // Un elemento seleccionado, su menú visible
    var STATE_LINE_MENU_VISIBLE = 8; // Un enlace seleccionado, su menú visible
    
    var ACTION_MOUSE_DOWN = 0;
    var ACTION_MOUSE_UP = 1;
    var ACTION_MOUSE_MOVE = 2;
    var ACTION_MENU_OPTION_CLICKED = 3;
    var ACTION_SELECTED_ELEMENT_DELETED = 4;
    var ACTION_SELECTED_LINE_DELETED = 5;
    var ACTION_CREATE_LINK = 6;
    
    var menus = [];
    var clickables = [];
    var windows = [];
    var canvas = document.getElementById("simcanvas");
    var state = STATE_NEUTRAL;
    var mainmenu = null;
    var _self = this;
    var click_offset_x = 0;
    var click_offset_y = 0;
    var elemRect = null;
    var move_X = 0;
    var move_Y = 0;
    
    function switchMainMenu(params) 
    {
        if (mainmenu.getVisible()) 
        {
            mainmenu.hide();
        } 
        else 
        {
            mainmenu.show();
        }
    }
    
    function init() 
    {
        var canvas = document.getElementById("simcanvas");
        canvas.addEventListener("mousedown", mouseDownEvent, false);
        canvas.addEventListener("mouseup", mouseUpEvent, false);
        canvas.addEventListener("mousemove", mouseMoveEvent, false);
        var bbox = canvas.getBoundingClientRect();
        
        mainmenu = new UIMenu("<strong>Main menu</strong>", 42 + bbox.left, 3, true);
        mainmenu.addEntry("img/64/upload.png", "Upload", 'uploadClick();');
        mainmenu.addEntry("img/64/save.png", "Save", 'saveNetwork();');
        mainmenu.addEntry("img/64/computer.png", "Add Host", 'newElement("host");');
        mainmenu.addEntry("img/64/server_dhcp.png", "Add DHCP server", 'newElement("dhcp");');
        mainmenu.addEntry("img/64/server_dns.png", "Add DNS server", 'newElement("dns");');
        mainmenu.addEntry("img/64/server_web.png", "Add web server", 'newElement("web");');
        mainmenu.addEntry("img/64/switch.png", "Add switch", 'newElement("switch");');
        mainmenu.addEntry("img/64/router2.png", "Add router", 'newElement("router");');
        _self.addMenu(mainmenu);
        
        var rect = new UIRectangle(switchMainMenu, null, mainmenu, 5, 5, 35, 50, 10, true);
        _self.addClickable(rect);
    }
    
    this.addWindow = function(w)
    {
        windows[w.getId()] = w;
    };

    this.getWindow = function(id)
    {
        return windows[id];
    };

    this.removeWindow = function(w)
    {
        delete windows[w.getId()];
    };

    this.reset = function() 
    {
        this.clickables = [];
        var rect = new UIRectangle(switchMainMenu, null, mainmenu, 5, 5, 35, 50, 10, true);
        this.addClickable(rect);
    };
    
    function mouseDownEvent(event) 
    {
        var canvas = document.getElementById("simcanvas");
        // THANK_YOU: http://www.informit.com/articles/article.aspx?p=1903884&seqNum=6
        var bbox = canvas.getBoundingClientRect();
        var canvas_x = event.clientX - bbox.left * (canvas.width / bbox.width);
        var canvas_y = event.clientY - bbox.top * (canvas.height / bbox.height);
        
        dispatchEvent(canvas_x, canvas_y, ACTION_MOUSE_DOWN);
    }
    
    function mouseUpEvent(event) 
    {
        var canvas = document.getElementById("simcanvas");
        // THANK_YOU: http://www.informit.com/articles/article.aspx?p=1903884&seqNum=6
        var bbox = canvas.getBoundingClientRect();
        var canvas_x = event.clientX - bbox.left * (canvas.width / bbox.width);
        var canvas_y = event.clientY - bbox.top * (canvas.height / bbox.height);
        
        dispatchEvent(canvas_x, canvas_y, ACTION_MOUSE_UP);
    }
    
    function mouseMoveEvent(event) 
    {
        var canvas = document.getElementById("simcanvas");
        // THANK_YOU: http://www.informit.com/articles/article.aspx?p=1903884&seqNum=6
        var bbox = canvas.getBoundingClientRect();
        var canvas_x = event.clientX - bbox.left * (canvas.width / bbox.width);
        var canvas_y = event.clientY - bbox.top * (canvas.height / bbox.height);
        move_X = canvas_x;
        move_Y = canvas_y;
        
        dispatchEvent(canvas_x, canvas_y, ACTION_MOUSE_MOVE);
    }
    
    function hideAllMenus() 
    {
        
        for (var id in menus) 
        {
            if (menus[id].getVisible()) 
            {
                menus[id].hide();
            }
        }
    }
    
    function updateOffsets(drawable, X, Y) 
    {
        var rect = drawable.getRect();
        click_offset_x = X - rect.x;
        click_offset_y = Y - rect.y;
    }
    
    function switchSelectedMenu(menu) 
    {
        if (menu.getVisible()) 
        {
            menu.hide();
        } 
        else 
        {
            menu.show();
        }
    }
    
    function selectElement(e) 
    {
        network.setSelected(e);
        e.getDrawable().addObserver(_self);
        // Crear el rectángulo de despliegue de menú
        var rect = e.getDrawable().getRect();
        elemRect = new UIRectangle(switchSelectedMenu, e.getMenu(), _self, rect.x + rect.width - 10, rect.y, 10, 10, 50);
        _self.addClickable(elemRect);
    }
    
    function selectLink(l) 
    {
        network.setSelected(l);
        var vertices = l.getCenter();
        elemRect = new UIRectangle(switchSelectedMenu, l.getMenu(), _self, vertices.x - 5, vertices.y - 5, 10, 10, 50);
        l.getMenu().setPos(vertices.x + 5, vertices.y - 5);
        _self.addClickable(elemRect);
    }
    
    this.drawableChanged = function() 
    {
        if (network.getSelected() !== null) 
        {
            var rect = network.getSelected().getDrawable().getRect();
            
            elemRect.X = rect.x + rect.width - 10;
            elemRect.Y = rect.y;
        }
    };
    
    function unselectElement(e) 
    {
        if ((e !== null) && (e.getMenu().getVisible())) 
        {
            e.getMenu().hide();
            e.getDrawable().deleteObserver(_self);
        }
        _self.removeClickable(elemRect);
        network.setSelected(null);
    }
    
    function unselectLine(e) 
    {
        /*if ((e !== null) && (e.getMenu().getVisible())) 
        {
            e.getMenu().hide();
            e.getDrawable().deleteObserver(_self);
        }*/
        network.setSelected(null);
    }
    
    function dispatchEvent(X, Y, action) 
    {
        switch (state) 
        {
            case STATE_NEUTRAL:
                switch (action) 
                {
                    case ACTION_MOUSE_DOWN:
                        var clicked = detectClick(X, Y);
                        if (clicked !== null) 
                        {
                            if (clicked.getObject() === mainmenu) 
                            {
                                // Ocultar todos los demás menús
                                hideAllMenus();
                                // Main menu visible
                                clicked.performAction();
                                // Nuevo estado
                                state = STATE_MAIN_MENU_VISIBLE;
                            } 
                            else if (clicked.getObject() instanceof Drawable) 
                            {
                                // Actualizar los offsets para mover el objeto
                                updateOffsets(clicked.getObject(), X, Y);
                                // Ocultar todos los menús
                                hideAllMenus();
                                // Seleccionado el owner
                                selectElement(clicked.getObject().getOwner());
                                // Nuevo estado
                                state = STATE_ELEMENT_SELECTED_MOUSE_DOWN;
                            } 
                            else if (clicked.getObject() instanceof Link) 
                            {
                                // Ocultar los menus
                                hideAllMenus();
                                selectLink(clicked.getObject());
                                state = STATE_LINE_SELECTED;
                            }
                        }
                        break;
                }
                break;
            case STATE_MAIN_MENU_VISIBLE:
                switch (action) 
                {
                    case ACTION_MOUSE_DOWN:
                        var clicked = detectClick(X, Y);
                        if (clicked !== null) 
                        {
                            if (clicked.getObject() === mainmenu) 
                            {
                                // Main menu oculto
                                clicked.performAction();
                                // Nuevo estado
                                state = STATE_NEUTRAL;
                            } 
                            else if (clicked.getObject() instanceof Drawable) 
                            {
                                // Actualizar los offsets para mover el objeto
                                updateOffsets(clicked.getObject(), X, Y);
                                // Ocultar el menú principal
                                mainmenu.hide();
                                // Seleccionado el owner
                                selectElement(clicked.getObject().getOwner());
                                // Nuevo estado
                                state = STATE_ELEMENT_SELECTED_MOUSE_DOWN;
                            } 
                            else if (clicked.getObject() instanceof Link) 
                            {
                                // Ocultar los menus
                                hideAllMenus();
                                selectLink(clicked.getObject());
                                state = STATE_LINE_SELECTED;
                            }
                        } 
                        else 
                        {
                            // Main menu oculto
                            mainmenu.hide();
                            // Nuevo estado
                            state = STATE_NEUTRAL;
                        }
                        break;
                    case ACTION_MENU_OPTION_CLICKED:
                        // Main menu oculto
                        mainmenu.hide();
                        // Nuevo estado
                        state = STATE_NEUTRAL;
                        break;
                }
                break;
            case STATE_ELEMENT_SELECTED_MOUSE_DOWN:
                switch (action) 
                {
                    case ACTION_MOUSE_UP:
                        state = STATE_ELEMENT_SELECTED_MOUSE_UP;
                        break;
                    case ACTION_MOUSE_MOVE:
                        network.getSelected().getDrawable().setPosition(X - click_offset_x, Y - click_offset_y);
                        break;
                }
                break;
            case STATE_ELEMENT_SELECTED_MOUSE_UP:
                switch (action) 
                {
                    case ACTION_MOUSE_DOWN:
                        var clicked = detectClick(X, Y);
                        if (clicked !== null) 
                        {
                            if (clicked.getObject() === mainmenu) 
                            {
                                // Ocultar todos los demás menús
                                hideAllMenus();
                                // Main menu visible
                                clicked.performAction();
                                // Nada seleccionado
                                network.setSelected(null);
                                // Nuevo estado
                                state = STATE_MAIN_MENU_VISIBLE;
                            } 
                            else if (clicked.getObject() instanceof Drawable) 
                            {
                                // Ocultar todos los menús
                                hideAllMenus();
                                // Seleccionado el owner
                                unselectElement(network.getSelected());
                                selectElement(clicked.getObject().getOwner());
                                // Nuevo estado
                                state = STATE_ELEMENT_SELECTED_MOUSE_DOWN;
                            } 
                            else if (clicked.getObject() instanceof UIManager) 
                            {
                                clicked.performAction();
                                // Nuevo estado
                                state = STATE_ELEMENT_MENU_VISIBLE;
                            } 
                            else if (clicked.getObject() instanceof Link) 
                            {
                                // Ocultar los menus
                                hideAllMenus();
                                selectLink(clicked.getObject());
                                state = STATE_LINE_SELECTED;
                            }
                        } 
                        else 
                        {
                            // Nada seleccionado
                            network.setSelected(null);
                            // Nuevo estado
                            state = STATE_NEUTRAL;
                        }
                        break;
                }
                break;
            case STATE_LINE_SELECTED:
                switch (action) 
                {
                    case ACTION_MOUSE_DOWN:
                        var clicked = detectClick(X, Y);
                        if (clicked !== null) 
                        {
                            if (clicked.getObject() === mainmenu) 
                            {
                                // Ocultar todos los demás menús
                                hideAllMenus();
                                // Main menu visible
                                clicked.performAction();
                                // Nada seleccionado
                                network.setSelected(null);
                                // Nuevo estado
                                state = STATE_MAIN_MENU_VISIBLE;
                            } 
                            else if (clicked.getObject() instanceof Drawable) 
                            {
                                // Ocultar todos los menús
                                hideAllMenus();
                                // Seleccionado el owner
                                unselectLine(network.getSelected());
                                selectElement(clicked.getObject().getOwner());
                                // Nuevo estado
                                state = STATE_ELEMENT_SELECTED_MOUSE_DOWN;
                            } 
                            else if (clicked.getObject() instanceof UIManager) 
                            {
                                clicked.performAction();
                                // Nuevo estado
                                state = STATE_LINE_MENU_VISIBLE;
                            } 
                            else if (clicked.getObject() instanceof Link) 
                            {
                                // Ocultar los menus
                                hideAllMenus();
                                selectLink(clicked.getObject());
                                state = STATE_LINE_SELECTED;
                            }
                        } 
                        else 
                        {
                            // Nada seleccionado
                            network.setSelected(null);
                            // Nuevo estado
                            state = STATE_NEUTRAL;
                        }
                        break;
                }
                break;
            case STATE_LINE_MENU_VISIBLE:
                switch (action) 
                {
                    case ACTION_MOUSE_DOWN:
                        var clicked = detectClick(X, Y);
                        if (clicked !== null) 
                        {
                            if (clicked.getObject() === mainmenu) 
                            {
                                // Ocultar todos los demás menús
                                hideAllMenus();
                                // Main menu visible
                                clicked.performAction();
                                // Nada seleccionado
                                network.setSelected(null);
                                // Nuevo estado
                                state = STATE_MAIN_MENU_VISIBLE;
                            } 
                            else if (clicked.getObject() instanceof Drawable) 
                            {
                                // Ocultar todos los menús
                                hideAllMenus();
                                // Seleccionado el owner
                                unselectLine(network.getSelected());
                                selectElement(clicked.getObject().getOwner());
                                // Nuevo estado
                                state = STATE_ELEMENT_SELECTED_MOUSE_DOWN;
                            } 
                            else if (clicked.getObject() instanceof UIManager) 
                            {
                                clicked.performAction();
                                // Nuevo estado
                                state = STATE_LINE_SELECTED;
                            } 
                            else if (clicked.getObject() instanceof Link) 
                            {
                                // Ocultar los menus
                                hideAllMenus();
                                selectLink(clicked.getObject());
                                state = STATE_LINE_SELECTED;
                            }
                        } 
                        else 
                        {
                            hideAllMenus();
                            // Nada seleccionado
                            unselectLine(network.getSelected());
                            // Nuevo estado
                            state = STATE_NEUTRAL;
                        }
                        break;
                    case ACTION_SELECTED_LINE_DELETED:
                        // Menu oculto
                        hideAllMenus();
                        unselectLine(network.getSelected());
                        // Nuevo estado
                        state = STATE_NEUTRAL;
                        break;
                }
                break;
            case STATE_ELEMENT_MENU_VISIBLE:
                switch (action) 
                {
                    case ACTION_MOUSE_DOWN:
                        var clicked = detectClick(X, Y);
                        if (clicked !== null) 
                        {
                            if (clicked.getObject() === mainmenu) 
                            {
                                // Ocultar todos los demás menús
                                hideAllMenus();
                                // Main menu visible
                                clicked.performAction();
                                // Nada seleccionado
                                network.setSelected(null);
                                // Nuevo estado
                                state = STATE_MAIN_MENU_VISIBLE;
                            } 
                            else if (clicked.getObject() instanceof Drawable) 
                            {
                                // Ocultar todos los menús
                                hideAllMenus();
                                // Seleccionado el owner
                                unselectElement(network.getSelected());
                                selectElement(clicked.getObject().getOwner());
                                // Nuevo estado
                                state = STATE_ELEMENT_SELECTED_MOUSE_DOWN;
                            } 
                            else if (clicked.getObject() instanceof UIManager) 
                            {
                                clicked.performAction();
                                // Nuevo estado
                                state = STATE_ELEMENT_MENU_VISIBLE;
                            } 
                            else if (clicked.getObject() instanceof Link) 
                            {
                                // Ocultar los menus
                                hideAllMenus();
                                selectLink(clicked.getObject());
                                state = STATE_LINE_SELECTED;
                            }
                        } 
                        else 
                        {
                            unselectElement(network.getSelected());
                            // Main menu oculto
                            hideAllMenus();
                            // Nuevo estado
                            state = STATE_NEUTRAL;
                        }
                        break;
                    case ACTION_MENU_OPTION_CLICKED:
                        // Menu oculto
                        hideAllMenus();
                        // Nuevo estado
                        state = STATE_ELEMENT_SELECTED_MOUSE_UP;
                        break;
                    case ACTION_SELECTED_ELEMENT_DELETED:
                        // Menu oculto
                        hideAllMenus();
                        unselectElement(network.getSelected());
                        // Nuevo estado
                        state = STATE_NEUTRAL;
                        break;
                    case ACTION_CREATE_LINK:
                        hideAllMenus();
                        state = STATE_CREATING_LINK;
                        break;
                }
                break;
            case STATE_CREATING_LINK:
                switch (action) 
                {
                    case ACTION_MOUSE_DOWN:
                        var clicked = detectClick(X, Y);
                        if (clicked !== null) 
                        {
                            if (clicked.getObject() instanceof Drawable) 
                            {
                                // Ocultar todos los menús
                                hideAllMenus();
                                // Crear el link
                                selectLinkConnectors(network.getSelected().id, clicked.getObject().getOwner().id);
                                state = STATE_ELEMENT_SELECTED_MOUSE_UP;
                            }
                        }
                        else 
                        {
                            hideAllMenus();
                            // Nuevo estado
                            state = STATE_ELEMENT_SELECTED_MOUSE_UP;
                        }
                        break;
                }
                break;
        }
    }
    
    this.menuOptionClicked = function() 
    {
        dispatchEvent(-1, -1, ACTION_MENU_OPTION_CLICKED);
    };
    
    this.selectedElementDeleted = function() 
    {
        dispatchEvent(-1, -1, ACTION_SELECTED_ELEMENT_DELETED);
    };
    
    this.selectedLineDeleted = function() 
    {
        dispatchEvent(-1, -1, ACTION_SELECTED_LINE_DELETED);
    };
    
    this.createLinkAction = function() 
    {
        dispatchEvent(-1, -1, ACTION_CREATE_LINK);
    };
    
    function detectClick(X, Y) 
    {
        var clicked = null;
        
        for (var i = 0; i < clickables.length; i++) 
        {
            if (clickables[i].isInCoords(X, Y)) 
            {
                if ((clicked === null) || (clickables[i].Z > clicked.Z)) 
                {
                    clicked = clickables[i];
                }
            }
        }
        
        return clicked;
    }
    
    this.addMenu = function(menu) 
    {
        menus[menu.getId()] = menu;
    };
    
    this.deleteMenu = function(menu) 
    {
        delete menus[menu.getId()];
    };
    
    this.getMenu = function(id) 
    {
        return menus[id];
    };
    
    this.addClickable = function(c) 
    {
        clickables.push(c);
    };
    
    this.removeClickable = function(c) 
    {
        var index = clickables.indexOf(c);
        clickables.splice(index, 1);
    };
    
    function renderMainMenu(ctx) 
    {
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillRect(5, document.body.scrollTop + 5, 35, 50);
        ctx.strokeStyle = "rgba(255,255,255,1.0)";
        ctx.lineWidth = 4;
        ctx.strokeRect(5, document.body.scrollTop + 5, 35, 50);
        ctx.lineWidth = 5;
        for (var i = 15; i < 50; i += 10) 
        {
            ctx.strokeRect(12, document.body.scrollTop + i, 21, 0);
        }
    }
    
    function renderSelected(ctx) 
    {
        if ((state === STATE_ELEMENT_SELECTED_MOUSE_DOWN) || (state === STATE_ELEMENT_SELECTED_MOUSE_UP) || (state === STATE_ELEMENT_MENU_VISIBLE) || (state === STATE_CREATING_LINK)) 
        {
            var rect = network.getSelected().getDrawable().getRect();
            ctx.strokeStyle = "rgba(100,100,100,0.75)";
            ctx.lineWidth = 5;
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
            ctx.fillStyle = "rgba(255,255,255,0.75)";
            ctx.strokeStyle = "rgba(255,255,255,0.75)";
            ctx.fillRect(elemRect.X, elemRect.Y, elemRect.W, elemRect.H);
            ctx.lineWidth = 2;
            ctx.strokeRect(elemRect.X, elemRect.Y, elemRect.W, elemRect.H);
        } 
        else if ((state === STATE_LINE_SELECTED) || (state === STATE_LINE_MENU_VISIBLE)) 
        {
            var pos = network.getSelected().getCenter();
            ctx.fillStyle = "rgba(255,255,255,0.75)";
            ctx.strokeStyle = "rgba(255,255,255,0.75)";
            ctx.fillRect(pos.x - 5, pos.y - 5, 10, 10);
            ctx.lineWidth = 2;
            ctx.strokeRect(pos.x - 5, pos.y - 5, 10, 10);
        }
    }
    
    function renderCreatingLink(ctx) 
    {
        if (state === STATE_CREATING_LINK) 
        {
            var rect = network.getSelected().getDrawable().getRect();
            var x1 = rect.x + rect.width / 2;
            var y1 = rect.y + rect.height / 2;
            ctx.strokeStyle = "rgba(128,255,128,1.0)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(move_X, move_Y);
            ctx.stroke();
        
        }
    }
    
    this.render = function(ctx) 
    {
        renderSelected(ctx);
        renderCreatingLink(ctx);
        renderMainMenu(ctx);
    };
    
    init();
};
