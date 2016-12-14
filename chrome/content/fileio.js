/*
*    This file is part of FindThatFont!
*
*    FindThatFont! is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    (at your option) any later version.
*
*    FindThatFont! is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
*    GNU General Public License for more details.
*   
*    You should have received a copy of the GNU General Public License
*    along with FindThatFont!. If not, see <http://www.gnu.org/licenses/>.
*/

 
const defaultFile      = "fontlist.ini";

// Returns the path where FindThatFont! is installed (with trailing backslash).
function getAppPath() {
    var appPath = Components.classes["@mozilla.org/file/directory_service;1"]
                 .getService(Components.interfaces.nsIProperties)
                 .get("CurProcD", Components.interfaces.nsIFile);
    return ((appPath.path.search(/\\/) != -1) ? appPath.path + "\\" : appPath.path + "/");
}

// Returns the path to the profile directory
function getProfilePath() {
    var profPath = Components.classes["@mozilla.org/file/directory_service;1"]
                 .getService(Components.interfaces.nsIProperties)
                 .get("ProfD", Components.interfaces.nsIFile);
    return ((profPath.path.search(/\\/) != -1) ? profPath.path + "\\" : profPath.path + "/");
}

// Returns the path to the INI file
function getFilename() {
    return getProfilePath() + defaultFile;
}

// Saves font information to the INI file
// outputstream flags:
//  0x01 = readonly
//  0x02 = write only
//  0x04 = read & write
//  0x08 = create if doesn't exist
//  0x10 = append data
//  0x20 = truncate
//  0x40 = If set, each write will wait for both the file data and file status to be physically updated.
//  0x80 = With PR_CREATE_FILE, if the file does not exist, the file is created. If the file already exists, no action and NULL is returned.
function saveIniFile(filename) {
    if(allFonts.length === 0) {
        return;
    }
    var progress = startWaiting("Saving...", "undetermined");
    try {
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(filename);
        if(file.exists() === false) {
            file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420);
        }
        var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
        outputStream.init(file, 0x02 | 0x08 | 0x20, 420, 0);
        var output = "";
        // Save version info:
        output += "#2\r\n";
        
        // Save classes:
        var i;
        for(i=1; i<allClasses.length; i++) {
            output += allClasses[i].toFile();
        }
        
        var result = outputStream.write(output, output.length);
        
        // Save font:
        for(i=0; i<allFonts.length; i++) {
            output = allFonts[i].toFile();
            result = outputStream.write(output, output.length);
        }
        
        outputStream.close();
    } catch(e) {
        handleError("function saveIniFile("+filename+"): "+e);
    }
    stopWaiting(progress);
}

// Reads font information from the INI file
function readIniFile(filename) {
    var istream;
    try {
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(filename);
        if(file.exists() === false) {
            return false;
        }
        // open an input stream from file
        istream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
        istream.init(file, 0x01, 0444, 0);
        istream.QueryInterface(Components.interfaces.nsILineInputStream);
        // read lines into array
        var line={}, hasmore;
        var lineCount=0;
        var syntaxVersion=-1;

        // Read the first line:
        hasmore = istream.readLine(line);
        if(syntaxVersion==-1) {
            if(line.value.indexOf('#')<0) {
                syntaxVersion = 1;
            } else {
                syntaxVersion = parseInt(line.value.substring(1,2));
                if(syntaxVersion > 2) {
                    alert('The configuration file is of a newer version\nthan this program can read.\nCannot read the configuration file.');
                }
            }
        }
            
        // Read classes:
        if(syntaxVersion >= 2) {
            for(var i=1; i<allClasses.length && hasmore; i++) {
                hasmore  = istream.readLine(line);
                var pos  = line.value.indexOf('|');
                var pos2 = line.value.indexOf('|', pos+1);
                var className   = line.value.substring(0,     pos);
                var description = line.value.substring(pos+1, pos2);
                var hidden      = line.value.substring(pos2+1     );
                allClasses[i].setName(className.replace('&#124;', '|'));
                allClasses[i].setDescription(description.br2nl().replace('&#124;', '|'));
                allClasses[i].setHidden(hidden == '0' ? false : true );
            }
        }
        
        // Read fonts:
        var success = true;
        do {
            hasmore = istream.readLine(line);
            success = addFont(line.value, lineCount, syntaxVersion);
            if(!success) break;
            lineCount++;
        } while(hasmore)
        
        if(!success) {
            window.alert("The font list configuration file is newer than the version of FindThatFont supports.\nPlease make sure that you have the newest version of FindThatFont that is available.");
        }
        
        istream.close();
        
    } catch(e) {
        try { istream.close(); } catch(e) {}
        handleError("function readIniFile: "+e);
        return false;
    }
    return true;
}

