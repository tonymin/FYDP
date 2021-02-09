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
            case "USER_PRESENCE_DETECTED":
                console.log(this.name + " USER_PRESENCE_DETECTED." + JSON.stringify(payload));
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
});