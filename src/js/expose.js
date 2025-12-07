// Expose internal functions here for developers/external addons
// Don't really have any particular use for this yet though

import { applyTheme } from "./ui/themes";
import { addTabsToModal } from "./ui/ui";

window.CLIENT.Nexus.fn.addTabsToModal = addTabsToModal;
window.CLIENT.Nexus.fn.applyTheme = applyTheme;