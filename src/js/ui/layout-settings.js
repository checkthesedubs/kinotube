import { ChatWidthSize, NavbarSize, ChatSize, ChatAvatarSize, PageSide, ChatHeaderSize, ChatFooterSize} from "../enum";
import { addTabsToModal, updateLayoutSettings, createFormSelectionOption, createFormCheckboxOption } from "./ui";

function onChange(e, key) {
	if (!e.originalEvent.isTrusted) return;
	if (e.target.type === "checkbox")
		SETTINGS[key] = this.checked;
	else
		SETTINGS[key] = this.value;
	updateLayoutSettings();
}

const BODY_layout = $("<form/>", {class: "form-horizontal"})
	.append(createFormSelectionOption("opt-layout-navsize", "Navbar Size", NavbarSize, "navbarSize", onChange))
	.append(createFormSelectionOption("opt-layout-chatw", "Chat Width", ChatWidthSize, "chatWidthSize", onChange))
	.append(createFormSelectionOption("opt-layout-chattext", "Chat Text Size", ChatSize, "chatTextSize", onChange))
	.append(createFormSelectionOption("opt-layout-chatava", "Chat Avatar Size", ChatAvatarSize, "chatAvatarSize", onChange))
	.append(createFormSelectionOption("opt-layout-chatside", "Chat Side", PageSide, "chatSide", onChange))
	.append(createFormSelectionOption("opt-layout-chathdr", "Chat Header Size", ChatHeaderSize, "chatHeaderSize", onChange))
	.append(createFormSelectionOption("opt-layout-chatftr", "Chat Footer Size", ChatFooterSize, "chatFooterSize", onChange))
	.append(createFormCheckboxOption("opt-layout-chatemsize", "Small Emotes", "chatSmallEmotes", onChange));

addTabsToModal("scriptsettings",
	[
		{
			text: "Layout",
			id: "opt-customlayout",
			body: BODY_layout,
			body_title: "Layout Settings"
		}
	]
)