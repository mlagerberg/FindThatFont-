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
var selIndex = 0;
var fontUnderMouse = -1;

// The first function that runs when the program starts
function init() {
    var sb = document.getElementById("find-field");
    if(sb.getAttribute("value").length === 0) {
        sb.value = "Find font";
        sb.setAttribute("value", sb.value);
    }
    
    var progress = startWaiting("Reading fontlist...", "undetermined");

    initAllClasses();
    initFonts();
    fillFontClassList();
    fillFontSizeList();
    listFonts();
}

// Reads the fonts from file and system
function initFonts() {
    readFonts();
    var success = readIniFile(getFilename());
    if(!success) {
        readIniFile(getAppPath() + defaultFile);
    }

}

// Reads the fonts from the ini file in the profile
// can be called when ini must be re-read while program is already running.
function reInitFonts() {
    var success = readIniFile(getFilename());
    
    fillFontClassList();
    listFonts();
}

// Saves any changes to the ini file.
function cleanUp() {
    saveIniFile(getFilename());
}

// Called when the program is asked to close
function doClose() {
    cleanUp();
    var app = Components.classes["@mozilla.org/toolkit/app-startup;1"]
              .createInstance(Components.interfaces.nsIAppStartup);
    app.quit(Components.interfaces.nsIAppStartup.eAttemptQuit);
}

// Shows the about message
function showAbout() {
    window.openDialog("about.xul", "", "chrome,toolbar,centerscreen,modal");
}

// Load the help file
function showHelp() {
    try {
        var h  = document.getElementById("helpframe");
        h.addEventListener("DOMContentLoaded", helpLoaded, true);
        openURL("help.html");
    } catch(e) {
        handleError("showHelp: "+e);
    }
}

// After the help file is loaded, this function is called to
// fill in the list of classes in the help file
function helpLoaded() {
    try {
        var doc  = document.getElementById("helpframe").contentDocument;
        if(doc.documentURI!="chrome://findthatfont/content/help.html") {
            return;
        }
        
        // Fill in the class list
        var ul = doc.getElementById("classlist");
        var i;
        var str="";
        for(i=1; i<allClasses.length; i++) {
            str += "<li><b>" + allClasses[i].toString() + "</b> &mdash; " + allClasses[i].getDescription() + "</li>";
        }
        ul.innerHTML = str;
    } catch(e) {
        handleError("helpLoaded: "+e);
    }
}

// Opens the 'Appearance' window
function showOptions() {
    var win = window.openDialog("prefs.xul", "", "chrome,toolbar,centerscreen,dependent");
}

// Opens the 'Edit font list' window
function showEdit(ignoreHeader) {
    if(ignoreHeader && classHeaderSelected()) return;
    
    var win = window.openDialog("editfont.xul", "", "chrome,toolbar,centerscreen,modal");
}

// Opens the 'Edit classes' window
function showEditClasses() {
    var win = window.openDialog("editclass.xul", "", "chrome,toolbar,centerscreen,modal");
}

// Shows the JavaScript console
function showJSConsole() {
    toOpenWindowByType("global:console", "chrome://global/content/console.xul");
}

// Shows the 'about:config' window.
function showAboutConfig() {
    window.openDialog("chrome://global/content/config.xul", "chrome,toolbar,centerscreen,dependent");
}

// Hides the selected font from the fontlist
function hideFont() {
    var ix = findFont(getSelectedFont(), 0, allFonts.length-1);
    if(ix!=-1 && window.confirm("Are you sure you want to hide '"+getSelectedFont()+"' from the list?")) {
        allFonts[ix].setHidden();
        listFontsMaybe();
    }
}

// Opens an HTML file, specified by it's URL, in the help frame,
// shows the help frame and hides the fontlist
function openURL(anURL) {
    try {
        //var r = document.getElementById("font-list");
        //r.setAttribute("hidden","true");
        var h = $('helpframe');
        h.setAttribute("src", anURL);
        var deck = $('fonts');
        deck.selectedIndex = 1;
        
        //h.setAttribute("hidden","false");
    } catch(e) {
        handleError("openURL('"+anURL+"'): "+e);
    }
}

// Launches an URL in an external app.
function launchURL(anURL) {
    var uri = Components
                .classes["@mozilla.org/network/simple-uri;1"]
                .getService(Components.interfaces.nsIURI);
    uri.spec = anURL;

    Components.classes["@mozilla.org/uriloader/external-protocol-service;1"]
              .getService(Components.interfaces.nsIExternalProtocolService)
              .loadUrl(uri);
}

