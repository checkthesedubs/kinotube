# Changes
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