import Schema from 'validate';
import pino from 'pino';

const pinoLogLevels = Object.keys(pino.levels.values);

console.log(pino.levels);

/*
log: debug
api:
  templates:
    - subtopic: shinobi
      retain: false
      template: >-
        { 
          "plug": "${onvifDeviceId}", 
          "reason": "${eventType}", 
          "name": "${onvifDeviceId}" 
        }
mqtt:
  host: localhost
  port: 1883
onvif:
  - name: doorbell
    hostname: localhost
    port: 80
    username: admin
    password: SHAGCB
*/

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