// Sends the font list to the printer, layed out as an HTML webpage
function printContent(onlyPreview) {
    try {
        var text = listFontsText('print');
        var hf = document.getElementById("helpframe");
        //hf.setAttribute("hidden","false");
        document.getElementById("fonts").selectedIndex = 1;
        
        if(onlyPreview) {
            //var rlb = document.getElementById('font-list');
            //rlb.setAttribute("hidden","true");
        }
        
        hf.contentWindow.document.clear();
        hf.contentWindow.document.write(text);
        hf.contentWindow.document.close();
        
        if(!onlyPreview) {
            hf.contentWindow.print();
        }
    } catch(e) {
        handleError("printContent: "+e);
    }
}

// Asks where to export the font list to, and writes an HTML file.
function exportToHtml() {
    var foStream;
    try {
        foStream = saveFileDialog();
        if(foStream) {
            var text = listFontsText('template');
            foStream.write(text, text.length);
            foStream.close();
        }
    } catch(e) {
        try {
            foStream.close();
        } catch(e) {}
        handleError("exportToHtml: "+e);
    }
}

// Asks where to export the fontlist.ini file to, and does the copying
function exportIni() {
    var filename;
    try {
        filename = saveFileDialogPlus("Export to..."
                                 , "fontlist.ini"
                                 , "Font list configuration files (*.ini)"
                                 , "*.ini;*.INI"
                                 , ".ini"
                                 , true);
        if(filename) {
            saveIniFile(filename);
        }
    } catch(e) {
        handleError("exportIni: "+e);
    } finally {
        foStream.close();
    }
}

function importIni() {
    var filename = openFileDialogPlus("Import font list..."
                      , "Font list configuration files (*.ini)"
                      , "*.ini;*.INI");
    if(filename
    && window.confirm("Are you sure you want to replace your current font list with the selected file?\n"
                      +"All fonts that are not classified in the selected file, will become unclassified.\n"
                      +"\nThis action cannot be undone!")) {
        copyFile(filename, getProfilePath(), "fontlist.ini");
        reInitFonts();
    }
}

// Shows a 'Save as' dialog, and returns an open fileOutputStream
function saveFileDialog() {
    try {
        return saveFileDialogPlus("Save as..."
                                 , ""
                                 , false
                                 , Components.interfaces.nsIFilePicker.filterHTML
                                 , ".html"
                                 , false);
    } catch(e) {
        handleError("saveFileDialog: "+e);
    }
    return false;
}

// Shows a 'Save as' dialog, and returns an open fileOutputStream
function saveFileDialogPlus(windowTitle, defaultString, filterName, filter, extension, getNameNotStream) {
    try {
        // More info:
        // http://developer.mozilla.org/en/docs/nsIFilePicker#appendFilter.28.29
        const CC = Components.classes;
        const CI = Components.interfaces;
        var fp = CC["@mozilla.org/filepicker;1"].createInstance(CI.nsIFilePicker);
        fp.init(window, windowTitle, CI.nsIFilePicker.modeSave);
        fp.defaultString = defaultString;
        if(filterName==false) {
            fp.appendFilters(filter);
        } else {
            fp.appendFilter(filterName, filter);
        }
        // Show dialog:
        var rv = fp.show();
        if (rv == CI.nsIFilePicker.returnOK
            || rv == CI.nsIFilePicker.returnReplace) {

            var file;
            // Check if (trimmed) file extension is empty
            if(fp.fileURL.fileExtension.replace(/^\s+|\s+$/,'').length==0) {
                file = CC["@mozilla.org/file/local;1"].createInstance(CI.nsILocalFile);
                file.initWithPath(fp.file.path + extension);
            } else {
                file = fp.file;
            }
            if(getNameNotStream) {
                // Return string
                return file.path;
            } else {
                // Return output stream
                var foStream = CC["@mozilla.org/network/file-output-stream;1"].createInstance(CI.nsIFileOutputStream);
                // 0x02 = Write only
                // 0x08 = create if non existing
                // 0x20 = truncate
                foStream.init(file, 0x02 | 0x08 | 0x20, 0664, null);
                return foStream;
            }
        }
    } catch(e) {
        handleError("saveFileDialog: "+e);
    }
    return false;
}

