import config from './Config';
import logger from './Logger';
import OnvifSubscriberGroup from './onvif/SubscriberGroup';
import MqttPublisher from './mqtt/Publisher';

import { CALLBACK_TYPES } from "./onvif/SubscriberGroup";
import debounceStateUpdate from "./utils/debounceStateUpdate";
import interpolateTemplateValues from './utils/interpolateTemplateValues';

const convertBooleanToSensorState = bool => bool ? 'ON' : 'OFF';

export default class Manager {
  constructor() {
    this.logger = logger.child({ name: 'Manager' });
    
    this.init();
  }

  init = async () => {
    this.logger.info('Beginning initialization...');

    this.publisher = new MqttPublisher(config.get('mqtt'));
    await this.publisher.connect();
    this.subscriber = new OnvifSubscriberGroup();

    this.initializeOnvifDevices(config.get('onvif'));
    this.subscriber.withCallback(CALLBACK_TYPES.motion, this.onMotionDetected);
  };

  initializeOnvifDevices = devices => {
    devices.forEach(async (onvifDevice) => {
      const { name } = onvifDevice;

      await this.subscriber.addSubscriber(onvifDevice);
      
      this.onMotionDetected(name, false);
    });
  };

  publishTemplates = (onvifDeviceId, eventType, eventState) => {
    const templates = config.get('api.templates');

    templates.forEach(({
      subtopic, template
    }) => {
      this.publisher.publish(onvifDeviceId, subtopic, interpolateTemplateValues(template, {
        onvifDeviceId,
        eventType,
        eventState
      }));
    });
  };
  
  /* Event Callbacks */
  onMotionDetected = debounceStateUpdate((onvifDeviceId, boolMotionState) => {
    const topicKey = 'motion';

    this.publishTemplates(onvifDeviceId, topicKey, boolMotionState);
    this.publisher.publish(onvifDeviceId, topicKey, convertBooleanToSensorState(boolMotionState));
  });
}