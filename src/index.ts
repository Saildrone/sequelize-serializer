import { Instance } from 'sequelize';

interface SerializerOptions {
  exclude?: string[];
}

export interface SerializableInstance extends Instance<any> {
  serializerAttributes(): {
    [key: string]: any;
  };

  serialize(): any;
}

export class Serializer<T extends SerializableInstance> {
  constructor(
    private serializable: T | T[],
    private options: SerializerOptions = {}
  ) { }

  public toJSON(): any {
    if (this.serializable instanceof Array) {
      return this.serializable.map(record => record.serialize());
    }

    let data;

    try {
      data = this.serializable.serializerAttributes();
    } catch (err) {
      if (err.name === 'TypeError') {
        return this.serializable.toJSON();
      }

      throw err;
    }

    if (this.options.exclude) {
      for (const attr of this.options.exclude) {
        delete data[attr];
      }
    }

    return data;
  }

  // TODO: Is this even accessible anymore?
  public get length() {
    let results = 1;

    if (this.serializable instanceof Array) {
      results = this.serializable.length;
    }

    return results;
  }
}

export function serialize(
  this: SerializableInstance,
  options: SerializerOptions
) {
  return new Serializer(this, options).toJSON();
}
