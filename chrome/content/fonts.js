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

var allFonts = [];       // List of all fonts
var defaultFontSize = 9;
var fontsShown = 0;      // number of fonts displayed
var htmlHeader = '<table width="100%" cellspacing="0" cellpadding="4"><tr><th width="10%" class="bottomline dark">&nbsp;</th><th width="30%" class="bottomline dark">Fontname</th><th width="60%" class="bottomline dark">Preview</th></tr>';
                         // TODO Not really a pretty solution. May need some attention in future versions
var progressId;          // ID returned by window.setInterval
var running = false;

const CLASS_ALL   = -1;
const CLASS_UNCAT = -2;
const CLASS_FAV   = -3;
const FAV_NUMBER  = 36;

var listFontsParam = {
    rlb: null,      // = reference to richlistbox
    progressBar: null,
    timeout: 1,
    curClass: 0,
    iterator: 0,
    classes: '',
    style: '',
    sampleText: '',
    displayed: 0,
    progress: 0,
    threadId: 0,
    stopNow: false,
    reset: function(oRlb, oProgressBar, iCurClass, sClasses, sStyle, sSampleText) {
        listFontsParam.rlb        = oRlb;
        listFontsParam.progressBar= oProgressBar;
        listFontsParam.curClass   = iCurClass;
        listFontsParam.iterator   = 0;
        listFontsParam.classes    = sClasses;
        listFontsParam.style      = sStyle;
        listFontsParam.sampleText = sSampleText;
        listFontsParam.progress   = 0;
        listFontsParam.displayed  = 0;
    },
    updateProgress: function() {
        listFontsParam.progress = (100*listFontsParam.iterator)/allClasses.length;
        keepWaiting(listFontsParam.progressBar, listFontsParam.progress);
    },
    showThisClass: function() {
        return ((  listFontsParam.curClass==CLASS_ALL
                || listFontsParam.curClass==allClasses[listFontsParam.iterator].getNumber())
            && !(  listFontsParam.curClass==CLASS_ALL
                && allClasses[listFontsParam.iterator].getNumber()==FAV_NUMBER)
            && !allClasses[listFontsParam.iterator].isHidden());
    },
    start: function() {
        listFontsParam.stopNow = false;
        listFontsParam.threadId = window.setTimeout(listFontsParam.next, listFontsParam.timeout);
    },
    next: function() {
        if(listFontsParam.stopNow) {
            listFontsParam.stopped();
            return;
        }
        if(listFontsParam.showThisClass()) {
            listFontsParam.displayed += listFontsOfClass(
                                            listFontsParam.rlb
                                            , listFontsParam.iterator
                                            , listFontsParam.classes
                                            , listFontsParam.style
                                            , listFontsParam.sampleText);
        }
        listFontsParam.iterator++;
        if(listFontsParam.iterator < allClasses.length) {
            window.setTimeout(listFontsParam.next, listFontsParam.timeout);
            listFontsParam.updateProgress();
        } else {
            listFontsParam.stopped();
        }
    },
    stopped: function() {
        fontsShown = listFontsParam.displayed;
        stopWaiting(listFontsParam.progressBar);
        running = false;
    },
    stop: function() {
        listFontsParam.stopNow = true;
    }
};

