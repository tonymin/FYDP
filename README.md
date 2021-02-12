# FYDP

Custom modules:
- MMM-SensorControl

List of 3rd party modules used:
- https://github.com/edward-shen/MMM-pages.git
- https://github.com/Veldrovive/MMM-Page-Selector.git
- https://github.com/edward-shen/MMM-page-indicator.git
- https://github.com/Jopyth/MMM-Remote-Control
- https://github.com/semox/MMM-NearCompliments.git
- https://github.com/paviro/MMM-PIR-Sensor.git


Scripts:
- init.sh
  - Run this script to setup the project (Clone/update repos, install/update dependencies)

- run.sh
  - Run this script to start the MagicMirror
  - "run.sh <dev>" will run in dev mode

MMM-Remote-Control patch:
- Issue: Custom menu slider and input types does not send the value along with notification payload
  - Patch location: file:remote.js function:createMenuElement()
  - Description: The notification object's "payload" property does not include the "value" property of input/slider. Thus it is not delievered to target external modules via notifaction payload.
  - fix (slider type): this.sendSocketNotification("REMOTE_ACTION", Object.assign({ action: content.action.toUpperCase() }, content.content, 
                    { payload: Object.assign({}, content.content == undefined ? {} : content.content.payload, {value: document.getElementById(`${content.id}-slider`).value})},
                    { value: document.getElementById(`${content.id}-slider`).value }));

  - fix (input type): this.sendSocketNotification("REMOTE_ACTION", Object.assign({ action: content.action.toUpperCase() }, content.content, 
                    { payload: Object.assign({}, content.content == undefined ? {} : content.content.payload, {value: document.getElementById(`${content.id}-input`).value})},
                    { value: document.getElementById(`${content.id}-input`).value }));
  - Fix summary: Appends the "value" property in the "payload" tag. Override any existing "value" property.