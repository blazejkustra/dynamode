# dynamode

No documentation yet, reach out to me if you are interested -> https://github.com/blazejkustra

## TODO

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

* [ ] implement it

### Transaction

* [ ] Implement dynamode.Transaction

### Global Todo

* [ ] Make ReturnValues adjustable in Entity update method
* [ ] Make possible to set prefix and suffix with String type columns
* [ ] Capture dynamoDB errors and make it easier to work with
* [ ] Add tests XD gl
* [ ] Improve export system for entire lib
* [ ] Refactor some classes and use private properties/functions 

### less important todos

* [ ] Ban overriding dynamodeObject
* [ ] ProjectionExpression always include dynamodeObject and set all other properties to undefined/null
* [ ] Make possible to query different types of entities
* [ ] Add dependsOn to global settings to throw/warn when updating
* [ ] Add logging possibility
* [ ] Add dynamoDB streams support
* [ ] Add PartiQL support