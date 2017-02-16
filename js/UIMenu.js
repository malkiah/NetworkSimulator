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

var UIMenu = function(description, X,Y, fixed)
{
    var X = X;
    var Y = Y;
    var entries = [];
    var id = "uimenu_" + getNextID();
    var description = description;
    var visible = false;
    var fixed = fixed;
    var _self = this;

    function init()
    {
        uitranslation.addObserver(_self);
    }
    
    this.dispose = function()
    {
        uitranslation.deleteObserver(this);
    };

    this.localeChanged = function()
    {
        /*for (var i = 0; i < entries.length; i++)
        {
            var span = document.getElementById(entries[i].id);
            span.innerHTML = _(entries[i].text);
        }*/
    };

    this.getId = function()
    {
        return id;
    };

    this.getVisible = function()
    {
        return visible;
    };

    this.addEntry = function(img, text, js)
    {
        var data = {};
        data.id = "entry_" + getNextID();
        data.img = img;
        data.text = text;
        data.js = js;
        entries.push(data);
    };

    this.setPos = function(cX, cY)
    {
        X = cX;
        Y = cY;
    }

    this.setDescription = function(desc)
    {
        description = desc;
    };

    this.purge = function()
    {
        entries = [];
    }

    this.show = function()
    {
        var div = document.createElement("div");
        div.setAttribute("id",id);
        div.setAttribute("style","width:200px;background-color:#EEEEEE;border:3px solid white;position:"+ (fixed?"fixed":"absolute") +";top:"+Y+"px;left:"+X+"px;font-size:0.8em;padding:0px 10px 0px;");

        var innerHtml = "<span style='font-weight:bold'>" + _(description) + "</span><hr/>";

        for (var i = 0; i < entries.length; i++)
        {
            innerHtml += "<a href='#' onclick='"+ entries[i].js +"uimanager.menuOptionClicked();'>";
            innerHtml += "<img src='"+ entries[i].img +"' style='max-height:32px;max-width:32px;' />";
            innerHtml += "<span id='" +entries[i].id+ "'>" + _(entries[i].text) + "</span></a><br/>";
            if (i !== entries.length - 1)
            {
                innerHtml += "<hr/>"
            }
        }

        div.innerHTML = innerHtml;

        document.body.appendChild(div);
        visible = true;
    };

    this.hide = function()
    {
        var div = document.getElementById(id);
        document.body.removeChild(div);
        visible = false;
    };

    init();
};