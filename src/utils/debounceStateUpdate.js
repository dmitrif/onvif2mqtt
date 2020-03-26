export default eventCallback => {
  let currentMotionState = null;

  return (onvifDeviceId, motionState) => {
    if (currentMotionState === motionState) {
      return;
    }

    currentMotionState = motionState;
    eventCallback(onvifDeviceId, motionState);
  };
};