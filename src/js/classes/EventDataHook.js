export class EventDataHook {

	#listeners = {};
	#id = 0;

	constructor(modifiesObject) {
		this.modifiesObject = modifiesObject;
	}

	processListeners(object, data) {
		const callbacks = Object.values(this.#listeners);
		if (this.modifiesObject) {
			for (let i = 0; i < callbacks.length; i++) {
				object = callbacks[i](object, data) || object;
			}
			return object;
		} else {
			for (let i = 0; i < callbacks.length; i++) {
				callbacks[i](object, data);
			}
		}
	}

	registerListener(callback) {
		if (!callback || typeof(callback) != 'function') {
			throw new Error("EventDataHook::registerListener: callback must be a function");
		}
		this.#listeners[this.#id] = callback;
		return this.#id++;
	}

	unregisterListener(id) {
		delete this.#listeners[id];
	}
}