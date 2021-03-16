var NodeHelper = require("node_helper")
const child_process = require("child_process");
const fs = require("fs");

module.exports = NodeHelper.create({
    start: function(){
        console.log(this.name + " has started!");
        console.log(this.name + " Running network script!");
        child_process.exec("sudo python "+__dirname+"/../../../MMM-SensorControl/scripts/prepare_custom_menu.py", null);

        this.monitorActive = true;

        // need to configure default gesture mapping
        this.up_action = this.showAll;
        this.down_action = this.hideAll;
        this.left_action = this.pageUp;
        this.right_action = this.pageDown;

        // process to check for internet connection, if no connection, turn on AP
        this.internetChecker = setInterval(() => {
            require('dns').resolve('www.google.com', function(err) {
                if (err) {
                    child_process.exec("sudo ifconfig wlan1 up", null);
                }
            });
        }, 12000);

    },
    
    socketNotificationReceived: function( notification, payload){
        //console.log(this.name + " [node_helper] notification: " + notification + " Payload: "+payload);
        var self = this;
        switch(notification){
            case "DISABLE_ACCESS_POINT":
                this.disableAP();
                break;
            case "ENABLE_ACCESS_POINT":
                this.enableAP();
                break;
            case "NETWORK_SSID":
                this.network_ssid = payload.value;
                this.attemptNetworkConnectionOnlySSID();
                break;
            case "NETWORK_PSK":
                this.network_psk = payload.value;
                if (this.network_ssid != undefined){
                    this.attemptNetworkConnection();
                }
                break;
            case "NOTIFICATION_INPUT":
            case "NOTIFICATION_SLIDER":
            case "NOTIFICATION_DROPDOWN":
                console.log(this.name + " [node_helper] notification: " + notification + " Payload: %j",payload);
                break;
            case "DOWN_GESTURE":
                this.down_action();
                console.log("DOWN_GESTURE")
                break;
            case "LEFT_GESTURE":
                this.left_action();
                console.log("LEFT_GESTURE")
                break;
            case "RIGHT_GESTURE":
                this.right_action();
                console.log("RIGHT_GESTURE")
                break;
            case "UP_GESTURE":
                this.up_action();
                console.log("UP_GESTURE")
                break;
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
                this.startSensorScript(); // user presence detection loop
                this.startGestureDetectionScript(); // gesture sensor loop
                this.resetIdleTimer(); // from RESET state, assume monitor is ON and user is present, start the idle timer
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
                this.activateMonitor(); // wont do anything if monitor is already ON
                this.resetIdleTimer();

                break;
            case "USER_ABSENT":
                console.log(this.name + " USER_ABSENT." + JSON.stringify(payload));
                this.resetIdleTimer();
                break;
            default:
                this.gestureMappingNotification(notification); // checking if gesture mapping notification
                break;
        }
    },

    gestureMappingNotification : function(notification){
        // gesture mapping notification syntax: GESTURE_<Direction>_<Action>. E.g. GESTURE_UP_SHOWALL
        var regex = /gesture_(.*)_(.*)/i;
        var found = notification.match(regex);
        if (found === null){
            return;
        }

        // get the action function
        var action = found[2];
        var action_function = null;
        switch(action){
            case "HIDEALL":
                action_function = this.hideAll;
                break;
            case "SHOWALL":
                action_function = this.showAll;
                break;
            case "PAGEUP":
                action_function = this.pageUp;
                break;
            case "PAGEDOWN":
                action_function = this.pageDown;
                break;
            default:
                break;
        }

        if (action_function === null){
            console.log(this.name + " [gestureMappingNotification] ERROR: Unable to map a action function!");
            return;
        }

        // assign action handles
        var direction = found[1];
        switch(direction){
            case "UP":
                this.up_action = action_function;
                break;
            case "DOWN":
                this.down_action = action_function;
                break;
            case "LEFT":
                this.left_action = action_function;
                break;
            case "RIGHT":
                this.right_action = action_function;
                break;
            default:
                console.log(this.name + " [gestureMappingNotification] ERROR: Direction invalid");
                break;
        }
        
    },

    startSensorScript : function(){
        if (this.py_handle != undefined && this.py_handle != null){	
            // Send SIGTERM to process	
            this.py_handle.kill('SIGTERM');	
        }

        var self = this;
        
        // debug log
        const out = fs.openSync(__dirname+"/../../../MMM-SensorControl/scripts/stdout.log", "w");
        const err = fs.openSync(__dirname+"/../../../MMM-SensorControl/scripts/stderr.log", "w");

        // spawn script
        this.py_handle = child_process.spawn('python', [__dirname+'/scripts/sensor_loop.py', '\''+JSON.stringify(self.config)+'\''],
        {
            stdio: [process.stdin, out, err]
        });	

        this.py_handle.on('close', (code, signal) => {
            console.log( self.name + `Python process (user presence) terminated due to receipt of signal ${signal}`);	
        });
    },

    startGestureDetectionScript : function(){
        if (this.gesture_py_handle != undefined && this.gesture_py_handle != null){	
            // Send SIGTERM to process	
            this.gesture_py_handle.kill('SIGTERM');	
        }

        var self = this;
        
        // debug log
        const out = fs.openSync(__dirname+"/../../../MMM-SensorControl/scripts/stdout_gesture.log", "w");
        const err = fs.openSync(__dirname+"/../../../MMM-SensorControl/scripts/stderr_gesture.log", "w");

        // spawn script
        this.gesture_py_handle = child_process.spawn('python3', [__dirname+'/scripts/gesture_loop.py'],
        {
            stdio: [process.stdin, out, err]
        });	

        this.gesture_py_handle.on('close', (code, signal) => {
            console.log( self.name + `Python process (gesture) terminated due to receipt of signal ${signal}`);	
        });
    },

    activateMonitor : function (){
        var self = this;

        if (self.monitorActive === false){
            this.sendSocketNotification("SHOW_ALL", true);
            self.monitorActive = true;
        }
        
        /*
        // Check if hdmi output is already on
        child_process.exec("/usr/bin/vcgencmd display_power").stdout.on('data', function(data) {
            if (data.indexOf("display_power=0") === 0) {
                child_process.exec("/usr/bin/vcgencmd display_power 1", null);
                console.log( self.name + ` Powering ON monitor`);	
            }
        });
        */
    },

    deactivateMonitor: function (){
        var self = this;
        
        console.log( self.name + ` Powering OFF monitor`);	

        //child_process.exec("/usr/bin/vcgencmd display_power 0", null);

        this.sendSocketNotification("HIDE_ALL", true);
        self.monitorActive = false;
        //this.pageDown();
    },

    resetIdleTimer: function(){
        var self = this;
        clearTimeout(self.deactivateMonitorTimeout);
        var time = self.config.idle_timer;
        if (typeof time != "number" || time < 5) {
            console.log("idle_timer reset to 5.");
            time = 5;
        }
        self.deactivateMonitorTimeout = setTimeout(function() {
            self.deactivateMonitor();
        }, time*1000);
    },

    clearIdleTimer: function(){
        var self = this;
        clearTimeout(self.deactivateMonitorTimeout);
    },

    attemptNetworkConnectionOnlySSID : function(){
        var self = this;
        child_process.exec("sudo python "+__dirname+"/../../../MMM-SensorControl/scripts/network.py "+self.network_ssid, null);
    },

    attemptNetworkConnection : function(){
        var self = this;
        child_process.exec("sudo python "+__dirname+"/../../../MMM-SensorControl/scripts/network.py "+self.network_ssid + " --psk "+self.network_psk, null);
    },

    disableAP : function(){
        var self = this;
        // assume AP is wlan1. Only allow shut down if connected to network on wlan0.
        require('dns').resolve('www.google.com', function(err) {
            if (err) {
                console.log("No internet connection, AP cannot be shut down!");
                self.sendSocketNotification("BROADCAST_NOTIFICATION", {notification:'SHOW_ALERT', payload: {
                    title: "Access Point",
                    message: "No internet connection, AP cannot be shut down!",
                    timer: 3000
                }});
            } else {
                child_process.exec("sudo ifconfig wlan1 down", null);
                self.sendSocketNotification("BROADCAST_NOTIFICATION", {notification:'SHOW_ALERT', payload: {
                    title: "Access Point",
                    message: "DISABLED",
                    timer: 3000
                }});
            }
        });
    },

    enableAP : function(){
        var self= this;
        // assume AP is wlan1
        child_process.exec("sudo ifconfig wlan1 up", null);
        self.sendSocketNotification("BROADCAST_NOTIFICATION", {notification:'SHOW_ALERT', payload: {
            title: "Access Point",
            message: "ENABLED",
            timer: 3000
        }});
    },

    pageUp : function(){
        //this.sendSocketNotification("PAGE_INCREMENT");
        this.sendSocketNotification("BROADCAST_NOTIFICATION", {notification:'PAGE_INCREMENT'});
    },

    pageDown : function(){
        //this.sendSocketNotification("PAGE_DECREMENT");
        this.sendSocketNotification("BROADCAST_NOTIFICATION", {notification:'PAGE_DECREMENT'});
    },

    showAll : function(){
        //this.startSensorScript(); // reset sensor script so it doesn
        //this.activateMonitor(); // wont do anything if monitor is already ON
        if (self.monitorActive === false){
            this.sendSocketNotification("SHOW_ALL", true);
            this.resetIdleTimer();
            self.monitorActive === true;
        }
    },

    hideAll : function(){
        // if monitor is active, force deactivate
        if (self.monitorActive === true){
            this.startSensorScript(); // reset script

            // hide all after 1 second to avoid late coming notifications that activates monitor
            setTimeout(function() {
                this.deactivateMonitor();
            }, 1000);
            
        }
        
    },
    


});