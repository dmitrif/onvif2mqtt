const PREFIX = '${';
const SUFFIX = '}';

export default (template, values) => Object.keys(values).reduce(
  (result, key) => result.split(`${PREFIX}${key}${SUFFIX}`).join(values[key]), 
  template
);