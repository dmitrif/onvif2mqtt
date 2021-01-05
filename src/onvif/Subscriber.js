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
    } else {
      this.logger.info(`Successfully connected.`);
      this.subscribeOnCam();
    }
  };

  subscribeOnCam = () => {
    setTimeout(() => {
      this.cam.createPullPointSubscription((err, _subscription, _xml) => {
          if (!err) {
            this.logger.info(`CreatePullPointSubscription ${this.name}`);
            this.cam.on('event', camMessage => {
              this.onEvent(this.name, camMessage);
            });
         } else {
            this.logger.error(`CreatePullPointSubscription ${this.name}`);
            this.subscribeOnCam();
         }
      });
    }, Math.floor(Math.random() * 5000));
  };
}
