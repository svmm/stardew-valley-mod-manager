export function Injectable(constructor: Function) {
	constructor.prototype['symbol'] = Symbol(constructor.name);
}
