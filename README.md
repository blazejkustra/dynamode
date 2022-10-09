
<p align="center">
	<img src="docs/static/img/banner.png" width="500" max-width="90%" alt="Dynamode" />
</p>

<p align="center">
	<a href="https://www.npmjs.com/package/dynamode">
		<img src="https://img.shields.io/npm/v/dynamode?style=flat-square&color=001A72" alt="npm">
	</a>
  <a href="https://github.com/blazejkustra/dynamode/blob/master/LICENSE">
		<img src="https://img.shields.io/github/license/blazejkustra/dynamode?style=flat-square&color=33488E" alt="License">
	</a>
	<a href="https://www.npmjs.com/package/dynamode">
		<img src="https://img.shields.io/npm/dw/dynamode?style=flat-square&color=6676AA" alt="npm Downloads">
	</a>
  <a href="https://github.com/blazejkustra/dynamode">
		<img src="https://img.shields.io/github/stars/blazejkustra/dynamode?style=flat-square&color=38ACDD" alt="stars">
	</a>
</p>

---


## Documentation

No documentation yet, reach out if you are interested -> https://github.com/blazejkustra / blazej.kustra@swmansion.com

## Installation

~~Check out the [installation]() section of our docs for the detailed installation instructions.~~

## Examples

Find examples under the [`examples/`](https://github.com/blazejkustra/dynamode/blob/master/examples/) directory.

## License

Dynamode is licensed under [The MIT License](LICENSE).


# Road map

### Global Todo

* [ ] Refactor some classes and use private properties/functions 
* [ ] Improve export system for entire lib
* [ ] Merge together Query Scan and Condition classes to share some functions implementation
* [ ] Query .all() get all items even in multiple requests
* [ ] Capture dynamoDB errors and make it easier to work with
* [ ] Add tests XD gl

### less important todos

* [ ] Ban overriding dynamodeObject
* [ ] Fix issue with empty set when using Entity.update (add additional validation) - empty set and string are not allowed https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingRulesDataTypes.html
* [ ] ProjectionExpression always include dynamodeObject and set all other properties to undefined/null
* [ ] Make possible to query different types of entities
* [ ] Add dependsOn to global settings to throw/warn when updating
* [ ] Add logging possibility
* [ ] Add dynamoDB streams support
* [ ] Add PartiQL support
* [ ] Primary key might be a reserved word
* [ ] Type entity return type better https://github.com/Polymer/polymer-decorators/issues/80
* [ ] CLI tool to create/update table/index
* [ ] Support binary types https://github.com/aws/aws-sdk-js-v3/blob/06417909a3/packages/util-dynamodb/src/convertToAttr.ts#L166 & https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_util_dynamodb.html