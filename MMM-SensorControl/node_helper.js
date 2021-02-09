var NodeHelper = require("node_helper")
//const { spawn } = require('child_process');
const child_process = require("child_process");
const fs = require("fs");

module.exports = NodeHelper.create({
    start: function(){
        console.log(this.name + " has started!");
    },
    
    socketNotificationReceived: function( notification, payload){
        //console.log(this.name + " [node_helper] notification: " + notification);
        switch(notification){
            case "LOG":
                // Log to shell
                console.log(this.name + " [node_helper]: " + payload);
                break;
            case "ALL_MODULES_STARTED":
                // start the Python script and pass in configurations as argument
                console.log(this.name + " Starting Python process.");
                this.startSensorScript();
                break;
            case "SENSOR_RESET":
                console.log(this.name + " Respawn Python process.");
                this.startSensorScript();

                break;
            case "USER_PRESENCE_DETECTED":*