var NodeHelper = require("node_helper")
const { spawn } = require('child_process');


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
                
                this.py_handle = spawn('python3', ['/home/pi/projects/FYDP/MMM-SensorControl/test/sensor_loop.py', 'samepl_arge']);
                this.py_handle.on('close', (code, signal) => {
                    console.log( this.name + `Python process terminated due to receipt of signal ${signal}`);
                });
                

                break;
            case "SENSOR_RESET":
                console.log(this.name + " Respawn Python process.");
                
                if (this.py_handle != null){
                    // Send SIGTERM to process
                    this.py_handle.kill('SIGTERM');
                }
                // respawn
                
                this.py_handle = spawn('python3', ['/home/pi/projects/FYDP/MMM-SensorControl/test/sensor_loop.py', 'samepl_arge']);
                this.py_handle.on('close', (code, signal) => {
                    console.log( this.name + `Python process terminated due to receipt of signal ${signal}`);
                });
                
                
                break;
            default:
                break;
        }
    },

});