// Show an 'Open' dialog.
function openFileDialogPlus(windowTitle, filterName, filter) {
    const CC = Components.classes;
    const CI = Components.interfaces;
    var fp = CC["@mozilla.org/filepicker;1"].createInstance(CI.nsIFilePicker);
    fp.init(window, windowTitle, CI.nsIFilePicker.modeOpen);
    if(filterName==false) {
        fp.appendFilters(filter);
        // e.g filter = CI.nsIFilePicker.filterAll
        //            | CI.nsIFilePicker.filterText
        //            | CI.nsIFilePicker.filterXUL
        //            | CI.nsIFilePicker.filterXML
        //            | CI.nsIFilePicker.filterHTML
    } else {
        fp.appendFilter(filterName, filter);
    }
    
    var rv = fp.show();
    if (rv == CI.nsIFilePicker.returnOK) {
        return fp.file.path;
        //var file = fp.file;
        //var ios = CC["@mozilla.org/network/io-service;1"].getService(CI.nsIIOService);
        //var fileHandler = ios.getProtocolHandler("file").QueryInterface(CI.nsIFileProtocolHandler);
        //var URLSpec = fileHandler.getURLSpecFromFile(file);
    } else {
        return false;
    }
}

/*************************************/
// Returns a preference object that allows to extract user preferences.
function getPreferenceObj() {
    return Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
}

// Returns the object representing the language properties file.
function getStringBundleBrand() {
    return document.getElementById('stringbundle-brand');
}

// Shows the progress bar, with a message for the user
function startWaiting(message, mode) {
    showMessage(message);
    var progress = document.getElementById("progressbar");
    progress.setAttribute("mode", mode);
    progress.setAttribute("value", "0%");
    progress.setAttribute("hidden","false");
    document.getElementById("statusicon").hidden = false;
    
    disableInterface(true);
    return progress;
}

function keepWaiting(progress, percentage) {
    progress.setAttribute("value", percentage + "%");
}

// Hides the progress bar
function stopWaiting(progress) {
    progress.setAttribute("hidden", "true");
    showMessage(fontsShown === 1 ? "1 font" : fontsShown + " fonts");
    document.getElementById("statusicon").hidden = true;
    disableInterface(false);
}

// Stops the generation of the font list
function stopProcess() {
    listFontsParam.stop();
}

// Disables or enables the menu's, buttons and shortcut keys
function disableInterface(disable) {
    var mc = document.getElementById("main-commands");
    var children = mc.childNodes;
    for(var i=0; i<children.length; i++) {
        if(children[i].id!="Window:console"
        && children[i].id!="Action:cancel")
            children[i].setAttribute("disabled", disable);
    }
    var tb = document.getElementById("main-toolbar");
    tb.setAttribute("disabled",disable);
}

// Toggles the state of the buttons Bold, Italic and All Caps
function toggleStyle(style) {
    var btn = document.getElementById(style);
    if(btn.getAttribute("checked")=="false") {
        btn.setAttribute("checked", "true");
    } else {
        btn.setAttribute("checked", "false");
    }
    listFontsMaybe();
}

// Returns true if the selected item is a category header rather than a font
function classHeaderSelected() {
    return (getSelectedFont()=="");
}

/*************************************/

function setFontUnderMouse(ix) {
    fontUnderMouse = ix;
}

function tooltipShow() {
    try {
        // If the tooltip is disabled, return false
        // immediately:
        var prefs = getPreferenceObj();
        var notooltip = prefs.getBoolPref("findthatfont.notooltip");
        if(notooltip) {
            return false;
        }
      
        // Get the tooltip object
        var tt = document.getElementById("fonttip-classes");
  
        // Empty the tooltip:
        while(tt.firstChild) {
            tt.removeChild(tt.firstChild);
        }
   
        var i;
        var b=true;
        for(i=0; i<allClasses.length; i++) {
            if(allFonts[fontUnderMouse].isClass(allClasses[i].getNumber())) {
                b=false;
                var lb = document.createElement("label");
                lb.setAttribute("value", allClasses[i].toString());
                tt.appendChild(lb);
            }
        }
        if(b) {
            var lb = document.createElement("label");
            lb.setAttribute("value", "none");
        }
        return true;
    } catch(e) {
        handleError("tooltipShow: "+e);
    }
    return false;
}

/*************************************/
// Fills the dropdown with numbers that represent font sizes.
// Last used font size is automatically remembered by XULRunner.
function fillFontSizeList() {
    try {
        var ml = document.getElementById("fontsizepopup");
        var sizes = new Array(1,4,6,7,8,9,10,11,12,13,14,16,18,20,24,28,36,48,64,72,96);
        
        var i;
        for(i=0; i < sizes.length; i++) {
            var mi = document.createElement("menuitem");        
            mi.setAttribute("label", sizes[i]);
            ml.appendChild(mi);
        }
    } catch(e) {
        handleError("fillFontSizeList: "+e);
    }
}

