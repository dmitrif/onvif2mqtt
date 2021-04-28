import Schema from 'validate';
import pino from 'pino';

const pinoLogLevels = Object.keys(pino.levels.values);

const configSchema = new Schema({
  log: {
    type: String,
    use: {
      mustMatchLogLevels: val => pinoLogLevels.includes(val),
    },
  },
  api: {
    templates: [{
      subtopic: {
        required: true,
      },
      retain: {
        type: Boolean
      },
      template: {
        type: String,
      }
    }]
  },
  mqtt: {
    required: true,
    host: {
      required: true,
    },
    port: {
      required: true,
    },
    clientId: String,
    username: String,
    password: String,
  },
  onvif: {
    type: Array,
    required: true,
    each: {
      name: {
        required: true,
      },
      hostname: {
        required: true,
      },
      port: {
        required: true,
      },
      username: String,
      password: String,
    }
  }
});

configSchema.message({
  mustMatchLogLevels: path => `${path} must be one of [${pinoLogLevels.join(',')}]`
});

class Validator {
  validate = (config) => {
    return configSchema.validate(
      config
    );
  };
}

export default new Validator();