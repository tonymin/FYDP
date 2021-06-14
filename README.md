# Final year design project Electrical Engineering 2021

Custom modules:
- MMM-SensorControl

List of 3rd party modules used:
- https://github.com/edward-shen/MMM-pages.git
- https://github.com/edward-shen/MMM-page-indicator.git
- https://github.com/Jopyth/MMM-Remote-Control


Scripts:
- init.sh
  - Run this script to setup the project (Clone/update repos, install/update dependencies)

- run.sh
  - Run this script to start the MagicMirror
  - "run.sh <dev>" will run in dev mode

MMM-Remote-Control patch:
- Issue: Custom menu slider and input types does not send the value along with notification payload
  - Patch location: file:remote.js function:createMenuElement()
  - Description: The notification object's "payload" property does not include the "value" property of input/slider. Thus it is not delievered to target external modules via notification payload.
  - fix (slider type): this.sendSocketNotification("REMOTE_ACTION", Object.assign({ action: content.action.toUpperCase() }, content.content, 
                    { payload: Object.assign({}, content.content == undefined ? {} : content.content.payload, {value: document.getElementById(`${content.id}-slider`).value})},
                    { value: document.getElementById(`${content.id}-slider`).value }));

  - fix (input type): this.sendSocketNotification("REMOTE_ACTION", Object.assign({ action: content.action.toUpperCase() }, content.content, 
                    { payload: Object.assign({}, content.content == undefined ? {} : content.content.payload, {value: document.getElementById(`${content.id}-input`).value})},
                    { value: document.getElementById(`${content.id}-input`).value }));
  - Fix summary: Appends the "value" property in the "payload" tag. Override any existing "value" property.

- Custom menu dropdown feature
```
        else if (content.type === "dropdown") {
            $item = $("<select>").addClass(`menu-element ${menu}-menu medium`).attr({
                "id": `${content.id}-dropdown`,
            });
            content.list.forEach(item => $item.append(new Option(item, item)));
            
            $item.change(() => {
                this.sendSocketNotification("REMOTE_ACTION", Object.assign({ action: content.action.toUpperCase() }, content.content, { payload: Object.assign({}, content.content == undefined ? {} : (typeof content.content.payload === 'string' ? {string: content.content.payload} : content.content.payload), {value: document.getElementById(`${content.id}-dropdown`).value})}, { value: document.getElementById(`${content.id}-dropdown`).value }));
            })
        }
```