// Class representing a font
function Font(fontname) {
    this.name    = fontname;
    this.classes = [];
    this.hidden  = false;
    this.uncat   = true;
    this.index   = 0;
    this.installed = true;
      
    this.toString   = function()  {
        return this.name;
    };
    this.toFile     = function()  {
        return   this.name
            +'='+this.classes.join(',')
            +'|'+(+this.hidden)
            +'|'+(+this.uncat)
            +'|1' //+(+this.installed)
            +'\r\n';
    };
    this.getClassNumbers = function() {
        return this.classes;
    };
    this.init = function(ix) {
        this.classes = new Array(37);
        this.hidden  = false;
        this.uncat   = true;
        this.installed = true;
        this.index   = ix;
    };
    this.setClassesByString  = function(c,ix,syntaxVersion) {
        if(syntaxVersion==1) {
            if(c=="-1") {
                this.hidden = true;
            } else if(c=="-2,-3") {
                this.uncat = true;
                this.classes[FAV_NUMBER] = 1;
            } else if(c=="-2,0") {
                this.uncat = true;
            } else {
                this.classes = c.split(",");
                this.uncat   = false;
                this.hidden  = false;
            }
        } else if(syntaxVersion==2) {
            var params = c.split('|');
            this.classes   = params[0].split(',');
            this.hidden    = (params[1] == '1');
            this.uncat     = (params[2] == '1');
            this.installed = (params[3] == '1');
        } else {
            return false;
        }
        this.index = ix;
        for(var i=0; i<this.classes.length; i++) {
            if(this.classes[i] == 1) {
                var x = getClassByNumber(i);
                if(x)
                    x.addFont(this.index);
            }
        }
        return true;
    };
    this.isClass    = function(c) {
        // Note: this function can also return 'true' if font is hidden!
        if(c==CLASS_ALL) {
            // If c means 'All', then this font is certainly a member
            return true;
        } else if(c==CLASS_UNCAT) {
            return this.uncat;
        }
        if(this.classes.length <= c || c==0)
            return false;
        
        return (this.classes[c]==1);
    };
    this.isUndefined= function() {
        return this.uncat && !this.hidden;
    };
    this.isHidden   = function()  {
        return this.hidden;
    };
    this.setHidden  = function()  {
        this.hidden = true;
    };
    this.isFavorite = function()  {
        return this.isClass(FAV_NUMBER);
    };
    this.setFavorite= function(newFav) {
        this.classes[FAV_NUMBER] = (newFav ? 1 : 0);
        var x = getClassByNumber(FAV_NUMBER);
        if(x) {
            if(newFav)
                x.addFont(this.index);
            else
                x.removeFont(this.index);
        }
    };
    this.resetClass = function()  {
        if(!this.uncat) {
            for(var i=0; i<allClasses.length; i++) {
                var n = allClasses[i].getNumber();
                if(n < this.classes.length && this.classes[n] == 1) {
                    allClasses[i].removeFont(this.index);
                }
                this.classes[allClasses[i].getNumber()] = 0;
            }
        }
        this.hidden = false;
        this.uncat  = true;
    };
    this.addToClass = function(c) {
        if(c!=FAV_NUMBER) {
            this.uncat  = false;
        }
        this.classes[c] = 1;
        var x = getClassByNumber(c);
        if(x)
            x.addFont(this.index);
    };
}

// Returns the name of the font that is currently selected in the richlistitem
function getSelectedFont() {
  try {
      var rlist = document.getElementById("font-list").selectedItem;
      if(rlist) {
          return rlist.getAttribute("name");
      }
  } catch(e) {
      handleError("getSelectedFont: "+e);
  }
  return "";
}

// Reads the fonts from the system and pushes them into the array allFonts.
function readFonts() {
    var langgroup = "";
    var fonttype  = "";
    try {
        var fontList = Components.classes["@mozilla.org/gfx/fontlist;1"].createInstance();
        if (fontList) {
            // Create an enumerator for all the fonts:
            fontList = fontList.QueryInterface(Components.interfaces.nsIFontList);
            var fontEnumerator = fontList.availableFonts(langgroup, fonttype);
            
            if(fontEnumerator.hasMoreElements()) {
                // Cycle through the fonts
                while(fontEnumerator.hasMoreElements()) {
            		    var fontName = fontEnumerator.getNext();
            		    fontName = fontName.QueryInterface(Components.interfaces.nsISupportsString);
            		    allFonts.push(new Font(fontName.toString()));
            		    allFonts[allFonts.length-1].init(allFonts.length-1);
                }
            } else {
                handleError("readFonts: no fonts for the specified constraints.");
            }
      	} else {
            handleError("readFonts: no fontList object.");
        }
    } catch(e) {
        handleError("readFonts: "+e);
    }
}

// Refreshes the font list only if the 'auto refresh' option is checked
function listFontsMaybe() {
    if(document.getElementById("menu-auto-refresh").getAttribute("checked") == "true")
        listFonts();
}

