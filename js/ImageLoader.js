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

var ImageLoader = function(filearray, callback)
{
  var filearray = filearray;
  var loadedImages = [];
  var next = 0;
  var callback = callback;
  
  function internalLoad()
  {
    if (next < filearray.length)
    {
      var pos = next;
      next++;
      var img = new Image();
      loadedImages.push(img);
      img.onload = function()
      {
	internalLoad();
      };
      img.src = filearray[pos];
    }
    else
    {
      callback(loadedImages);
    }
  }
  
  this.getLoadedImages = function ()
  {
    return this.loadedImages;
  };
  
  this.load = function()
  {
    internalLoad();
  };
};
