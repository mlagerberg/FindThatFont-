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

 
var allClasses = [];

// Class representing a category
function FontClass(classname, number, description) {
    this.name   = classname;
    this.number = number-1;
    this.description = description;
    this.fonts  = [];
    this.toString  = function() {return this.name;};
    this.toFile    = function() {
        return this.toString().replace('|','&#124;')
          + '|'
          + this.getDescription().nl2br().replace('|','&#124;')
          + '|'
          + (this.isHidden() ? 1 : 0)
          + '\r\n';
    };
    this.getNumber = function() {return this.number;};
    this.getDescription = function() {return this.description;};
    this.hidden = false;
    
    this.addFont    = function(fontIndex) {
        if(this.fonts.in_array(fontIndex) != -1)
            return;
        this.fonts.insertSorted(allFonts, fontIndex);
    };
    this.removeFont = function(fontIndex) {
        var x = this.fonts.in_array(fontIndex);
        if(x==-1) return;
        this.fonts.splice(x,1);
    };
    
    this.setName        = function(classname)   { this.name = classname;};
    this.setDescription = function(description) { this.description = description; };
    this.isHidden       = function()            { return this.hidden;};
    this.setHidden      = function(hidden)      { this.hidden = hidden;};
}

// Returns the category currently selected in the drop down
function getCurrentClasses() {
    var dd = document.getElementById("fontclass");
    var cl = dd.getAttribute("value");
    return cl;
}

function getClassByNumber(number) {
    for(var i=0; i<allClasses.length; i++) {
        if(allClasses[i].getNumber() == number)
            return allClasses[i];
    }
    return false;
}

function initAllClasses() {
    allClasses = getAllClasses();
}

function getAllClasses() {
    var l =
    [
    new FontClass("Favorites",37,"Special class to which you can add typefaces you want to remember"),
    new FontClass("Art Nouveau",15,"Curly Art Nouveau / Jugenstil typefaces"),
    new FontClass("Branded",17,"Imitations of brand names, movie posters and logos"),
    new FontClass("Brush",35,"Typefaces that appear to have been painted with a brush"),
    new FontClass("Calligraphic",3,"Lettering drawn with a flat-tipped pen"),
    new FontClass("Capitals",27,"Typefaces that contain no lower case letters"),
    new FontClass("Celtic",4,"Old characters with celtic decorations"),
    new FontClass("Children",16,"Shiny happy fonts for kids stuff"),
    new FontClass("Comic",5,"The ones you find in text balloons, and for 'KA-POW!', 'ZZZAP!' and 'CRACK!'"),
    new FontClass("Condensed",24,"Characters that are narrow in proportion"),
    new FontClass("Curly",6,"Decorative fonts with lots of curls"),
    new FontClass("Decorative",31,"Decorated fonts with often unusual shapes and characteristics"),
    new FontClass("Dingbats",7,"Not for letters, but for icons, bullets and pictograms"),
    new FontClass("Disco",8,"The 70's. Yeah baby, yeah!"),
    new FontClass("Distorted",32,"Characters that are strained or twisted out of natural shape"),
    new FontClass("Extended",33,"Characters that are wide in proportion"),
    new FontClass("Foreign looking",12,"Typefaces that resemble characters from foreign languages, but aren't"),
    new FontClass("Futuristic",10,"Spacy and speedy"),
    new FontClass("Geometric",34,"Characters built of simple geometric shapes"),
    new FontClass("Gothic",11,"Calligraphic types based on medieval manuscript lettering"),
    new FontClass("Grafitti",2,"Typesfaces resembling spraypaintings and grafitti"),
    new FontClass("Grunge",21,"Grungy and smudgy fonts"),
    new FontClass("Handwritten",13,"Typefaces that appear to have been written by hand"),
    new FontClass("Heavy",14,"Fat fonts"),
    new FontClass("Holidays",9,"Related to christmas, halloween, valentine's, et cetera"),
    new FontClass("Initials",28,"Typefaces that only contain decorated capitals"),
    new FontClass("Inline",36,"Typefaces with a highlight running through each letter"),
    new FontClass("Monospaced",18,"Typewriter-like fonts where all characters have the same width"),
    new FontClass("Objects",19,"Characters in the shapes of objects"),
    new FontClass("Old",1,"Typefaces with an historical touch"),
    new FontClass("Old school",30,"Retro fonts from the 1980s and 1990s"),
    new FontClass("Pixel",20,"Blocky pixel or LCD based fonts"),
    new FontClass("Sans serif",23,"Typefaces without serifs"),
    new FontClass("Serif",22,"Typefaces with serifs"),
    new FontClass("Stencil",29,"Fonts with a stencilled appearance and gaps running through each letter."),
    new FontClass("Typewriter",25,"Typefaces that resemble antique typewriters"),
    new FontClass("Western",26,"Fonts that look good above saloon doors")
    ];
    // Highest number: 37 (Favorites)
    
    return l;
}
