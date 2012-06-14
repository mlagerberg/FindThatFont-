FindThatFont-
=============

FindThatFont! is a handy tool that allows to preview fonts that are installed on your system and to classify them into over 30 different categories. By using this categorization you can find any font on your system faster than ever before.

Note: Development on FindThatFont! halted after December 2007. It works nicely and is stable, but further development is appreciated. Anyone willing to adopt the project is welcome to do so.

Instructions:
- Download XULRunner (https://developer.mozilla.org/en/XULRunner) and unzip it in the /xulrunner folder. Please note the known issues in this regard.

Known issues:
- There's an issue with non-unicode fonts (like Wingdings) not showing in the app at all
- It was last tested with XULRunner 1.9, while the latest version at time of writing (June 2012) is 14.0.

Other to-dos:
- Interface could use an overhaul.
- Update-urls are still pointing to a website that no longer exists. Update files should be hosted elsewhere.
- There are no build scripts. On every update the following must be done manually:
  - Creating a new version requires using ResHacker on findthatfont.exe to update version number
  - Changing some boolean flags in prefs.js
  - Update version numbers in:
     - application.ini (version and build id)
     - brand.dtd
     - brand.properties (also build id)
     - findthatfont.exe
     - help.html
- App saves ini file more often than necessary. It should only save the ini file when something (either a class or a font) has been changed
- Add better comments/documentation
- Prepare app for localization
- Cache entire 'All classes' xul-code, maybe even inbetween sessions
- Custom update checker should be replaced by Mozillas MAR-file update system
- Add option to view fonts that are not installed. Note: using file.launch() a font file can be opened using the system font viewer, which automatically load the font into memory and allows to use it in other programs (under Windows).
- Add: install and uninstall fonts. Note: copy font file to Windows font folder, and add something to the registry (using a custom XPCOM-element)
