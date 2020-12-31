import at from 'lodash.at';
import path from 'path';
import fs, { exists } from 'fs';
import yaml from 'yaml';
import process from 'process';
import validator from './ConfigValidator';
import merge from 'merge-deep';
import logger, { setLoggingLevel } from './Logger';
import chokidar from 'chokidar';
import isEqual from 'lodash.isequal';

const DEFAULT_CONFIG_PATH = path.resolve(__dirname, '../default-config.yml');
const CONFIG_PATH = process.env.CONFIG_PATH || '/config/config.yml';

class Config {
  _config;

  constructor(onConfigChangeCallback) {

    this._config = this._loadConfig();
    setLoggingLevel(this.get('log'));

    this.onConfigChange(onConfigChangeCallback);
  }

  _loadDefaultConfig = () => {
    const defaultConfigFileRef = fs.readFileSync(DEFAULT_CONFIG_PATH, 'utf8');
    return yaml.parse(defaultConfigFileRef);
  };

  _loadUserConfig = () => {
    logger.info('Loading configuration.', { configPath: CONFIG_PATH });

    const configFileRef = fs.readFileSync(CONFIG_PATH, 'utf8');

    let parsedConfig = {};

    try {
      parsedConfig = yaml.parse(configFileRef);
    } catch(e) {
      logger.error('Invalid YAML found in configuration', { source: e.source });
      logger.error(e);
      logger.error();
      process.exit(1);
    }

    return parsedConfig;
  };

  _validate = (config) => {
    logger.info('Validating configuration file.');
    const validationErrors = validator.validate(config);

    if (validationErrors.length > 0) {
      logger.error('Config validation failed...');
      validationErrors.forEach(({ path, message }) => {
        logger.error(message, { path });
      });
      process.exit(1);
    }
  };

  _loadConfig = () => {
    const defaultConfig = this._loadDefaultConfig();
    const userConfig = this._loadUserConfig();

    const mergedConfig = merge(
      defaultConfig,
      userConfig
    );

    this._validate(mergedConfig);
    return mergedConfig;
  };

  onConfigChange = (callback) => {
    const watcher = chokidar.watch([DEFAULT_CONFIG_PATH, CONFIG_PATH]);
    watcher.on('change', async () => {
      let tempConfig = this._loadConfig();
      // Check if onvif device config changed. Only this change observe
      if (tempConfig?.onvif && this._config?.onvif) {
        if (!isEqual(tempConfig?.onvif, this._config?.onvif)) {
          this._config = tempConfig;
          callback();
        }
      }
    });
  };

  get = path => at(this._config, path)[0];
}

export default Config;