FindThatFont-
=============

FindThatFont! is a handy tool that allows to preview fonts that are installed on your system and to classify them into over 30 different categories. By using this categorization you can find any font on your system faster than ever before.

Note: Development on FindThatFont! halted after December 2007. It works nicely and is stable, but (scroll down) further development is appreciated. Anyone willing to adopt the project is welcome to do so.

The project contains an example addon (located in the /PreviewBox folder) that shows a larger preview of the selected font, as a fancy bit of Lipsum, or as a character map.

Instructions
------------
- Download XULRunner (https://developer.mozilla.org/en/XULRunner) and unzip it in the /xulrunner folder. Please note the known issues in this regard.

Known issues
-------------
- There's an issue with non-unicode fonts (like Wingdings) not showing in the app at all
- It was last tested with XULRunner 1.9, while the latest version at time of writing (June 2012) is 14.0.

Other to-dos
-------------
- The lack of OO in the Javascripts will probably make a decent programmer cry a little. Some brave soul should fix this.
- Interface could use an overhaul (although, looks quite nice already, eh?).
- Update-urls are still pointing to a personal website that no longer exists. Update files should be hosted elsewhere.
- There are no build scripts. On every update the following must be done manually:
  - Creating a new version requires using ResHacker on findthatfont.exe to update version number
  - Changing some boolean flags in prefs.js
  - Update version numbers in:
     - application.ini (version and build id)
     - brand.dtd
     - brand.properties (also build id)
     - findthatfont.exe
     - help.html
- App saves ini file more often than necessary. It should only save the ini file when something (either a class or a font) has been changed.
- Add better comments/documentation.
- Prepare app for localization.
- Cache entire 'All classes' xul-code, maybe even inbetween sessions.
- Custom update checker should be replaced by Mozillas MAR-file update system. Or be removed.
- Add option to view fonts that are not installed. Note: using file.launch() a font file can be opened using the system font viewer, which automatically load the font into memory and allows to use it in other programs (under Windows).
- Add: install and uninstall fonts. Note: copy font file to Windows font folder, and add something to the registry (using a custom XPCOM-element).
- Still uses .ini files (old school!). Should use JSON or something more reasonable.


Features
========
- Shows a preview of all fonts installed on your system, either grouped in categories or in alphabetical order
- Extendible through extensions, as easy to install as Firefox extensions
- Classify fonts yourself, in 36 different categories
- You can edit the categories to your own liking
- Long list of fonts already categorised
- Option to hide fonts that you’ll never use
- Create a dynamic short-list of favourites that you want to compare
- Search a font by name
- Print list of fonts on paper
- Export font list to HTML
- Custom sample text, color and font size
- Import and export functionality to transfer categorisations between computers or user-profiles
- Runs on Windows and Linux
