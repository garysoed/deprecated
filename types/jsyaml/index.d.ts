// Type definitions for js-yaml 3.10
// Project: https://github.com/nodeca/js-yaml
// Definitions by: Bart van der Schoor <https://github.com/Bartvds>, Sebastian Clausen <https://github.com/sclausen>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.2

declare namespace jsyaml {
	function safeLoad(str: string, opts?: LoadOptions): any;
	function load(str: string, opts?: LoadOptions): any;

	class Type {
		constructor(tag: string, opts?: TypeConstructorOptions);
		kind: 'sequence' | 'scalar' | 'mapping' | null;
		resolve(data: any): boolean;
		construct(data: any): any;
		instanceOf: object | null;
		predicate: string | null;
		represent: ((data: object) => any) | { [x: string]: (data: object) => any; } | null;
		defaultStyle: string | null;
		styleAliases: { [x: string]: any; };
	}

	/* tslint:disable-next-line:no-unnecessary-class */
	class Schema implements SchemaDefinition {
		constructor(definition: SchemaDefinition);
		static create(types: Type[] | Type): Schema;
		static create(schemas: Schema[] | Schema, types: Type[] | Type): Schema;
	}

	function safeLoadAll(str: string, iterator?: (doc: any) => void, opts?: LoadOptions): any;
	function loadAll(str: string, iterator?: (doc: any) => void, opts?: LoadOptions): any;

	function safeDump(obj: any, opts?: DumpOptions): string;
	function dump(obj: any, opts?: DumpOptions): string;

	interface LoadOptions {
		// string to be used as a file path in error/warning messages.
		filename?: string;
		// makes the loader to throw errors instead of warnings.
		strict?: boolean;
		// specifies a schema to use.
		schema?: any;
		// compatibility with JSON.parse behaviour.
		json?: boolean;
	}

	interface DumpOptions {
		// indentation width to use (in spaces).
		indent?: number;
		// do not throw on invalid types (like function in the safe schema) and skip pairs and single values with such types.
		skipInvalid?: boolean;
		// specifies level of nesting, when to switch from block to flow style for collections. -1 means block style everwhere
		flowLevel?: number;
		// Each tag may have own set of styles.	- "tag" => "style" map.
		styles?: { [x: string]: any; };
		// specifies a schema to use.
		schema?: any;
		// if true, sort keys when dumping YAML. If a function, use the function to sort the keys. (default: false)
		sortKeys?: boolean | ((a: any, b: any) => number);
		// set max line width. (default: 80)
		lineWidth?: number;
		// if true, don't convert duplicate objects into references (default: false)
		noRefs?: boolean;
		// if true don't try to be compatible with older yaml versions. Currently: don't quote "yes", "no" and so on, as required for YAML 1.1 (default: false)
		noCompatMode?: boolean;
		// if true flow sequences will be condensed, omitting the space between `key: value` or `a, b`. Eg. `'[a,b]'` or `{a:{b:c}}`.
		// Can be useful when using yaml for pretty URL query params as spaces are %-encoded. (default: false)
		condenseFlow?: boolean;
	}

	interface TypeConstructorOptions {
		kind?: 'sequence' | 'scalar' | 'mapping';
		resolve?: (data: any) => boolean;
		construct?: (data: any) => any;
		instanceOf?: object;
		predicate?: string;
		represent?: ((data: object) => any) | { [x: string]: (data: object) => any };
		defaultStyle?: string;
		styleAliases?: { [x: string]: any; };
	}

	interface SchemaDefinition {
		implicit?: any[];
		explicit?: Type[];
		include?: Schema[];
	}

	// only strings, arrays and plain objects: http://www.yaml.org/spec/1.2/spec.html#id2802346
	let FAILSAFE_SCHEMA: Schema;
	// only strings, arrays and plain objects: http://www.yaml.org/spec/1.2/spec.html#id2802346
	let JSON_SCHEMA: Schema;
	// same as JSON_SCHEMA: http://www.yaml.org/spec/1.2/spec.html#id2804923
	let CORE_SCHEMA: Schema;
	// all supported YAML types, without unsafe ones (!!js/undefined, !!js/regexp and !!js/function): http://yaml.org/type/
	let DEFAULT_SAFE_SCHEMA: Schema;
	// all supported YAML types.
	let DEFAULT_FULL_SCHEMA: Schema;
	let MINIMAL_SCHEMA: Schema;
	let SAFE_SCHEMA: Schema;

	class YAMLException extends Error {
		constructor(reason?: any, mark?: any);
		toString(compact?: boolean): string;
	}
}
