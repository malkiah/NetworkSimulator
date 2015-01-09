var UIMenu = function(description, X,Y, fixed)
{
    var X = X;
    var Y = Y;
    var entries = [];
    var id = "uimenu_" + getNextID();
    var description = description;
    var visible = false;
    var fixed = fixed;

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

        var innerHtml = description + "<hr/>";

        for (var i = 0; i < entries.length; i++)
        {
            innerHtml += "<a href='#' onclick='"+ entries[i].js +"uimanager.menuOptionClicked();'>";
            innerHtml += "<img src='"+ entries[i].img +"' style='max-height:32px;max-width:32px;' />";
            innerHtml += entries[i].text + "</a><br/>";
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
};