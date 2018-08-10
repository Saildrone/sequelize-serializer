import * as Lab from 'lab';
import Sequelize from 'sequelize';

import { expect } from 'code';

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

const NullModel = sequelize.define('null_models', {
  foo: Sequelize.STRING,
  bar: Sequelize.STRING,
  baz: Sequelize.STRING
});

NullModel.prototype.serialize = serialize;

NullModel.prototype.serializerAttributes = function() {
  return {
    foo: this.foo,
    baz: this.baz
  };
};

// TODO: Clean up and reorganize tests once API solidifies
describe('sequelize-serializer', () => {
  let instance: SerializableInstance;

  beforeEach(done => {
    sequelize.sync({ force: true }).then(() => {
      NullModel.create({
        foo: 'Coby', bar: 'da', baz: 'Bear'
      }).then((i: SerializableInstance) => {
        instance  = i;
        done();
      });
    });
  });

  describe('serialize', () => {
    it('returns the properties defined in serializerAttributes', done => {
      expect(instance.serialize()).to.equal({ foo: 'Coby', baz: 'Bear' });

      done();
    });

    it('does not return properties not defined in serializerAttributes', done => {
      expect(instance.serialize()).to.not.include({ bar: 'da' });

      done();
    });

    describe('without serializerAttributes set', () => {
      it('defaults to return the entire toJSON object', done => {
        instance.serializerAttributes = undefined;

        expect(instance.serialize()).to.include({
          foo: 'Coby',
          bar: 'da',
          baz: 'Bear'
        });

        done();
      });
    });
  });

  describe('serializing an array of models', () => {
    beforeEach(done => {
      NullModel.create({ foo: 'Lucy', bar: 'Fur', baz: 'Snacks' })
        .then(() => done());
    });

    it('returns the properties defined in serializerAttributes for each model', done => {
      NullModel.findAll().then((models: SerializableInstance[]) => {
        expect(new Serializer(models).toJSON()).to.equal([
          { foo: 'Coby', baz: 'Bear' },
          { foo: 'Lucy', baz: 'Snacks' }
        ]);

        done();
      });
    });
  });

  describe('excluding properties from serializerAttributes', () => {
    it('returns the properties defined without those explicitly excluded', done => {
      expect(new Serializer(instance, { exclude: ['baz'] }).toJSON()).to.equal(
        { foo: 'Coby' }
      );

      done();
    });
  });
});
