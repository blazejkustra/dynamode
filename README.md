
<p align="center">
	<img src="docs/static/img/banner.png" width="500" max-width="90%" alt="Dynamode" />
</p>

<p align="center">
	<a href="https://www.npmjs.com/package/dynamode" style="text-decoration: none;">
		<img src="https://img.shields.io/npm/v/dynamode?style=flat-square&color=001A72" alt="npm">
	</a>
  <a href="https://github.com/blazejkustra/dynamode/blob/master/LICENSE" style="text-decoration: none;">
		<img src="https://img.shields.io/github/license/blazejkustra/dynamode?style=flat-square&color=33488E" alt="License">
	</a>
	<a href="https://www.npmjs.com/package/dynamode" style="text-decoration: none;">
		<img src="https://img.shields.io/npm/dw/dynamode?style=flat-square&color=6676AA" alt="npm Downloads">
	</a>
  <a href="https://github.com/blazejkustra/dynamode" style="text-decoration: none;">
		<img src="https://img.shields.io/github/stars/blazejkustra/dynamode?style=flat-square&color=38ACDD" alt="stars">
	</a>
	<a href='https://coveralls.io/github/blazejkustra/dynamode' style="text-decoration: none;">
		<img src='https://img.shields.io/coveralls/github/blazejkustra/dynamode?style=flat-square' >
	</a>
</p>

---

Dynamode is a modeling tool for Amazon's DynamoDB. Its goal is to ease the use of DynamoDB without its quirks and emphasize DynamoDB advantages over other databases. Dynamode provides a straightforward, object-oriented class-based solution to model your data. It includes strongly typed classes and methods, query and scan builders, and much more.

Dynamode is highly influenced by other ORMs/ODMs, such as [TypeORM](https://github.com/typeorm/typeorm), [Dynamoose](https://github.com/dynamoose/dynamoose) and [Mongoose](https://github.com/Automattic/mongoose).

## Documentation

Check out our dedicated documentation page for info about the library, guide and more: https://blazejkustra.github.io/dynamode/docs/getting_started/introduction

## Installation

Check out the [installation](https://blazejkustra.github.io/dynamode/docs/getting_started/install) section of our docs for the detailed installation instructions.

## Examples

Find examples under the [`examples/`](https://github.com/blazejkustra/dynamode/blob/master/examples/) directory.

## License

Dynamode is licensed under [The MIT License](LICENSE).

---

## Road map

### Priority

* [ ] Fix issue with empty set when using Entity.update (add additional validation) - empty set and string are not allowed https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingRulesDataTypes.html
* [ ] Add validation to query/scan classes
* [ ] Add validation to make sure that entities are registered have partitionKey and other stuff (think if it is needed at all)
* [ ] Fix Condition, Query and Scan methods to work only on specific properties (between, contains etc shouldn't work for array as an example)
* [ ] Improve error messages
* [ ] Add table creation
* [ ] Add table validation  - You can only add local secondary indexes on tables with composite primary keys
* [ ] Write e2e tests
* [ ] Implement query that support querying different types of entities
* [ ] Add dynamoDB streams support

### Medium priority

* [ ] Add possibility to have more than one suffix/prefix
* [ ] Decide if batchPut should return items if unprocessed items are returned
* [ ] Support binary types https://github.com/aws/aws-sdk-js-v3/blob/06417909a3/packages/util-dynamodb/src/convertToAttr.ts#L166 and https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_util_dynamodb.html
* [ ] Add logging possibility

### Future

* [ ] Add PartiQL support
* [ ] Add dependsOn to global settings to throw/warn when updating (decorator)
* [ ] Allow having multiple ddb instances
* [ ] Capture dynamoDB errors and make it easier to work with
* [ ] CLI tool to create/update table/index
