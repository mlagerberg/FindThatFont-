/***
 * This script is included in main.xul
 *
 * Copyright (c) 2007 - Mathijs Lagerberg
 * All rights reserved
 ***/
 
function showAddons() {
    try {
        var t = "extensions";
        var winType = "Extension:Manager";
        var url = "chrome://mozapps/content/extensions/extensions.xul";

        winType += ("-" + t);
        url     += ("?type=" + t);
    
        toOpenWindowByType(winType, url);
        
        /*
        // This also works :)
        const EMURL = "chrome://mozapps/content/extensions/extensions.xul?type=extensions";
        const EMFEATURES = "chrome,menubar,extra-chrome,toolbar,dialog=no,resizable";
        window.openDialog(EMURL, "", EMFEATURES);
        */
    } catch(e) {
        handleError("showAddons: "+e);
    }
}

// Stolen from ChatZilla:
function toOpenWindowByType(inType, url, features) {
    try {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
        var topWindow = wm.getMostRecentWindow(inType);
    
        if(typeof features == "undefined")
            features = "chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar,dependent";
    
        if (topWindow)
            topWindow.focus();
        else
            window.open(url, "_blank", features);
    } catch(e) {
        handleError("toOpenWindowByType: "+e);
    }
}

/*
// Once I have figured out how to create MAR files on a Windows machine,
// this piece of code will open the update window as seen in Firefox.
function checkForUpdates() {
    try {
        var url = "chrome://mozapps/content/update/updates.xul";
        var features = "chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar";
        window.open(url, "_blank", features);
    } catch(e) {
        handleError("checkForUpdates: "+e);
    }
}
*/

function checkForUpdates() {
    window.alert("Updates are no longer distributed through the app. Visit https://github.com/monkeyinmysoup/FindThatFont- to check for updates.");
    //window.openDialog("update.xul", "Update", "chrome,centerscreen,resizable=no,width=400,height=200,dependent");
}