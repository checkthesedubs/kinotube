export const ChatCommands = {};

// alias -> real command name
export const ChatCommandAliases = {
	"!choose":"!pick",
	"!ask" 	 :"!8ball",
	"!sm" 	 :"!emote",
	"!d" 	 :"!dice"
}

export class ChatCommand {

	constructor(name, description, action, reqPerms) {

		if (typeof (name) != "string" || name.trim() == "") throw new Error("Command: name must be a non-empty string!");
		if (typeof (description) != "string") throw new Error("Command: description must be a string!");
		if (typeof (action) != "function") throw new Error("Command: action must be a function!");
		if (reqPerms) {
			if (!(typeof (reqPerms) == "string" || Array.isArray(reqPerms))) {
				throw new Error("Command: if reqPerms is given, it must either be a string, or an array of string permissions!");
			}
		}
		/*if (aliases) {
			let invalid = false;
			if (typeof (aliases) == "string") {
				if (aliases.charAt(0) != "!" || /\s/.test(aliases)) invalid = true;
			} else if (Array.isArray(aliases)) {
				for (let i = 0; i < )
					actually nevermind, i'll probably reimplement this later
			}
			if (!(typeof (aliases) == "string" || Array.isArray(aliases))) {
				throw new Error("Command: if aliases is given, it must either be a string, or an array of command names!");
			}
		}*/

		this.name = name.trim();
		this.description = description.trim() || "!no description!";
		this.action = Object.freeze(action);
		this.reqPerms = reqPerms;

		this.register();

		this.enable();
	}

	get canUse() {

		if (!this.enabled) return false;

		if (this.reqPerms == null) return true;

		if (typeof (this.reqPerms) == "string") return hasPermission(this.reqPerms);

		for (let i = 0; i < this.reqPerms; i++) {
			if (!hasPermission(this.reqPerms)) return false;
		}
		return true;
	}

	register() {
		if (!ChatCommands.hasOwnProperty(this.name)) {
			ChatCommands[this.name] = this;
		} else {
			throw new Error("Command::register - Command with the name " + this.name + " already exists!");
		}
		return this;
	}

	enable() {
		this.enabled = true;
		return this;
	}

	disable() {
		this.enabled = false;
		return this;
	}
}

export function execCommand(name, msg) {
	let cmd = ChatCommandAliases[name] ? ChatCommands[ChatCommandAliases[name]] : (ChatCommands[name] || null);
	if (cmd && cmd.canUse) {
		return cmd.action.call(cmd, msg);
	} else {
		return null;
	}
}