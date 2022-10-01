
<p align="center">
	<img src="docs/static/img/banner.png" width="500" max-width="90%" alt="Dynamode" />
</p>

<p align="center">
	<a href="https://www.npmjs.com/package/dynamode">
		<img src="https://img.shields.io/npm/v/dynamode?style=flat-square&color=33488E" alt="npm">
	</a>
  <a href="https://github.com/blazejkustra/dynamode/blob/master/LICENSE">
		<img src="https://img.shields.io/github/license/blazejkustra/dynamode?style=flat-square&color=6676AA" alt="License">
	</a>
	<a href="https://www.npmjs.com/package/dynamode">
		<img src="https://img.shields.io/npm/dw/dynamode?style=flat-square&color=38ACDD" alt="npm Downloads">
	</a>
  <a href="https://github.com/blazejkustra/dynamode">
		<img src="https://img.shields.io/github/stars/blazejkustra/dynamode?style=flat-square&color=5BB9E0" alt="stars">
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


# Road map / TODOs

### Table:

* [ ] flow to create Table from code
* [ ] flow to update Table from code
* [ ] flow to create Index from code
* [ ] Maybe CLI tool for these?

### Entity:

* [ ] Fix issue with empty set when using Entity.update
* [ ] Implement Entity.transaction

### Query

* [ ] .all() get all items even in multiple requests

### Scan

* [X] implement it

### Transaction

* [ ] Implement dynamode.Transaction

### Global Todo

* [ ] Make ReturnValues adjustable in Entity update method
* [ ] Make possible to set prefix and suffix with String type columns
* [ ] Capture dynamoDB errors and make it easier to work with
* [ ] Add tests XD gl
* [ ] Improve export system for entire lib
* [ ] Refactor some classes and use private properties/functions 
* [ ] Merge together Query Scan and Condition classes to share some functions implementation

### less important todos

* [ ] Ban overriding dynamodeObject
* [ ] ProjectionExpression always include dynamodeObject and set all other properties to undefined/null
* [ ] Make possible to query different types of entities
* [ ] Add dependsOn to global settings to throw/warn when updating
* [ ] Add logging possibility
* [ ] Add dynamoDB streams support
* [ ] Add PartiQL support