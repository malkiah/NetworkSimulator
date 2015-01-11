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

function UIClickable(callback, params, object) 
{
    var callback = callback;
    var params = params;
    var object = object;
    
    this.isInCoords = function(X, Y, Z) 
    {
        alert("This function needs to be redefined - isInCoords");
    };
    
    this.performAction = function() 
    {
        if (callback !== null)
        {
            callback(params);
        }
    };

    this.getObject = function()
    {
        return object;
    };
};
