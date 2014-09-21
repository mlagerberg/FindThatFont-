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
 
function $(id) {
    return document.getElementById(id);
}

// Returns true if array contains specified element, false otherwise
Array.prototype.in_array = function(element) {
    for(var keys in this) {
        if(this[keys] == element) {
            return keys;
        }
    }
    return -1;
};

// Inserts an element at specified index 
Array.prototype.insert = function (index,value){
    this.splice(index,0,value);
};

// Searches for the right post to insert element into the array
Array.prototype.searchIndex = function(refArray, element, left, right) {
    if(right-left < 2) {
        if(refArray[this[right]] < refArray[element]) {
            return right;
        } else {
            if(refArray[this[left]] > refArray[element]) {
                return left-1;
            } else {
                return left;
            }
        }
    } else {
        var x = parseInt((right+left)/2);
        if(refArray[this[x]] < refArray[element]) {
            return this.searchIndex(refArray, element, x, right);
        } else if(refArray[this[x]] > refArray[element]) {
            return this.searchIndex(refArray, element, left, x);
        } else {
            return x;
        }
    }
};

// Inserts an element at the right spot in a sorted array
Array.prototype.insertSorted = function(refArray, value) {
    var x = -1;
    if(this.length !== 0) {
        //dump("searchIndex("+value+"["+refArray[value]+"],0,"+(this.length-1)+")   ... this.length="+this.length);
        x = this.searchIndex(refArray, value, 0, this.length-1);
    }
    this.insert(x+1, value);
};

// Returns first x characters of a string, followed by '...'
String.prototype.left = function(count) {
    if(count <= 0)
        return "";
    else if(count <= 3)
        return this.substring(0, count);
    else if(count > this.length)
        return this;
    else
        return this.substring(0, count-3) + "...";
};

String.prototype.nl2br = function() {
    var text = escape(this);
    var re_nlchar;
    if(text.indexOf('%0D%0A') > -1) {
        re_nlchar = /%0D%0A/g ;
    } else if(text.indexOf('%0A') > -1) {
        re_nlchar = /%0A/g ;
    } else if(text.indexOf('%0D') > -1) {
        re_nlchar = /%0D/g ;
    }
    return unescape(text.replace(re_nlchar,'<br />'));
};

String.prototype.br2nl = function() {
    return this.replace(/\<br\ \/\>/g,'\n');
};