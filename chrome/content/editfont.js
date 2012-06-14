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

var prefs;
var loadedFont = -1;
var nextButton;
var prevButton;
var ml;
var hiddenStyle = "color: gray; text-decoration: line-through;";
var uncatStyle  = "color: gray;";

// Saves the changes made to the last selected font
function doSave() {
    try {
        saveChanges(ml.getAttribute("value"));
    } catch(e) {
        opener.handleError("doSave: "+e);
    }
    return true;
}

// Saves the changes made to the font with the specified index
function saveChanges(font_id) {
    try {
        // Get a reference to the menuitem:
        var mi = document.getElementById("mi_"+font_id);
        
        // add the font to all selected classes
        var fav = opener.allFonts[font_id].isFavorite();
        opener.allFonts[font_id].resetClass();
        if(fav) {
           opener.allFonts[font_id].setFavorite(fav);
        }
        var i;
        for(i=1; i<opener.allClasses.length; i++) {
            var n  = opener.allClasses[i].getNumber();
            var cb = document.getElementById("number"+n);
            if(cb.getAttribute("checked")=="true") {
                opener.allFonts[font_id].addToClass(n);
            }
        }
        
        if(document.getElementById("option-exclude").checked) {
            // Set Hidden if the 'exclude' option is checked
            opener.allFonts[font_id].setHidden();
            mi.setAttribute("style", hiddenStyle);
        } if(opener.allFonts[font_id].isClass(0)) {
            // Make entry gray when no classes selected
            mi.setAttribute("style", uncatStyle);
        } else {
            mi.setAttribute("style","");
        }
    } catch(e) {
        opener.handleError("saveChanges: "+e);
    }
}

// Selects the next or the previous font
function fontGo(step) {
    if(step==0)
        return;
    if(step<0) {
        if(prevButton.getAttribute("disabled")=="true")
            return;
        ml.selectedIndex--;
    } else {
        if(nextButton.getAttribute("disabled")=="true")
            return;
        ml.selectedIndex++;
    }
    updateSample();
}

// Fills the dropdown with all available fonts
function fillEditFonts() {
    try {
        prefs          = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
        var mp         = document.getElementById("fontspopup");
        ml             = document.getElementById("fonts");
        var selFont    = opener.getSelectedFont();
        
        // Fill the dropdown with all fonts:
        var selIndex   = 0;
        var i;
        for(i=0; i < opener.allFonts.length; i++) {
            var mi = document.createElement("menuitem");
            mi.setAttribute("label", opener.allFonts[i].toString());
            mi.setAttribute("id", "mi_"+i);
            mi.setAttribute("value", i);
            if(selFont == opener.allFonts[i])
                selIndex = i;
                
            // Uncategorized and hidden fonts are displayed in gray.
            // On top of that, hidden fonts are striked through.
            if(opener.allFonts[i].isHidden()) {
                mi.setAttribute("style",hiddenStyle);
            } else if(opener.allFonts[i].isUndefined()) {
                mi.setAttribute("style",uncatStyle);
            }
            
            mp.appendChild(mi);
        }

        // Save references to next and previous button:
        nextButton = document.getElementById("Action:next");
        prevButton = document.getElementById("Action:previous");
        
        // Put this before the previous two lines, and things will go weird :S
        ml.selectedIndex = selIndex;

        // Update the sample text:
        updateSample();
    } catch(e) {
        opener.handleError("fillEditFonts: "+e);
    }
}

// Updates the preview box
function updateSamples(font) {
    var sampleText = prefs.getCharPref("findthatfont.sampletext");
    var fontsizes  = new Array(12,18,24,36,48,60,72);
    for(var i=0; i < fontsizes.length; i++) {
        var st = document.getElementById("sample-label-" + fontsizes[i]);
        st.setAttribute("value", sampleText);
        st.setAttribute("style", 'font-family: "'+font+'"; font-size: '+fontsizes[i]+'pt;');
    } 
}

// Updates the interface (next & previous button, and calls updateSamples and updateBoxes)
function updateSample() {
    try {
        var font   = ml.getAttribute("label");
        var fontid = ml.getAttribute("value");
        if(fontid!=loadedFont) {
            if(loadedFont!=-1)
                saveChanges(loadedFont);
            loadedFont = fontid;
        }
        if(ml.selectedIndex==0) {
            nextButton.setAttribute("disabled", "false");
            prevButton.setAttribute("disabled", "true");
        } else if(ml.selectedIndex==opener.allFonts.length-1) {
            nextButton.setAttribute("disabled", "true");
            prevButton.setAttribute("disabled", "false");
        } else {
            nextButton.setAttribute("disabled", "false");
            prevButton.setAttribute("disabled", "false");
        }
        
        updateSamples(font);
        updateBoxes(ml.getAttribute("value"));
    } catch(e) {
        opener.handleError("updateSample: "+e);
    }
}

// Updates the states of the checkboxes when a new font is loaded.
function updateBoxes(font_id) {
    var cb = document.getElementById("option-exclude");
    cb.setAttribute("checked", opener.allFonts[font_id].isHidden());
    
    for(var i=1; i<opener.allClasses.length; i++) {
        var n = opener.allClasses[i].getNumber();
        cb = document.getElementById("number"+n);
        cb.checked = opener.allFonts[font_id].isClass(opener.allClasses[i].getNumber());
        cb.disabled = opener.allFonts[font_id].isHidden();
    }
}

// Creates the checkboxes when the window is loaded.
function createBoxes() {
    try {
        // Create all checkboxes (one for each font class)
        var box   = document.getElementById("box-classes");
        var addTo = document.createElement("vbox");
        var i;
        var j=0;
        for(i=1; i < opener.allClasses.length; i++) {
            var n = opener.allClasses[i].getNumber();
            if(j%12 == 0) {
                box.appendChild(addTo);
                addTo = document.createElement("vbox");
            }
            var cb = document.createElement("checkbox");
            cb.setAttribute("label", opener.allClasses[i].toString().left(20));
            cb.setAttribute("id", "number"+n);
            cb.setAttribute("tooltiptext", opener.allClasses[i].getDescription());
            if(opener.allClasses[i].isHidden()) {
                cb.setAttribute("hidden", "true");
            } else {
                j++;
            }
            
            addTo.appendChild(cb);
        }
        box.appendChild(addTo);
    } catch(e) {
        opener.handleError("fillEditFonts: "+e);
    }
}

// Enables or disables the states of the checkboxes when
// the user toggles the 'exclude' option.
function enableBoxes() {
    var hidden = document.getElementById("option-exclude").checked;
    for(var i=1; i<opener.allClasses.length; i++) {
        if(!opener.allClasses[i].isHidden()) {
            var n = opener.allClasses[i].getNumber();
            var cb = document.getElementById("number"+n);
            cb.setAttribute("disabled", hidden);
        }
    }
}