// Save content to a certain file.
// The file is created if it does not exist.
// If it does exist, existing content is removed first.
function saveFile(filename, content) {
    if(allFonts.length==0)
      return;
    var progress = startWaiting("Saving...", "undetermined");
    try {
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(filename);
        if(file.exists()==false) {
            file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420);
        }
        var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
        outputStream.init(file, 0x04 | 0x08 | 0x20, 420, 0);
        var result = outputStream.write(content, content.length);
        
        outputStream.close();
  	} catch(e) {
        handleError("function saveFile: "+e);
    }
    stopWaiting(progress);
}

// Returns the content from a file
function readFile(filename) {
    var output = false;
    try {
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(filename);
        if(file.exists() == false) {
            handleError("function readFile: file "+filename+" does not exist.");
            return false;
        }
        // open an input stream from file
        var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
        istream.init(file, 0x01, 0444, 0);
        istream.QueryInterface(Components.interfaces.nsILineInputStream);
    	var sis = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance( Components.interfaces.nsIScriptableInputStream );
	    sis.init(istream);
        output = sis.read(sis.available());
        istream.close();
    } catch(e) {
        handleError("function readFile: "+e);
    }
    return output;
}

// Copies file 1 to path 2
function copyFile(source,destdir,newname) {
    try {
        const CC = Components.classes;
        const CI = Components.interfaces;
        
        var file = CC["@mozilla.org/file/local;1"].createInstance(CI.nsILocalFile);
        var path = CC["@mozilla.org/file/local;1"].createInstance(CI.nsILocalFile);
        var newf = CC["@mozilla.org/file/local;1"].createInstance(CI.nsILocalFile);
        
        file.initWithPath(source);
        path.initWithPath(destdir);
        newf.initWithPath(destdir+newname);
        
        if(newf.exists())
            newf.remove(false);
        
        file.copyTo(path,newname);
    } catch(e) {
        handleError("copyFile("+source+", "+destination+"): "+e);
    }
}

// Gets a line from the INI file, e.g. 'Times New Roman=,,,,,,,,,,,,,,,,,,,,,1,,,,,,,,,,,,,|0|0|1',
// extracts the font name and class numbers, seeks the font in allFonts,
// and updates allFonts with the read class numbers
function addFont(line, lineCount, syntaxVersion) {
    try {
        if(line.indexOf('=')<0) {
            if(line.length==0)
                return true;
            else
                return false;
        }
        
        var parts = [];
        parts = line.split("=");
        var fontname = parts[0];
        var classes  = parts[parts.length-1];
       
        if(parts.length!=2) {
            // Fontname has an '=' in it.
            for(var i=1; i<parts.length-1; i++)
                fontname += "="+parts[i];
        }
        
        // See if the font specified at line 'lineCount' is also the
        // lineCount-th element in allFonts. When no fonts are (un)installed
        // since last using this program, this should be the case for all
        // fonts, so we can speed up the search process:
        if(lineCount>=0 && lineCount<allFonts.length && allFonts[lineCount].toString()==fontname) {
            var success = allFonts[lineCount].setClassesByString(classes, lineCount, syntaxVersion);
            if(!success) {
                return false;
            }
        } else {
            // If it was not found above, search it in the array:
            var index = findFont(fontname, 0, allFonts.length-1);
            if(index>=0) {
                var success = allFonts[index].setClassesByString(classes,index,syntaxVersion);
                if(!success) {
                    return false;
                }
            }
        }
        return true;
    } catch(e) {
        handleError("function addFont: "+e);
        alert("2) ["+success+"]");
        return false;
    }
}