// Refreshes the font list.
function listFonts() {
    if(running) return;
    
    var progressBar = startWaiting("Creating list...", "determined");

    try {
        var rlb = $('font-list');
        
        // If the help file is displayed, hide it
        var deck = $('fonts');
        deck.selectedIndex = 0;
        
        // Get prefered color and sample text
        var prefs = getPreferenceObj();
        var color1     = prefs.getCharPref("findthatfont.forecolor");
        var color2     = prefs.getCharPref("findthatfont.backcolor");
        var sampleText = prefs.getCharPref("findthatfont.sampletext");

        // Create a string that contains the outlook of the sample text in CSS format
        var fontSize    = document.getElementById("fontsize").getAttribute("label");
        var fontBold    = document.getElementById("btnBold").getAttribute("checked");
        fontBold        = (fontBold=="true" ? " sample-bold" : "");
        var fontItalic  = document.getElementById("btnItalic").getAttribute("checked");
        fontItalic      = (fontItalic=="true" ? " sample-italic" : "");
        var fontAllCaps = document.getElementById("btnAllCaps").getAttribute("checked");

        var classes = fontBold+fontItalic;
        var style   = " font-size: "+fontSize+"pt; color: "+color1+"; background-color: "+color2+";";
        
        if(fontAllCaps=="true")
            sampleText = sampleText.toUpperCase();
            
        // Clear the richlistbox:
        while (rlb.hasChildNodes()) {
            rlb.removeChild(rlb.lastChild);
        }
        
        var displayed = 0;
        var group = document.getElementById("menu-group-fonts").getAttribute("checked");
        var curClass = getCurrentClasses();

        if(group=="true") {
            // Display the fonts in groups
            if(curClass==CLASS_UNCAT) {
                fontsShown = listFontsOfClass(rlb, CLASS_UNCAT, classes, style, sampleText);
                stopWaiting(progressBar);
            } else if(curClass!=CLASS_ALL) {
                var j;
                for(j=0; j<allClasses.length; j++) {
                    if(curClass==allClasses[j].getNumber()) {
                        fontsShown = listFontsOfClass(rlb, j, classes, style, sampleText);
                    }
                    keepWaiting(progressBar, (100*j)/allClasses.length);
                }
                stopWaiting(progressBar);
            } else {
                // Start thread manager:
                listFontsParam.reset(rlb, progressBar, curClass, classes, style, sampleText);
                listFontsParam.start();
            }
        } else {
            // Display the fonts not in groups
            var i;
            for(i=0; i<allFonts.length; i++) {
                if(allFonts[i].isClass(curClass)) {
                    rlb.appendChild(newRichListItem(i, classes, style, sampleText));
                    displayed++;
                }
                keepWaiting(progressBar, (100*i)/allFonts.length);
            }
            stopWaiting(progressBar);
        }

        fontsShown = displayed;
    } catch(e) {
        handleError("listFonts: "+e);
        stopWaiting(progressBar);
    }
}


function listFontsOfClass(rlb, curClassIx, classes, style, sampleText) {
    var displayed= 0;
    if(curClassIx==CLASS_UNCAT) {
        for(var i=0; i<allFonts.length; i++) {
            if(allFonts[i].isUndefined() && !allFonts[i].isHidden()) {
                if(displayed==0)
                    rlb.appendChild(newRichListHeader("Uncategorized", "Contains the font that are not classified into any category.", true));
                rlb.appendChild(
                    newRichListItem(
                        i
                        , classes
                        , style
                        , sampleText
                ));
                displayed++;
            }
        }
        if(displayed==0) {
            rlb.appendChild(newRichListHeader("Uncategorized", "Contains the font that are not classified into any category.", false));
        }
    } else {
        var subfontlist = allClasses[curClassIx].fonts;
        for(var i=0; i<subfontlist.length; i++) {
            if(allFonts[subfontlist[i]].isHidden())
                continue;
            if(displayed==0)
                rlb.appendChild(
                    newRichListHeader(
                        allClasses[curClassIx].toString()
                        , allClasses[curClassIx].getDescription()
                        , true
                ));
            rlb.appendChild(
                newRichListItem(
                    subfontlist[i]
                    , classes
                    , style
                    , sampleText
            ));
            displayed++;
        }
        if(displayed==0) {
            rlb.appendChild(
                newRichListHeader(
                    allClasses[curClassIx].toString()
                    , allClasses[curClassIx].getDescription()
                    , false
            ));
        }
    }
    return displayed;
}

