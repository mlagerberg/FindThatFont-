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

// Startup window
pref("toolkit.defaultChromeURI",    "chrome://findthatfont/content/main.xul");

// Settings
pref("findthatfont.forecolor",      "#000000");
pref("findthatfont.backcolor",      "#FFFFFF");
pref("findthatfont.sampletext",     "My Faxed Joke Won A Pager In A Cable TV Quiz Show");
pref("findthatfont.notooltip",      true);
pref("findthatfont.toolbartext",    false);

// Debugging                                        // Release:         Debugging:
pref("findthatfont.showdebugging",          false); // false            true
pref("javascript.options.showInConsole",    true);  // true             true
pref("javascript.options.strict",           false); // false            true
pref("nglayout.debug.disable_xul_cache",    false); // false            true
pref("nglayout.debug.disable_xul_fastload", false); // false            true
pref("browser.dom.window.dump.enabled",     false); // false            false

// Extension manager
pref("xpinstall.dialog.confirm",                "chrome://mozapps/content/xpinstall/xpinstallConfirm.xul");
pref("xpinstall.dialog.progress.skin",          "chrome://mozapps/content/extensions/extensions.xul?type=themes");
pref("xpinstall.dialog.progress.chrome",        "chrome://mozapps/content/extensions/extensions.xul?type=extensions");
pref("xpinstall.dialog.progress.type.skin",     "Extension:Manager-themes");
pref("xpinstall.dialog.progress.type.chrome",   "Extension:Manager-extensions");
pref("extensions.update.enabled",       true);
pref("extensions.update.notifyUser",    true);
pref("extensions.update.interval",      86400);
pref("extensions.dss.enabled",          false);
pref("extensions.dss.switchPending",    false);
pref("extensions.ignoreMTimeChanges",   false);
pref("extensions.logging.enabled",      false);
pref("general.skins.selectedSkin",      "classic/1.0");
pref("extensions.update.url",           "chrome://findthatfont/locale/findthatfont.properties");
pref("extensions.getMoreExtensionsURL", "chrome://findthatfont/locale/findthatfont.properties");
pref("extensions.getMoreThemesURL",     "chrome://findthatfont/locale/findthatfont.properties");

// Application updates:
pref("app.update.enabled",  false);
pref("app.update.auto",     false);

// Defines how the Application Update Service notifies the user about updates:
// AUM Set to:        Minor Releases:     Major Releases:
// 0                  download no prompt  download no prompt
// 1                  download no prompt  download no prompt if no incompatibilities
// 2                  download no prompt  prompt
//
// See chart in nsUpdateService.js.in for more details
//
/*
pref("app.update.mode",         1);
pref("app.update.silent",       false);
pref("app.update.url",          "http://mathijs.jurresip.nl/xul/findthatfont/update.xml");
pref("app.update.url.manual",   "http://mathijs.jurresip.nl/findthatfont");
pref("app.update.url.details",  "http://mathijs.jurresip.nl/findthatfont/releases");
pref("app.update.url.override", "file://");
*/
// Interval: Time between checks for a new version (in seconds)
//           default=1 day
pref("app.update.interval", 86400);
// Interval: Time before prompting the user to download a new version that 
//           is available (in seconds) default=1 day
pref("app.update.nagTimer.download", 86400);
// Interval: Time before prompting the user to restart to install the latest
//           download (in seconds) default=30 minutes
pref("app.update.nagTimer.restart", 1800);
// Interval: When all registered timers should be checked (in milliseconds)
//           default=5 seconds
pref("app.update.timer", 600000);

// Whether or not we show a dialog box informing the user that the update was
// successfully applied. This is off in Firefox by default since we show a 
// upgrade start page instead! Other apps may wish to show this UI, and supply
// a whatsNewURL field in their brand.properties that contains a link to a page
// which tells users what's new in this new update.
pref("app.update.showInstalledUI", true);

// 0 = suppress prompting for incompatibilities if there are updates available
//     to newer versions of installed addons that resolve them.
// 1 = suppress prompting for incompatibilities only if there are VersionInfo
//     updates available to installed addons that resolve them, not newer
//     versions.
pref("app.update.incompatible.mode", 0);
