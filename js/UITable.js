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

var lasttableid = 0;
var uitables = [];

function getNextTableID()
{
    return ++lasttableid;
}

function deleteUITableRow(id,row)
{
    uitables[id].deleteRow(row);
}

function addUITableRow(id)
{
    uitables[id].addRow();
}

var UITable = function(headers, data, tableid) 
{
    var headers = headers;
    var data = data;
    var tableid = tableid;
    var id = "uitable_" + getNextTableID();
    var editsecondary = false;
    var editsecondaryfunc = null;
    var params = [];
    uitables[id] = this;
    
    this.getId = function()
    {
        return id;
    };

    this.setParam = function(id, value)
    {
        params[id] = value;
    };

    this.getParam = function(id)
    {
        var result = null;
        if (id in params)
        {
            result = params[id];
        }
        return result;
    };

    this.setSecondary = function(editsecondary_p, editsecondaryfunc_p)
    {
        editsecondary = editsecondary_p;
        editsecondaryfunc = editsecondaryfunc_p;
    };

    this.render = function() 
    {
        var result = '';
        result += '<tr>';
        for (var i = 0; i < headers.length; i++) 
        {
            result += '<th>' + headers[i] + '</th>';
        }
        result += '<th>Controls</th>'
        result += '</tr>';
        
        for (var i = 0; i < data.length; i++) 
        {
            result += '<tr>';
            for (var j = 0; j < headers.length; j++) 
            {
                var inputid = tableid + "_" + i + "_" + j;
                result += '<td>';
                result += '<input type="text" id="'+inputid+'" value="'+data[i][j]+'" disabled="disabled" />';
                result += '</td>';
            }
            result += '<td>';
            result += '<img src="img/64/delete.png" title="Delete" alt="Delete" style="width:24px;" onclick="deleteUITableRow(\''+id+'\','+i+')" />';
            if (editsecondary)
            {
                result += '<img src="img/64/edit.png" title="Edit" alt="Edit" style="width:24px;" onclick="'+editsecondaryfunc+'(\''+id+'\','+i+')" />';
            }
            result += '</td>';
            result += '</tr>';
        }
        result += '<tr>';
        for (var j = 0; j < headers.length; j++) 
        {
            var inputid = tableid + "_new_" + j;
            result += '<td>';
            result += '<input type="text" id="'+inputid+'" />';
            result += '</td>';
        }
        result += '<td><img src="img/64/add.png" title="Add" alt="Add" style="width:24px;" onclick="addUITableRow(\''+id+'\')" /></td>';
        result += '</tr>';

        document.getElementById(tableid).innerHTML = result;
    };

    this.deleteRow = function(row)
    {
        data.splice(row,1);
        this.render();
    };

    this.dispose = function()
    {
        delete uitables[id];
    };

    this.getData = function()
    {
        return data;
    };

    this.addRow = function()
    {
        var row = [];

        for (var j = 0; j < headers.length; j++) 
        {
            var inputid = tableid + "_new_" + j;
            var value = document.getElementById(inputid).value;
            row.push(value);
        }

        data.push(row);
        this.render();
    };
};
