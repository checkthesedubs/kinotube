import { ChatCommand } from "./ChatCommand";

export const ClientCommands = {};

// alias -> real command name
export const ClientCommandAliases = {
	"/vol":"/volume"
}

export class ClientCommand extends ChatCommand {
}

ClientCommand.prototype.register = function() {
	if (!ClientCommands.hasOwnProperty(this.name)) {
		ClientCommands[this.name] = this;
	} else {
		throw new Error("ClientCommand::register - Client command with the name " + this.name + " already exists!");
	}
	return this;
}

export function execClientCommand(name, msg) {
	let cmd = ClientCommandAliases[name] ? ClientCommands[ClientCommandAliases[name]] : (ClientCommands[name] || null);
	if (cmd && cmd.canUse) {
		cmd.action.call(cmd, msg);
		return true;
	} else {
		return false;
	}
}