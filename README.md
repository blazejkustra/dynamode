# dynamode

No documentation yet, reach out to me if you are interested -> https://github.com/blazejkustra

## TODO

### Table:

* [ ] flow to create Table from code
* [ ] flow to update Table from code
* [ ] flow to create Index from code
* [X] Possibility to add secondary indexes with custom name

### Entity:

* [X] Possibility to add indexes with custom name
* [X] Implement Entity.condition
* [X] Implement Entity.query
* [X] Entity.get - supplement with all dynamoDB properties
* [X] Entity.update - supplement with all dynamoDB properties
* [X] Entity.put - supplement with all dynamoDB properties
* [X] Entity.delete - supplement with all dynamoDB properties
* [X] Implement Entity.batchGet
* [X] Implement Entity.batchPut
* [X] Implement Entity.batchDelete
* [X] Implement Entity.create (that creates object ensuring it doesnt exist already)
* [X] Add remaining indexes
* [ ] Add createdAt and updatedAt (possibility to add it with custom name)
* [ ] Fix issue with empty set when using Entity.update
* [ ] Implement Entity.transaction

### Query

* [ ] .all() get all items even in multiple requests
* [X] fix condition merge conflicts when using parenthesis
* [X] fix size() substituteKey option (key is still added to attributeNames)
* [X] Add possibility to pass dynamode Condition class (without parenthesis)
* [X] Add possibility to pass DynamoDB condition object
* [X] .exec() to run the query
* [X] .limit() limit the number of documents that DynamoDB will query in this request
* [X] .startAt() for pagination purposes
* [X] .sort() sorting options
* [X] .consistent() consistency mode
* [X] .count() return count of items instead of classes
* [X] .attributes() limit which attributes DynamoDB returns for each item in the table.
* [X] .and() join conditions together
* [X] .or() join conditions together
* [X] .not() negate condition
* [X] .filter() prepares a new conditional
* [X] .eq() see if the given filter key is equal
* [X] .exists() see if given filter exists
* [X] .lt() .le() .gt() .ge() see if given filter is greater/less etc
* [X] .beginsWith() see if given filter begins with
* [X] .contains() see if given filter contains
* [X] .in() see if given filter is in array
* [X] .between() see if given filter is between two values
* [X] .parenthesis() and group()

### Scan

* [ ] Nothing special, implement scan overlay

### Transaction

* [ ] Implement dynamode.transaction

### Global

* [X] Way to override properties when getting/updating/putting in Entity
* [X] Improve how ddb and table is passed over
* [X] Return whole request instead of mapped values in Entity
* [X] Change license to MIT
* [ ] Add SEPARATOR to global settings, add dependsOn to global settings to throw/warn when updating
* [ ] Add logging possibility
* [ ] Capture dynamoDB errors and make it easier to work with
* [ ] Add dynamoDB streams support
* [ ] Add tests XD gl
* [ ] Add PartiQL support
