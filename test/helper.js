import test from 'ava';
import * as helper from '../src/helper'

test('helper should be an object with some methods', t => {
	t.is(typeof helper, 'object', 'helper should be an object');
	['isObj', 'isFun', 'isStr', 'isBool', 'isArr', 'containsFunction', 'parseDynamicDirectives'].forEach(name => {
		t.is(typeof helper[name], 'function', 'helper should export some methods');
	});
});

test('isObj should return true for normal objects', t => {
	const { isObj } = helper;

	t.is(isObj({}), true);
	t.is(isObj(new Object()), true); // eslint-disable-line no-new-object
});
test('isObj should return false for non-objects', t => {
	const { isObj } = helper;

	t.is(isObj(), false);
	t.is(isObj(null), false);
	t.is(isObj(''), false);
	t.is(isObj(true), false);
	t.is(isObj(false), false);
	t.is(isObj(0), false);
	t.is(isObj(123), false);
	t.is(isObj([]), false);
	t.is(isObj(() => true), false);
});

test('isFun should return true for normal functions', t => {
	const { isFun } = helper;

	t.is(isFun(() => true), true);
	t.is(isFun(new Function('return true')), true); // eslint-disable-line no-new-func
});
test('isFun should return false for non-functions', t => {
	const { isFun } = helper;

	t.is(isFun(), false);
	t.is(isFun(null), false);
	t.is(isFun(''), false);
	t.is(isFun(true), false);
	t.is(isFun(false), false);
	t.is(isFun(0), false);
	t.is(isFun(123), false);
	t.is(isFun([]), false);
	t.is(isFun({}), false);
});

test('isStr should return true for strings', t => {
	const { isStr } = helper;

	t.is(isStr(''), true);
	t.is(isStr('hello world'), true);
	t.is(isStr(new String('')), true); // eslint-disable-line no-new-wrappers
	t.is(isStr(new String('hello world')), true); // eslint-disable-line no-new-wrappers
});
test('isFun should return false for non-strings', t => {
	const { isStr } = helper;

	t.is(isStr(), false);
	t.is(isStr(null), false);
	t.is(isStr(true), false);
	t.is(isStr(false), false);
	t.is(isStr(0), false);
	t.is(isStr(123), false);
	t.is(isStr([]), false);
	t.is(isStr({}), false);
	t.is(isStr(() => true), false);
});

test('isBool should return true for booleans', t => {
	const { isBool } = helper;

	t.is(isBool(true), true);
	t.is(isBool(false), true);
	t.is(isBool(new Boolean(true)), true); // eslint-disable-line no-new-wrappers
	t.is(isBool(new Boolean(false)), true); // eslint-disable-line no-new-wrappers
});
test('isBool should return false for non-booleans', t => {
	const { isBool } = helper;

	t.is(isBool(), false);
	t.is(isBool(null), false);
	t.is(isBool(''), false);
	t.is(isBool(0), false);
	t.is(isBool(123), false);
	t.is(isBool([]), false);
	t.is(isBool({}), false);
	t.is(isBool(() => true), false);
});

test('isArr should return true for arrays', t => {
	const { isArr } = helper;

	t.is(isArr([]), true);
	t.is(isArr(new Array()), true); // eslint-disable-line no-array-constructor
});
test('isArr should return false for non-arrays', t => {
	const { isArr } = helper;

	t.is(isArr(), false);
	t.is(isArr(null), false);
	t.is(isArr(true), false);
	t.is(isArr(false), false);
	t.is(isArr(''), false);
	t.is(isArr(0), false);
	t.is(isArr(123), false);
	t.is(isArr({}), false);
	t.is(isArr(() => true), false);
});

test('containsFunction should return true for function-inside-object', t => {
	const { containsFunction } = helper;

	t.is(containsFunction({
		fun: () => true
	}), true);
	t.is(containsFunction({
		fun: new Function('return true') // eslint-disable-line no-new-func
	}), true);
});

test('containsFunction should return false for non-function-inside-object', t => {
	const { containsFunction } = helper;

	t.is(containsFunction({
		str: '',
		bool: true,
		null: null,
		udf: undefined,
		num: 123,
		arr: [],
		obj: {}
	}), false);
});
