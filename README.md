# ONVIF2MQTT
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-6-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

## Table of Contents
* [ONVIF2MQTT](#onvif2mqtt)
  * [Purpose](#purpose)
  * [Background](#background)
  * [Requirements](#requirements)
  * [Hardware Compatibility](#hardware-compatibility)
  * [Supported Events](#supported-events)
  * [Installation](#installation)
    * [Docker](#docker)
    * [Baremetal](#baremetal)
  * [Configuration](#configuration)
    * [Notes](#notes)
    * [MQTT Notes](#mqtt-notes)
    * [Templating / Custom Topics](#templating--custom-topics)
    * [Schema](#schema)
  * [Examples / Guides](#examples--guides)
    * [Using with Shinobi](#using-with-shinobi)
    * [Using with HomeAssistant](#using-with-homeassistant)
    * [Getting Started / Sample Config](#getting--started)

## Purpose

This package aims to implement a transformation layer between the ONVIF event stream (sourced from IP cameras / camera doorbells) and MQTT (a messaging protocol largely used in home automation). 

Any number of ONVIF devices is supported.

## Background

After acquiring an EzViz DB1 camera doorbell, I was happy to find a PIR sensor on it. I was then dismayed to find out that there is no open API to consume the triggered status of it. This project was written to scratch that itch, but it should work for any other ONVIF compliant devices with built-in sensors.

## Requirements
- Docker (unless running Baremetal)
- MQTT Broker
- At least one ONVIF compatible device implementing events.

## Hardware Compatibility
- EZViz DB-1 Doorbell (flashed with LaView firmware) - **TESTED**
- EZViz DB-1 Doorbell (flashed with HikVision 200321 firmware) - **TESTED**
- Nelly's Security Doorbell (NSC-DB2) (flashed with Nelly's v5.2.4 191216 firmware) - **TESTED**
- Laview Halo One Doorbell - **TESTED**
- SV3C SV-B01POE-5MPL-A - **TESTED**
- IMOU cue 2 - **TESTED**
- Provision ISR I3-340IP536+ - **TESTED**
- Provision ISR I4-340IP5MVF - **TESTED**
- RCA HSDB2A Doorbell (flashed with LaView firmware)
- Hikvision DB2 - **Does not work, TODO: implement push point subscriptions.**
- Any other ONVIF compliant IP Camera - if it works for you please let me know so that this list can be updated.

## Supported Events
- Motion Sensor
- That's it for now, but it's easy to implement new events, just submit a PR or a ticket.

## Installation

### Docker
This is the recommended method of consumption for everyday users.
1. [Pull the image from docker registry.](https://hub.docker.com/r/dfarkov/onvif2mqtt) 
```
docker pull dfarkov/onvif2mqtt:latest
```
2. Run the image, mounting a config volume containing your configuration (`config.yml`)
```
docker run -v PATH_TO_CONFIGURATION_FOLDER:/config dfarkov/onvif2mqtt
```

### Baremetal
This method requires an installation of NodeJS / NPM. This is the recommended installation method for development purposes.

1. Clone this repo
```
git clone https://github.com/dmitrif/onvif2mqtt
```
2. Navigate to the repo folder.
```
cd ./onvif2mqtt
```
3. Install dependencies
```
npm install
```
4. Create and fill out a configuration file:
```
touch config.dev.yml
```
5. Run the app:
```
# For development
npm run dev

# For production build
npm run build
CONFIG_FILE=./config.dev.yml npm run start
```

## Configuration

### Notes

Configuration can be placed into a `config.yml` file, containing valid YAML. This file should be placed into the host-mounted config volume; if another location is preferred then the file path can be provided as an environment variable `CONFIG_PATH`.

### MQTT Notes

By default this package publishes events to an topic `onvif2mqtt/$ONVIF_DEVICE/$EVENT_TYPE/` with a value of `on | off` for each captured event type. 

### Templating / Custom Topics

However, by using the `api.templates` option in configuration, one can define a custom `subtopic` and specify a custom template. The following tokens will be interpolated in both the `subtopic` and the `template` values:

- `${onvifDeviceId}` - name of the ONVIF device (e.g. `doorbell`)
- `${eventType}` - type of event captured (e.g. `motion`)
- `${eventState}` - boolean state of the event (if applicable)

The messages will be sent to a topic of the following format: `onvif2mqtt/$ONVIF_DEVICE/$SUBTOPIC`.

### Schema

```yaml
api:
  templates:
    #Subtopics can be nested with `/` and are interpolated
    - subtopic: ${eventType}/json 
      # Should this message be retained by MQTT
      # Defaults to true
      retain: false
      # Template that should be published to the topic, 
      # values are interpolated
      template: >- 
        { 
          "device": "${onvifDeviceId}", 
          "eventType": "${eventType}", 
          "state": "${eventState}" 
        }
    # You can specify any number of custom subtopics.
    - subtopic: hello_world
      template: hello from ${onvifDeviceId}
# MQTT Broker configuration, 
# required due to nature of project.
mqtt:
  host: 192.168.0.57
  port: 1883
  username: user
  password: password
# All of your ONVIF devices
onvif:
  # Name for the device (used in MQTT topic)
  - name: doorbell
    hostname: localhost
    port: 80
    username: admin
    password: admin
```

## Examples / Guides

### Using with Shinobi

1. [Configure Shinobi.video to use `mqtt`](https://hub.shinobi.video/articles/view/xEMps3O4y4VEaYk)
2. Configure a shinobi monitor to trigger motion detector on API events.
3. Add custom subtopic for shinobi:
```yaml
...
api:
  templates:
    - subtopic: shinobi
      retain: false
      template: >-
        { 
          "plug": "${onvifDeviceId}", 
          "reason": "${eventType}", 
          "name": "${onvifDeviceId}" 
        }
...
```

### Using with HomeAssistant
1. Install the MQTT HomeAssistant integration.
2. Define custom `binary_sensor` in HomeAssistant's `configuration.yaml`:
```yaml
binary_sensor doorbell_motion:
  - platform: mqtt
    name: doorbell_motion
    state_topic: "onvif2mqtt/doorbell/motion"
```

### Getting  Started
Simplest way forward is to base your configuration off [`config.sample.yml`](https://github.com/dmitrif/onvif2mqtt/blob/master/config.sample.yml).

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/ksupipr"><img src="https://avatars1.githubusercontent.com/u/2247971?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Michael Bogatyrev</b></sub></a><br /><a href="https://github.com/dmitrif/onvif2mqtt/commits?author=ksupipr" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/dmitrif"><img src="https://avatars0.githubusercontent.com/u/655800?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dmitri Farkov</b></sub></a><br /><a href="https://github.com/dmitrif/onvif2mqtt/commits?author=dmitrif" title="Code">💻</a> <a href="https://github.com/dmitrif/onvif2mqtt/commits?author=dmitrif" title="Documentation">📖</a> <a href="#maintenance-dmitrif" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://casillo.me"><img src="https://avatars0.githubusercontent.com/u/9551125?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Domenico Casillo</b></sub></a><br /><a href="https://github.com/dmitrif/onvif2mqtt/commits?author=DomenicoCasillo" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/brilthor"><img src="https://avatars2.githubusercontent.com/u/567144?v=4?s=100" width="100px;" alt=""/><br /><sub><b>brilthor</b></sub></a><br /><a href="https://github.com/dmitrif/onvif2mqtt/commits?author=brilthor" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/bgilmer77"><img src="https://avatars2.githubusercontent.com/u/7648629?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Brad Gilmer</b></sub></a><br /><a href="https://github.com/dmitrif/onvif2mqtt/commits?author=bgilmer77" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/DJTim"><img src="https://avatars1.githubusercontent.com/u/4507858?v=4?s=100" width="100px;" alt=""/><br /><sub><b>DJTim</b></sub></a><br /><a href="https://github.com/dmitrif/onvif2mqtt/commits?author=DJTim" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!