
<p align="center">
	<img src="docs/static/img/banner.png" width="500" max-width="90%" alt="Dynamode" />
</p>

<p align="center">
	<a href="https://www.npmjs.com/package/dynamode" style="text-decoration: none;">
		<img src="https://img.shields.io/npm/v/dynamode?style=flat-square&color=001A72" alt="npm">
	</a>
  <a href="https://github.com/blazejkustra/dynamode/blob/main/LICENSE" style="text-decoration: none;">
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

Check out our dedicated documentation page [here](https://blazejkustra.github.io/dynamode/docs/getting_started/introduction) for info about the library, guide and more.

## Installation

Check out the [installation](https://blazejkustra.github.io/dynamode/docs/getting_started/installation) section of our docs for the detailed installation instructions.

## License

Dynamode is licensed under [The MIT License](LICENSE).

## Examples

Example table definition:
```ts
type ExampleTableProps = {
  propPk: string;
  propSk: number;
  index: string;
};

const TABLE_NAME = 'example-table';

class ExampleTable extends Entity {
  @attribute.partitionKey.string()
  propPk: string;

  @attribute.sortKey.number()
  propSk: number;

  @attribute.lsi.sortKey.string({ indexName: 'LSI_NAME' })
  index: string;

  constructor(props: ExampleTableProps) {
    super();

    this.propPk = props.propPk;
    this.propSk = props.propSk;
    this.index = props.index;
  }
}

export const ExampleTableManager = new TableManager(ExampleTable, {
  tableName: TABLE_NAME,
  partitionKey: 'propPk',
  sortKey: 'propSk',
  indexes: {
    LSI_NAME: {
      sortKey: 'index',
    },
  },
});

await ExampleTableManager.create();
```

Example entity definition:
```ts
type ExampleEntityProps = ExampleTableProps & {
  attr: { [k: string]: number };
};

export class ExampleEntity extends ExampleTable {
  @attribute.object()
  attr: { [k: string]: number };

  constructor(props: ExampleEntityProps) {
    super(props);

    this.attr = props.attr;
  }
}

export const ExampleEntityManager = ExampleTableManager.entityManager(ExampleEntity);

await ExampleEntityManager.put(new ExampleEntityManager({ ... }));
```

Find more examples under the [`examples/`](https://github.com/blazejkustra/dynamode/blob/main/examples/) directory.

REDACTEDxd