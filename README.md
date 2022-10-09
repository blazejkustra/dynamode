
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

### Priority

* [ ] Ban overriding dynamodeObject
* [ ] ProjectionExpression always include dynamodeObject and set all other properties to undefined/null
* [ ] Primary key might be a reserved word
* [ ] Add documentation

### Must have & Hard

* [ ] Capture dynamoDB errors and make it easier to work with
* [ ] Add tests (XD) good luck with that
* [ ] Add logging possibility
* [ ] Support binary types https://github.com/aws/aws-sdk-js-v3/blob/06417909a3/packages/util-dynamodb/src/convertToAttr.ts#L166 and https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_util_dynamodb.html

### Additional validation

* [ ] Fix issue with empty set when using Entity.update (add additional validation) - empty set and string are not allowed https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingRulesDataTypes.html
* [ ] Add validation to query/scan classes

### Consider

* [ ] Make possible to query different types of entities
* [ ] Add dependsOn to global settings to throw/warn when updating
* [ ] Add dynamoDB streams support
* [ ] Add PartiQL support
* [ ] CLI tool to create/update table/index
* [ ] Type entity return type better https://github.com/Polymer/polymer-decorators/issues/80

### Other
 * [ ] ...