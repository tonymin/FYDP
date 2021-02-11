

Module.register("MMM-SensorControl",{

    requiresVersion: "2.1.0", // minimum MagicMirror version to run this module

    // module configurations (default)
    defaults:{
        text: "Hello world",
        idle_timer: 10, // in seconds
    },

    start: function() {
        // after all modules are loaded and ready to start. DOM objects not created yet

        Log.info("Starting module: " + this.name);
        this.sendSocketNotification('CONFIG', this.config);
        this.my_temp_counter = 0
        
          
    },

    getDom: function(){
        var wrapper = document.createElement("div");
        wrapper.innerHTML = this.config.text;
        return wrapper;
    },

    loaded: function(callback){
        // after this module is loaded, other modules may not be loaded
        this.finishLoading();
        console.log(this.name + " is loaded!");

        callback();
    },

    notificationReceived: function(notification, payload, sender) {
        // notifications from all modules
        // Log.log(this.name + " received a module notification: " + notification);
        switch(notification){
            case "USER_PRESENCE_DETECTED":
                this.sendSocketNotification(notification, payload);
                break;
            case "USER_ABSENT":
                this.sendSocketNotification(notification, payload);
                break;
            case "PIR_USER_DETECTED":
                this.sendSocketNotification(notification, payload);
                
                break;
            case "SENSOR_RESET":
                Log.log(this.name + " SENSOR reset");
                this.sendSocketNotification(notification);
                
                break;
            case "ALL_MODULES_STARTED":
                // now we can send notifications to other modules
                this.updateRemoteControlAPI();

                this.sendSocketNotification(notification); // call this last
                break;
            default:
                break;
        }
    },

    socketNotificationRecieved: function(notification, payload){
        // notifications  directly from node_helper
        Log.log(this.name + " received node_helper notification: " + notification);
        switch(notification){
            default:
                break;
        }
        
    },

    updateRemoteControlAPI : function(){
        // registers API for MMM-Remote-Control
        let registeredActions = {}

        // testing state update
        this.my_temp_counter += 1;

        // PIR sensor
        registeredActions.pir_trigger = {
            notification: "PIR_USER_DETECTED",
            payload: {
                'counter':this.my_temp_counter,
                'x': 1
            }
        };

        // user absent (PIR detects 0 or Ultrasonic does not detect object within range)
        registeredActions.user_absent = {
            notification: "USER_ABSENT",
        };

        // user presence
        registeredActions.user_detected = {
            notification: "USER_PRESENCE_DETECTED",
        };


        // reset signal
        // TODO: do we expose this? or do we use the reset notification internally
        registeredActions.reset_sensor = {
            notification: "SENSOR_RESET",
        };
        
        
        this.sendSocketNotification("LOG", "API update: " + JSON.stringify(registeredActions));

        // send notication to update the API configurations
        this.sendNotification("REGISTER_API", {
            module: this.name, 
            path: this.name, 
            actions: registeredActions
        });

    },

});