import at from 'lodash.at';
import path from 'path';
import fs from 'fs';
import yaml from 'yaml';
import process from 'process';
import logger, { setLoggingLevel } from './Logger';

const CONFIG_PATH = process.env.CONFIG_PATH || '/config/config.yml';

class Config {
  static instance;

  _config;

  constructor() {
    if (Config.instance) {
      return instance;
    }

    this._config = this._loadConfig();
    setLoggingLevel(this.get('log'));

    Config.instance = this;
    return Config.instance;
  }

  _loadConfig = () => {
    logger.info('Loading configuration.', { configPath: CONFIG_PATH });

    const defaultConfigPath = path.resolve(__dirname, '../default-config.yml');
    const defaultConfigFileRef = fs.readFileSync(defaultConfigPath, 'utf8');

    const configFileRef = fs.readFileSync(CONFIG_PATH, 'utf8');

    const parsedDefaultConfig = yaml.parse(defaultConfigFileRef);
    const parsedConfig = yaml.parse(configFileRef);

    return {
      ...parsedDefaultConfig,
      ...parsedConfig
    };
  };

  get = path => at(this._config, path)[0];
}

export default new Config();