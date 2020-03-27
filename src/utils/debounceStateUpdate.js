export default eventCallback => {
  let currentMotionStates = {};

  return (onvifDeviceId, motionState) => {
    if (currentMotionStates[onvifDeviceId] === motionState) {
      return;
    }

    currentMotionStates[onvifDeviceId] = motionState;
    eventCallback(onvifDeviceId, motionState);
  };
};