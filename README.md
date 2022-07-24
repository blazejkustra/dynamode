# dynamode

No documentation yet, reach out to me if you are interested -> https://github.com/blazejkustra

## TODO

### Table:

* [ ] flow to create Table from code
* [ ] flow to update Table from code
* [ ] flow to create Index from code
* [ ] Possibility to add secondary indexes with custom name

### Model:

* [ ] Add createdAt and updatedAt (possibility to add it with custom name)
* [ ] Possibility to add indexes with custom name
* [ ] Implement Model.batchGet
* [ ] Implement Model.batchPut
* [ ] Implement Model.batchDelete
* [ ] Implement Model.create (that creates object ensuring it doesnt exist already)
* [ ] Implement Model.transaction
* [ ] Implement Model.query
* [ ] Model.get - supplement with all dynamoDB properties
* [ ] Model.update - supplement with all dynamoDB properties
* [ ] Model.put - supplement with all dynamoDB properties
* [ ] Model.delete - supplement with all dynamoDB properties
* [ ] Show how to add new methods to class

### Query

* [X] .exec() to run the query
* [X] .limit() limit the number of documents that DynamoDB will query in this request
* [ ] .startAt() for pagination purposes
* [ ] .sort() sorting options
* [ ] .index() use index to query
* [ ] .consistent() consistency mode
* [ ] .count() return count of items instead of classes
* [ ] .attributes() limit which attributes DynamoDB returns for each item in the table.
* [ ] .all() get all items even in multiple requests
* [ ] Add possibility to pass DynamoDB condition object

Other conditions:

* [ ] .and() join conditions together
* [ ] .or() join conditions together
* [ ] .not() negate condition
* [ ] .filter() prepares a new conditional
* [ ] .eq() see if the given filter key is equal
* [ ] .exists() see if given filter exists
* [ ] .lt() .le() .gt() .ge() see if given filter is greater/less etc
* [ ] .beginsWith() see if given filter begins with
* [ ] .contains() see if given filter contains
* [ ] .in() see if given filter is in array
* [ ] .between() see if given filter is between two values

### Scan

* [ ] Nothing special, implement scan overlay

### Transaction

* [ ] Implement dynamode.transaction

### Global

* [ ] Think about idea that Model might be created locally and not yet created in dynamoDB (maybe Model.save)
* [ ] Return whole request instead of mapped values in Model
* [ ] Way to override properties when getting/updating/putting in Model
* [ ] Think about idea to introduce toJSON to more easily convert classes to objects
* [ ] Improve how ddb and table is passed over
* [ ] Add logging possibility
