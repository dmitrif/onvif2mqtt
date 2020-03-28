import { Cam } from 'onvif';
import logger from '../Logger';

export default class OnvifSubscriber {
  constructor({ 
    onEvent, 
    onConnect,
    hostname,
    username,
    password,
    port,
    name,
  }) {
    this.logger = logger.child({ name: `ONVIF/${name}`, hostname });

    this.onEvent = onEvent;
    this.name = name;
    this.onConnect = onConnect;

    this.logger.info(`Attempting connection.`);

    this.cam = new Cam({
      hostname,
      username,
      password,
      port,
      preserveAddress: true
    }, this.onSubscribe);
  }

  onSubscribe = (err) => {
    if (err) {
      this.logger.error(`Failed to connect to ${this.name}`, err);
    }

    this.logger.info(`Successfully connected.`);

    this.cam.createPullPointSubscription((err) => {
      this.cam.on('event', camMessage => {
        this.onEvent(this.name, camMessage);
      });
    });
  };
}