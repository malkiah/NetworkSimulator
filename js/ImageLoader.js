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