// Returns a category header to be added to the richlistbox
function newRichListHeader(classname, tooltiptext, isBlue) {
    var richitem = document.createElement("richlistitem");
    richitem.setAttribute("name","");
    richitem.setAttribute("tooltiptext", tooltiptext);
    if(isBlue) {
        richitem.setAttribute("class",   "rlhead");
    } else {
        richitem.setAttribute("class",   "rlempty");
    }    
    
    var descr1 = document.createElement("label");
    descr1.setAttribute("class", "font-head");
    descr1.setAttribute("value", classname);
    
    richitem.appendChild(descr1);
    return richitem;
}

// Returns a single font to be added to the richlistbox
function newRichListItem(fontix, classes, style, sampleText) {
    var fontname = allFonts[fontix].toString();
    var richitem = document.createElement("richlistitem");
    richitem.setAttribute("name", fontname);
    richitem.setAttribute("class",   "rlitem");
    richitem.setAttribute("context", "fontlist-popup");
    richitem.setAttribute("tooltip", "fonttip");
    richitem.setAttribute("onmouseover", "setFontUnderMouse("+fontix+");");
    
    var vbox   = document.createElement("vbox");
    var descr1 = document.createElement("label");
    descr1.setAttribute("class", "font-name");
    descr1.setAttribute("value", fontname);
    
    var hbox   = document.createElement("hbox");
    var descr2 = document.createElement("label");
    descr2.setAttribute("class", "sample"+classes);
    descr2.setAttribute("style", 'font-family: "'+fontname+'";'+style );
    descr2.setAttribute("value", sampleText);
    descr2.setAttribute("flex",    "1");
    
    var fav    = document.createElement("toolbarbutton");
    fav.setAttribute("class",       "fav");
    fav.setAttribute("tooltiptext", "Add to/remove from favorites");
    fav.setAttribute("oncommand",   "toggleFavorite("+fontix+",this); event.stopPropagation();");
    fav.setAttribute("ondblclick",  "event.stopPropagation();");
    fav.setAttribute("add",         (allFonts[fontix].isFavorite() ? "0" : "1"));
    
    hbox.appendChild(fav);
    hbox.appendChild(descr2);
    vbox.appendChild(descr1);
    vbox.appendChild(hbox);
    richitem.appendChild(vbox);

    return richitem;
}

