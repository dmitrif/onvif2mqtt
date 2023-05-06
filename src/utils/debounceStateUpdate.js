export default (eventCallback) => {
  let currentMotionStates = {};

  return (onvifDeviceId, motionState, ...args) => {
    if (currentMotionStates[onvifDeviceId] && currentMotionStates[onvifDeviceId].IsMotion === motionState.IsMotion) {
      return;
    }

    currentMotionStates[onvifDeviceId] = motionState;
    eventCallback(onvifDeviceId, motionState, ...args);
  };
};
