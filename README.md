# dynamode

No documentation yet, reach out to me if you are interested -> https://github.com/blazejkustra

## TODO

### Table:

* [ ] flow to create Table from code
* [ ] flow to update Table from code
* [ ] flow to create Index from code
* [X] Possibility to add secondary indexes with custom name

### Model:

* [ ] Add createdAt and updatedAt (possibility to add it with custom name)
* [X] Possibility to add indexes with custom name
* [ ] Implement Model.batchGet
* [ ] Implement Model.batchPut
* [ ] Implement Model.batchDelete
* [ ] Implement Model.create (that creates object ensuring it doesnt exist already)
* [ ] Implement Model.transaction
* [X] Implement Model.condition
* [X] Implement Model.query
* [X] Model.get - supplement with all dynamoDB properties
* [ ] Model.update - supplement with all dynamoDB properties
* [ ] Model.put - supplement with all dynamoDB properties
* [X] Model.delete - supplement with all dynamoDB properties
* [ ] Show how to add new methods to class
* [ ] Add remaining indexes


### Query

* [ ] .all() get all items even in multiple requests
* [X] fix condition merge conflicts when using parenthesis
* [X] fix size() substituteKey option (key is still added to attributeNames)
* [ ] Add possibility to pass dynamode Condition class (without parenthesis)
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

* [ ] Change license to MIT
* [ ] Think about idea that Model might be created locally and not yet created in dynamoDB (maybe Model.save)
* [ ] Return whole request instead of mapped values in Model
* [ ] Way to override properties when getting/updating/putting in Model
* [ ] Think about idea to introduce toJSON to more easily convert classes to objects
* [ ] Improve how ddb and table is passed over
* [ ] Add logging possibility
* [ ] Add PartiQL support
* [ ] Capture dynamoDB errors and make it easier to work with
* [ ] Add dynamoDB streams support
* [ ] Add tests XD gl
