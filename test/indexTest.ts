import * as Lab from '@hapi/lab';

import { expect } from '@hapi/code';
import { DataTypes, Model, Sequelize } from 'sequelize';

const {
  beforeEach,
  describe,
  it
} = exports.lab = Lab.script();

import { SerializableInstance, serialize, Serializer } from '../src';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  database: 'sequelize_serializer',
  logging: false
});

const columns = {
  foo: DataTypes.STRING,
  bar: DataTypes.STRING,
  baz: DataTypes.STRING
};

class NullModel extends Model {
  public foo!: string;
  public bar!: string;
  public baz!: string;

  public serialize = serialize;

  public serializerAttributes() {
    return {
      foo: this.foo,
      baz: this.baz
    };
  }
}

NullModel.init(columns, { sequelize, tableName: 'null_models' });

// TODO: Clean up and reorganize tests once API solidifies
describe('sequelize-serializer', () => {
  let instance: SerializableInstance;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    instance = await NullModel.create({ foo: 'Coby', bar: 'da', baz: 'Bear' });
  });

  describe('serialize', () => {
    it('returns the properties defined in serializerAttributes', () => {
      expect(instance.serialize()).to.equal({ foo: 'Coby', baz: 'Bear' });
    });

    it('does not return properties not defined in serializerAttributes', () => {
      expect(instance.serialize()).to.not.include({ bar: 'da' });
    });

    describe('without serializerAttributes set', () => {
      it('defaults to return the entire toJSON object', () => {
        instance.serializerAttributes = undefined;

        expect(instance.serialize()).to.include({
          foo: 'Coby',
          bar: 'da',
          baz: 'Bear'
        });
      });
    });
  });

  describe('serializing an array of models', () => {
    beforeEach(async () => {
      await NullModel.create({ foo: 'Lucy', bar: 'Fur', baz: 'Snacks' });
    });

    it('returns the properties defined in serializerAttributes for each model', async () => {
      const models = await NullModel.findAll();

      expect(new Serializer(models).toJSON()).to.equal([
        { foo: 'Coby', baz: 'Bear' },
        { foo: 'Lucy', baz: 'Snacks' }
      ]);
    });
  });

  describe('excluding properties from serializerAttributes', () => {
    it('returns the properties defined without those explicitly excluded', () => {
      expect(new Serializer(instance, { exclude: ['baz'] }).toJSON()).to.equal(
        { foo: 'Coby' }
      );
    });
  });
});
