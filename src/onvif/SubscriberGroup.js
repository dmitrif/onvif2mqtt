import logger from '../Logger';
import Subscriber from './Subscriber';

const NO_OP = () => {};

const NAMESPACE_DELIMITER = ':';

export const CALLBACK_TYPES = {
  motion: 'onMotionDetected',
};

const EVENTS = {
  'RuleEngine/CellMotionDetector/Motion': CALLBACK_TYPES.motion
};

const DEFAULT_CALLBACKS = {
  [CALLBACK_TYPES.motion]: NO_OP, 
};

export default class SubscriberGroup {
  subscribers = [];

  constructor(callbacks) {
    this.callbacks = {
      ...DEFAULT_CALLBACKS,
      ...callbacks
    };
    this.logger = logger.child({ name: 'ONVIF' });
  }

  withCallback = (callbackType, callback) => {
    this.callbacks = {
      ...this.callbacks,
      [callbackType]: callback,
    };
  };

  addSubscriber = (subscriberConfig) => {
    this.subscribers.push(new Subscriber({
      ...subscriberConfig,
      onEvent: this.onSubscriberEvent,
    }));
  };

  destroy = () => {
    this.subscribers.forEach((item) => {
      item.cam = null;
      item = null;
    });
    this.subscribers.length = 0;
  };

  onSubscriberEvent = (subscriberName, event) => {
    const [namespace, eventType] = event.topic._.split(NAMESPACE_DELIMITER);
    
    const callbackType = EVENTS[eventType];
    const eventValue = event.message.message.data.simpleItem.$.Value;

    this.logger.trace('ONVIF received', { subscriberName, eventType, eventValue });

    this.callbacks[callbackType](subscriberName, eventValue);
  };
}