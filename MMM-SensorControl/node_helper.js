/*
    NOTE: 
    Some Key functionalities are integrated from the MIT liscenced opensource module "MMM-PIR-Sensor"
        credits to the author of https://github.com/paviro/MMM-PIR-Sensor
*/

var NodeHelper = require("node_helper")
const child_process = require("child_process");
const fs = require("fs");

module.exports = NodeHelper.create({
    start: function(){
        console.log(this.name + " has started!");
    },
    
    socketNotificationReceived: function( notification, payload){
        //console.log(this.name + " [node_helper] notification: " + notification);
        switch(notification){
            case "CONFIG":
                this.config = payload;
                break;
            case "LOG":
                // Log to shell
                console.log(this.name + " [node_helper]: " + payload);
                break;
            case "ALL_MODULES_STARTED":
                // start the Python script and pass in configurations as argument
                console.log(this.name + " Starting Python process.");
                this.startSensorScript();
                this.startIdleTimer(); // from RESET state, assume monitor is ON and user is present, start the idle timer
                break;
            case "SENSOR_RESET":
                console.log(this.name + " Respawn Python process.");
                this.startSensorScript();

                break;
            case "PIR_USER_DETECTED":
                console.log(this.name + " PIR detected, payload: " + JSON.stringify(payload));
                
                break;
            case "USER_PRESENCE_DETECTED":
                console.log(this.name + " USER_PRESENCE_DETECTED." + JSON.stringify(payload));
                this.clearIdleTimer();
                this.activateMonitor(); // wont do anything if monitor is already ON
                this.startIdleTimer();

                break;
            case "USER_ABSENT":
                console.log(this.name + " USER_ABSENT." + JSON.stringify(payload));
                this.clearIdleTimer();
                this.deactivateMonitor();
                break;
            default:
                break;
        }
    },

    startSensorScript : function(){
        if (this.py_handle != undefined && this.py_handle != null){	
            // Send SIGTERM to process	
            this.py_handle.kill('SIGTERM');	
        }
        
        // debug log
        const out = fs.openSync(__dirname+"/../../../MMM-SensorControl/test/stdout.log", "w");
        const err = fs.openSync(__dirname+"/../../../MMM-SensorControl/test/stderr.log", "w");

        // spawn script
        this.py_handle = child_process.spawn('python', [__dirname+'/test/sensor_loop.py', 'samepl_arge'],
        {
            stdio: [process.stdin, out, err]
        });	

        this.py_handle.on('close', (code, signal) => {
            console.log( this.name + `Python process terminated due to receipt of signal ${signal}`);	
        });
    },

    activateMonitor : function (){
        
        // Check if hdmi output is already on
        child_process.exec("/usr/bin/vcgencmd display_power").stdout.on('data', function(data) {
            if (data.indexOf("display_power=0") === 0) {
                child_process.exec("/usr/bin/vcgencmd display_power 1", null);
            }
        });
    },

    deactivateMonitor: function (){
        child_process.exec("/usr/bin/vcgencmd display_power 0", null);
    },

    startIdleTimer: function(){
        this.deactivateMonitorTimeout = setTimeout(function() {
            this.deactivateMonitor();
        }, this.config.idle_timer*1000);
    },

    clearIdleTimer: function(){
        clearTimeout(this.deactivateMonitorTimeout);
    },

});