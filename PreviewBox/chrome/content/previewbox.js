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

// Add an event listener to make sure the extension is
// initialized when FtF loads
window.addEventListener("load",   function(e) { PreviewBox.init(); }, false);

// Bundle all functions in an object, for convenience and avoiding conflicts
var PreviewBox = {

    // Called when FindThatFont! loads
    init: function() {
        var rlb = document.getElementById("font-list");
        rlb.setAttribute("onselect", "PreviewBox.updateSampleBox();");
        this.loadChars();
    },
    
    loadChars: function() {
        try {
            var box = document.getElementById("prevb-chars-container");
            var str = "";
            
            // Most common characters
            for(var i=33; i<255; i++) {
                if(i<127 || i>160)
                    str += this.createCharacterCode(i);
            }
            // Greek
            var extraChars = new Array(402,915,916,920,923,926,928,931,933,934,936,937,945,946,947);
            for(var i=0; i<extraChars.length; i++)
                str += this.createCharacterCode(extraChars[i]);
            // More greek
            for(var j=949; j<977; j++)
                str += this.createCharacterCode(j);
            // Euro sign
            str += this.createCharacterCode(8364);
            // Some symbols
            for(var i=9785; i<9831; i++)
                str += this.createCharacterCode(i);
            
            // To be able to use the .innerHTML property,
            // box is defined using an HTML tag rather than XUL
            box.innerHTML = str;
        } catch(e) {
            handleError("PreviewBox.loadChars: " + e);
        }
    },
    
    createCharacterCode: function(i) {
        return '<div class="prevb-character-box">'
             + '<div class="prevb-code">' + i + '</div>'
             // For hex codes  (left out because of too much clutter)
             //+ '<div class="prevb-code">#' + i.toString(16).toUpperCase() + '</div>'
             + '<div class="prevb-character">&#' + i + ';</div>'
             + '</div>';
    },
    
    // Opens the sample box
    showSample: function() {
        var split = document.getElementById("prevb-splitter");
        split.setAttribute("state", "open");
        this.updateSampleBox();
    },

    // Hides the sample box
    hideSample: function() {
        var split = document.getElementById("prevb-splitter");
        split.setAttribute("state", "collapsed");
    },
 
    // Updates the sample box to the selected font
    updateSampleBox: function() {
        // be sure to call the original onselect function:
        if(classHeaderSelected()) return;
        var preview1 = document.getElementById("prevb-preview");
        preview1.setAttribute("style", 'font-family: "'+getSelectedFont()+'";');
        var preview2 = document.getElementById("prevb-chars");
        preview2.setAttribute("style", 'font-family: "'+getSelectedFont()+'";');
    },
    
    // Switches between Lipsum box and Unicode box
    switchMode: function() {
        var mode = document.getElementById("sample-option");
        var preview1 = document.getElementById("prevb-chars");
        var preview2 = document.getElementById("prevb-preview");
        if(mode.value=="1") {
            preview2.setAttribute("hidden", "false");
            preview1.setAttribute("hidden", "true");
        } else {
            preview1.setAttribute("hidden", "false");
            preview2.setAttribute("hidden", "true");
        }
    }
}