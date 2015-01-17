function createLocaleDiv() 
{
    createBkDiv();
        
    var w = new UIWindow("localediv", "Select language", 300, 150, false, 1.0);
    var content = uitranslation.getControls()
    var controls = '<input type="button" value="' + _("Accept") + '" onclick="localeSelected();" />';
    controls += '<input type="button" value="' + _("Cancel") + '" onclick="localeCancelled();" />';
    w.setContent(content);
    w.setControls(controls);
    w.render();
}

function localeSelected() 
{
    var locale = document.getElementById("localeselector").value;
    uitranslation.selectLocale(locale);
    removeBodyDiv('divbk');
    uimanager.getWindow("localediv").dispose();
}

function localeCancelled() 
{
    removeBodyDiv('divbk');
    uimanager.getWindow("localediv").dispose();
}

function _(text) 
{
    return uitranslation._(text);
}

var UITranslation = function() {
    var current = "en_GB";
    var locales = [];
    var observers = [];
    
    this.registerLocale = function(locale) 
    {
        locales[locale.locale] = locale;
    };
    
    this.getLocales = function() 
    {
        return Object.keys(locales);
    };
    
    this.addObserver = function(observer) 
    {
        observers.push(observer);
    };
    
    this.removeObserver = function(observer) 
    {
        var pos = observers.indexOf(observer);
        if (pos >= 0) 
        {
            observers.splice(pos, 1);
        }
    };
    
    this.selectLocale = function(locale) 
    {
        current = locale;
        notifyObservers();
    };
    
    function notifyObservers() 
    {
        for (var i = 0; i < observers.length; i++) 
        {
            observers[i].localeChanged();
        }
    }
    
    this._ = function(text) 
    {
        var result = text;
        if ((current in locales) && (text in locales[current])) 
        {
            result = locales[current][text];
        }
        
        return result;
    };

    this.getControls = function()
    {
        var result = '<label for="localeselector">' +_("Language:")+ ' </label><select id="localeselector">';
        //var keys = this.getLocales();
        for (locale in locales)
        {
            var selected = (locales[locale].locale === current)?'selected="selected"':'';
            result += '<option value="'+locales[locale].locale+'" '+selected+'>' + locales[locale].name + '</option>';
        }
        result += '</select>';

        return result;
    };
};

var uitranslation = new UITranslation();