// Same as listFonts, but instead of adding items to a richlist, it
// return a string wich is an HTML representation of the font list.
function listFontsText(templateName) {
    var progress   = startWaiting("Creating list...", "determined");
    var result = "";
    try {

        var prefs = getPreferenceObj();
        var sampleText = prefs.getCharPref("findthatfont.sampletext");

        var fontSize    = document.getElementById("fontsize").getAttribute("label");
        var fontBold    = document.getElementById("btnBold").getAttribute("checked");
        fontBold        = (fontBold=="true" ? " sample-bold" : "");
        var fontItalic  = document.getElementById("btnItalic").getAttribute("checked");
        fontItalic      = (fontItalic=="true" ? " sample-italic" : "");
        var fontAllCaps = document.getElementById("btnAllCaps").getAttribute("checked");

        var classes = fontBold+fontItalic;
        var style   = " font-size: "+fontSize+"pt;";
        
        if(fontAllCaps=="true")
            sampleText = sampleText.toUpperCase();
        
        var displayed = 0;
        var template = getAppPath();
        if(template.search(/\\/) != -1)
            template += "chrome\\content\\" + templateName + ".html";
        else
            template += "chrome/content/" + templateName + ".html";
        result       = readFile(template);
        var group = document.getElementById("menu-group-fonts").getAttribute("checked");
        var curClass = getCurrentClasses();

        if(group=="true") {
            // Display the fonts in groups
            if(curClass==CLASS_UNCAT) {
                // List uncategorized fonts
                var resultTemp="";
                for(var i=0; i<allFonts.length; i++) {
                    if(allFonts[i].isUndefined() && !allFonts[i].isHidden()) {
                        displayed++;
                        resultTemp += newHTMLItem(allFonts[i].toString(), displayed, classes, style, sampleText);
                    }
                }
                if(displayed>0) {
                    result += '<h2>Uncategorized</h2>'+htmlHeader;
                    result += resultTemp;
                    result += '</table>';
                }
            } else {
              // List only one class, or all classes
                var j;
                for(j=0; j<allClasses.length; j++) {
                    if((curClass==CLASS_ALL || curClass==allClasses[j].getNumber())
                    && !(curClass==CLASS_ALL && allClasses[j].getNumber() == FAV_NUMBER)
                    && !allClasses[j].isHidden()) {
                        var dispTemp = 0;
                        var resultTemp="";
                        
                        var subfontlist = allClasses[j].fonts;
                        for(var i=0; i<subfontlist.length; i++) {
                            if(!allFonts[subfontlist[i]].isHidden()) {
                                dispTemp++;
                                resultTemp += newHTMLItem(allFonts[subfontlist[i]].toString(), displayed+dispTemp, classes, style, sampleText);
                            }
                        }
                        
                        if(dispTemp>0) {
                            displayed += dispTemp;
                            result += '<h2>'+allClasses[j].toString()+'</h2>'+htmlHeader;
                            result += resultTemp;
                            result += '</table>';
                        }
                    }
                }
            }
        } else {
          // Do not group the fonts
            result += htmlHeader;
            var i;
            for(i=0; i<allFonts.length; i++) {
                if(allFonts[i].isClass(curClass)) {
                    displayed++;
                    result += newHTMLItem(allFonts[i].toString(), displayed, classes, style, sampleText);
                }
            }
            result += '</table>';
        }

        result += '</body></html>';
        result = result.replace(/{PROGRAM}/g, getStringBundleBrand().getString('brandFullName'))
                       .replace(/{LINK}/g, getStringBundleBrand().getString('appUrl'))
                       .replace(/{DATE}/g, new Date())
                       .replace(/{FONTSIZE}/g, fontSize);
        
        fontsShown = displayed;
    } catch(e) {
        handleError("listFontsText: "+e);
        result = "Error: "+e;
    }
    stopWaiting(progress);
    return result;
}

// Returns a string that represents a single font, in HTML format.
function newHTMLItem(fontname, count, classes, style, sampleText) {
    var result = '<tr>'
       +'<td class="mid font fontsize" valign="top">'+count+'</td>'
       +'<td class="light font fontsize" valign="top">'+fontname+'</td>'
       +'<td class="mid fontsize center"><span class="fs '+classes+'" style="font-family: \''+fontname+'\';'+style+'">'
       +sampleText+'</span></td>'
       +'</tr>';
    return result;
}

// Finds font 'name' in allFonts between item index p and q,
// (in O(log n) time since allFonts is sorted)
function findFont(fontname, p, q) {
  try {
    if(p==q) {
        if(allFonts[p].toString()==fontname) {
            return p;
        } else {
            return -1;
        }
    }
    
    var i=Math.floor((p+q)/2);
    if(fontname < allFonts[i].toString()) {
        return findFont(fontname, p, i);
    } else if(fontname > allFonts[i].toString()) {
        return findFont(fontname, i+1, q);
    } else {
        return i;
    }
  } catch(e) {
      handleError("findFont["+fontname+","+p+","+q+"] "+e);
      return -1;
  }
}

function toggleFavorite(fontix, button) {
    allFonts[fontix].setFavorite(!allFonts[fontix].isFavorite());
    button.setAttribute("add", (allFonts[fontix].isFavorite() ? "0" : "1"));
}
