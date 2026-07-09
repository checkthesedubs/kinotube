# Changes
### 0.0.30
- Added a changelog button.
- The chat can now be resized by dragging the side. It will snap at 350px (default size) unless CTRL is held. The Chat Width option in the Layout settings has been removed in favor of this.
- NND has a new option to show usernames with each message, which is disabled by default.
- Thanks to Google shutting down their Tenor search API, Tenor search has been replaced with KLIPY. Favorites and direct links to Tenor GIFs can still be posted in chat if the channel still has chat filters set up for them.
	- While not really recommended, channel admins can optionally provide their own KLIPY key in channel JS with: `window.api_keys = { klipy: "key" }`. This makes it way easier for people to find your key though.
- Some channel settings will now be reprocessed whenever channel admins update the channel JS or CSS, including: external themes, theme overrides, navbar channel text (top left), and background image. Changes to these options should immediately take effect without requiring users to refresh the page.
- Added a button in GIF settings to "import" favorites from older versions (pre-0.0.30) of Kinotube.
	- This is only relevant if you add new GIFs to your favorites list in other channels that use old versions of Kinotube.
	- At some point in the future, this will be done automatically, and your old favorites list (and this button) will be removed.
- Some small tweaks and fixes.
### 0.0.29
- Added a "minimize" button to active polls.
- Added an option under the General tab in Script Settings to filter profile image links based on a list of valid image hosts, which is on by default.
	- A list of valid image hosts can be viewed from the settings menu.
- Fixed some small visual issues.
- Added colored outlines to fx/overlay emotes in the regular emote list.
- Fixed some small issues pertaining to private messages.
- Added warning to the GIF Search menu, informing of Google's decision to shut down Tenor's search API.
- Improved chat history handling a bit.
### 0.0.28
- Made some visual adjustments to polls.
- Fixed `_last_version`, but it is still unused at the moment.
- Moved theme CSS files into `css/themes` to reduce clutter.
- Added a poll feature that allows highlighting more than one top option.
	- Include `[h#]` anywhere in the title of the poll to use this feature. `#` can be any positive number, and this number is the amount of options that will be highlighted. If multiple options are tied, they will all count as one option and will be highlighted differently.
### 0.0.27
- Added a Christmas theme!
- Added a script option, `ExternalThemes`, which allows external CSS themes to be added by channel owners.
	- Check out the [example](#externalthemes-example) below to see what it should look like.
- Added a few options in the Layout tab:
	- `Chat Header Size` can make the section above chat a bit smaller, or disable it. If disabled, it will be replaced with a tiny user counter which can be clicked to toggle the userlist.
	- `Chat Footer Size` will adjust the size of the area beneath the chat.
	- `Small Emotes` halves the maximum width/height of emotes.
- Added per-room persistent setting `lastForcedTheme` which remembers the last theme ID that was forced on you (from `window.ThemeOverride`).
- If `window.ThemeOverride` matches `lastForcedTheme`, it will no longer forcibly change your theme.
	- Theme override will still work, but this means that refreshing the page or revisiting the room won't reset your preferred theme again as long as the overriding theme ID hasn't changed.
	- This should allow users to change their preferred theme while still allowing the channel owner to force different room themes.
- Added `Ctrl+S` keybind to open the Script Settings.
- Various small adjustments to UI details.
- Changed the name of the AFK button's active class from `.active` to `.afkactive` to avoid unnecessary Bootstrap rules.
- Removed fx_preview_img from the global cache since it currently only has one use. The image was moved to [FXEmoteList.js](./src/js/classes/FXEmoteList.js).
- Removed embedded emote_fx.css to reduce script size and avoid redundancy. It should be `@import`ed in the channel CSS instead as it's intended to be usable by users who don't want to use JS.

### ExternalThemes example
```js
window.ExternalThemes = {
	"custtheme_test": {display_name: "Test", cssLink: "css link goes here"},
	"custtheme_test2": {display_name: "Test 2", author: "User", cssLink: "css link goes here too"},
}
```
This should be placed at any point before the script gets loaded. The `author` key is optional, as is the `display_image` key (which isn't used anyway and will probably get removed from themes in the future).  
Currently, when the script loads, it will process this object one time. If this object is changed, it will not take effect for users that were already in the room until they refresh the page.