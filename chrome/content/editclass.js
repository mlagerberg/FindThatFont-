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

var selected =  -1;

function initDropDown() {
    var ml = document.getElementById("classes");
    var mp = document.getElementById("classespopup");
    var i;
    
    selected = opener.getCurrentClasses();
    
    for(i=1; i < opener.allClasses.length; i++) {
        opener.addClassItem(mp,opener.allClasses[i].toString(),opener.allClasses[i].getNumber());
        if(opener.allClasses[i].getNumber() == selected) {
            ml.selectedIndex = i-1;
            selected = 1000;
        }
    }
    if(selected < 1000)
        ml.selectedIndex = 0;

    select(false);
}

function reset() {
    select();
}

function restore() {
    var original = opener.getAllClasses();
    opener.allClasses[selected+1].setName(original[selected+1].toString());
    opener.allClasses[selected+1].setDescription(original[selected+1].getDescription());
    opener.allClasses[selected+1].setHidden(original[selected+1].isHidden());
    select();
}

function save() {
    var obj  = document.getElementById("class-name");
    var obj2 = document.getElementById("class-desc");
    var obj3 = document.getElementById("class-hidden");
    
    var selClass = opener.allClasses[selected+1];
    selClass.setName(obj.value);
    selClass.setDescription(obj2.value);
    selClass.setHidden(obj3.checked);
}

function select() {

    var ml   = document.getElementById("classes");
    var obj  = document.getElementById("class-name");
    var obj2 = document.getElementById("class-desc");
    var obj3 = document.getElementById("class-hidden");

    selected = ml.selectedIndex;
    var selClass = opener.allClasses[selected+1];
    obj.value    = selClass.toString();
    obj2.value   = selClass.getDescription();
    obj3.checked = selClass.isHidden();
}

function changed(disable) {
    var btn = document.getElementById("resetbutton");
    btn.disabled = disable;
}