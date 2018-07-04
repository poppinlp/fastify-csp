module.exports = {
	OPTION_NOT_OBJECT: new TypeError('The passed in option should be an object.'),
	OPTION_NO_DIRECTIVES: new TypeError(
		'The passed in option should have "directives" key as an object.'
	),
	EMPTY_DIRECTIVES: new Error('The directives object should have at least one directive.'),

	noSuchDirective: name => new Error(`No such directive named ${name}.`),
	directiveNotArray: (value, name) => new TypeError(`"${value}" is not an array or empty in ${name}`),
	directiveNotValidValue: (value, name) => new Error(`"${value}" is not a valid value in ${name}.`),
	directiveNotMakeSense: (value, name) => new Error(`"${value}" does not make sense in ${name}.`),
	directiveMustQuoted: (value, name) =>
		new Error(`"${value}" must be quoted in ${name}. Change it to "'${value}'" in your option.`)
};