// Fill the dropdown with the classes, and also fills
// the allClasses array.
function fillFontClassList() {
    try {
        var ml = document.getElementById("fontclasspopup");
        // Clear the dropdown:
        while (ml.hasChildNodes()) {
            ml.removeChild(ml.lastChild);
        }
        
        var i; var j=0;
        
        addClassItem(ml,"All",-1);
        addClassItem(ml,"-",0);
        addClassItem(ml,allClasses[0].toString(),allClasses[0].getNumber());
        addClassItem(ml,"-",0);
        
        for(i=1; i < allClasses.length; i++) {
            if(!allClasses[i].isHidden())
                addClassItem(ml,allClasses[i].toString(),allClasses[i].getNumber());
        }
        addClassItem(ml,"-",0);
        addClassItem(ml,"Uncategorized",-2);
    } catch(e) {
        handleError("fillFontClassList: "+e);
    }
}

function addClassItem(ml, label, val) {
    var mi;
    if(label=="-") {
        mi = document.createElement("menuseparator");
    } else {
        mi = document.createElement("menuitem");
        mi.setAttribute("label", label.left(20)); //+" ("+val+")");
        mi.setAttribute("value", val);
        if(val < 0 || label=="Favorites") {
            var id = false;
            var cl = false;
            if(label=="All") {
                cl = id = "home";
            } else if(label=="Uncategorized") {
                cl = id = "uncat";
            } else if(label=="Favorites") {
                id = "fav";
                cl = "favicon0";
            }
            mi.setAttribute("src",   "chrome://findthatfont/skin/images/"+cl+".png");
            mi.setAttribute("id",    "menuitem-"+id);
            mi.setAttribute("class", "menuitem-iconic");
        }
    }
    ml.appendChild(mi);
}

function selectCategory(cat) {
    var ml = document.getElementById("fontclass");
    if(cat=='home') {
        ml.selectedIndex = 0;
    } else if(cat=='fav') {
        ml.selectedIndex = 2;
    } else if(cat=='uncat') {
        ml.selectedIndex = ml.childNodes[0].childNodes.length-1;
    }
    listFonts();
}

function updateSampleText() {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
    prefs.setCharPref("findthatfont.sampletext",  $('sample-field').value);
    listFontsMaybe();               
}

function search() {
    try {
        var sbar  = document.getElementById("find-field");
        var fname = sbar.value.toLowerCase();
        // Workaround to make last typed value persistant:
        sbar.setAttribute("value", sbar.value);
        
        if(fname.length==0) {
            clearSearch();
            return;
        }
        var progress = startWaiting("Searching...","determined");
        
        var rb = document.getElementById("font-list");
        var children = rb.childNodes;
        var resultcount = 0;
        for(var i=0; i<children.length; i++) {
            var flblb  = children[i].getAttribute("name").toLowerCase();
            var cclass = children[i].getAttribute("class");
            
            if(cclass=="rlitem") {
                if(flblb.length > 0 && flblb.indexOf(fname) == -1) {
                    children[i].setAttribute("hidden","true");
                } else {
                    children[i].setAttribute("hidden","false");
                    resultcount++;
                }
            }
            keepWaiting(progress, 100*i/children.length);
        }
        stopWaiting(progress);
        
        sbar.setAttribute("status", (resultcount === 0 ? "notfound" : ""));
    } catch(e) {
        handleError("search: "+e);
    }
}

function clearSearch() {
    var sbar = document.getElementById("find-field");
    sbar.value="";
    sbar.setAttribute("value", "");
    sbar.setAttribute("status", "");
    listFonts();
}
/**********************************************************/
// Shows a message in the status bar
function showMessage(message) {
    var bar = document.getElementById("statusmessage");
    bar.setAttribute("label",message);
}

// Reports an error message in the debug panel
function handleError(exception) {
    debug(exception);
    try {
        var progress = document.getElementById("progressbar");
        stopWaiting(progress);
    } catch(e) {}
}

// Writes a message to the debug panel
function debug(exception) {
    dump("Error:\n   "+exception + "\nStacktrace:\n" + getCallStack());
}

function dumpError(str) {
  Components.utils.reportError(str);
}

function dump(str) {
  Components.classes['@mozilla.org/consoleservice;1']
            .getService(Components.interfaces.nsIConsoleService)
            .logStringMessage(str);
}

function getCallStack() {
    var stack = Components.stack;
    var out = '';
    var depth = 0;
    while(stack !== null) {
        for(var i=0; i<depth; i++)
            out += ' ';
        if(depth > 1)
            out += stack.toString() + '\n';
        depth++;
        stack = stack.caller;
    }
    return out;
}