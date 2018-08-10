# sequelize-serializer [![Build Status](https://travis-ci.org/Saildrone/sequelize-serializer.svg?branch=master)](https://travis-ci.org/Saildrone/sequelize-serializer)

An easy-to-use serializer for Sequelize models.

## Installation

```
npm i --save sequelize-serializer
```

## Usage

On any model you wish to use `sequelize-serializer` with, add a
`serializerAttributes` instance method:

```javascript
MyModel.prototype.serializerAttributes = function() {
  return _.pick(this, [
    'foo',
    'bar',
    'baz'
  ]);
};
```

Where `foo`, `bar`, and `baz` are all attributes of a `MyModel` instance.

Additionally, you'll need to add the `serialize` method to your model instances.
If you're using the scaffolded model initializer provided by `sequelize-cli`,
you can add the following lines:

```javascript
const { serialize } = require('sequelize-serializer');

// ...

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
    // Add this line
    db[modelName].prototype.serialize = serialize;
  }
});
```

Finally, to serialize one of your models, call `serialize` on one of your model
instances.

To serialize a collection of model instances, you can use the serializer
interface directly:

```javascript
const { Serializer } = require('sequelize-serializer');

const myModels = await MyModel.findAll();

return new Serializer(myModels);
```

### Building and Tests

This package is built with TypeScript. To compile the source, run
`npm run build`. To run the tests, run `npm test`.

### Contributing

Contributions would be rad! To make a contribution, please open an issue or
pull request. If opening a pull request with a code change, please include a
description of the problem you're solving, ensure tests pass, and include new
tests (if applicable). Thanks in advance!

### License

MIT - see LICENSE.md
