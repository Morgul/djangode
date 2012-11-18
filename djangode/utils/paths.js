var util = require('util');
var fs = require('fs');
var path = require('path');


/**
 * Find the full path and stats of the first file with the given name in one of the given directories.
 *
 * @param name         the filename to search for
 * @param directories  the list of directories to search in
 * @param callback     function(error, absolute_path, stats)
 */
function find_file(name, directories, callback)
{
    if(!callback)
    {
        throw 'paths.find_file() must be called with a callback';
    }
    var templateDirs = directories.slice(0);  // Copy the template_path array.

    function tryNextPathEntry()
    {
        if(templateDirs.length == 0)
        {
            callback(util.format('No file with name %j found in given directories!', name));
        }

        var fullPath = path.join(templateDirs.shift(), name);
        fs.stat(fullPath,
                function (error, stats)
                {
                    if(error)
                    {
                        tryNextPathEntry();
                    }
                    else
                    {
                        callback(null, fullPath, stats);
                    }
                });
    };

    tryNextPathEntry();
}

/**
 * Find the full path of the first file with the given name in one of the given directories, synchronously.
 *
 * @param name         the filename to search for
 * @param directories  the list of directories to search in
 */
function find_file_sync(name, directories)
{
    try
    {
        directories.forEach(
                function (dir)
                {
                    var fullPath = path.join(dir, name);
                    if (fs.existsSync(fullPath))
                    {
                        // Found it! Throw to get out of the forEach().
                        throw {'fullPath': fullPath}
                    }
                });
    }
    catch(ex)
    {
        if(ex.fullPath)
        {
            // Got the full path; return it.
            return ex.fullPath;
        }
        else
        {
            throw ex;
        }
    }
}


module.exports = {
    'find_file': find_file,
    'find_file_sync': find_file_sync,
};
