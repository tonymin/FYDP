

Module.register("MMM-SensorControl",{

    requiresVersion: "2.1.0", // minimum MagicMirror version to run this module

    // module configurations (default)
    defaults:{
        text: "Hello world",
        idle_timer: 10, // in seconds
        max_ultrasonic_range: 100 // in cm
    },

    start: function() {
        // after all modules are loaded and ready to start. DOM objects not created yet

        Log.info("Starting module: " + this.name);
        this.sendSocketNotification('CONFIG', this.config);
        this.my_temp_counter = 0
        
          
    },

    getDom: function(){
        var wrapper = document.createElement("div");
        //wrapper.innerHTML = this.config.text;
        var ul = document.createElement("ul")
        
        var li_gesture=document.createElement('li');
        li_gesture.innerHTML="Last Gesture:" + this.config.text;
        ul.appendChild(li_gesture);

        wrapper.appendChild(ul);
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
        this.sendSocketNotification(notification, payload); // forwatd all notifications to node hlper
        switch(notification){
            case "DOWN_GESTURE":
                this.sendSocketNotification(notification, payload);
                this.config.text = "DOWN";
                this.updateDom();
                break;
            case "LEFT_GESTURE":
                this.sendSocketNotification(notification, payload);
                this.config.text = "LEFT";
                this.updateDom();
                break;
            case "RIGHT_GESTURE":
                this.sendSocketNotification(notification, payload);
                this.config.text = "RIGHT";
                this.updateDom();
                break;
            case "UP_GESTURE":
                this.sendSocketNotification(notification, payload);
                this.config.text = "UP";
                this.updateDom();
                break;
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

    socketNotificationReceived: function(notification, payload){
        // notifications  directly from node_helper
        this.sendSocketNotification("LOG", this.name+ " received node_helper notification: " + notification);
        let lockStringObj = { lockString: this.identifier };
        switch(notification){
            case "SHOW_ALL":
                MM.getModules().enumerate(module => module.show(1000, lockStringObj));
                break;
            case "HIDE_ALL":
                MM.getModules().enumerate(module => module.hide(1000, lockStringObj));
                //setTimeout(() => {MM.getModules().enumerate(module => module.show(1000, lockStringObj));}, 5000); // just for testing
                break;
            case "PAGE_DECREMENT":
                this.sendNotification("PAGE_DECREMENT")
                break;
            case "PAGE_INCREMENT":
                this.sendNotification("PAGE_INCREMENT")
                break;
            case "BROADCAST_NOTIFICATION":
                this.sendSocketNotification("LOG", this.name+ " [BROADCAST_NOTIFICATION]: " + payload.notification + " payload:" + payload.payload);
                this.sendNotification(payload.notification, payload.payload)
                break;
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

        // gestures
        registeredActions.up_gesture = {
            notification: "UP_GESTURE",
        };
        registeredActions.down_gesture = {
            notification: "DOWN_GESTURE",
        };
        registeredActions.left_gesture = {
            notification: "LEFT_GESTURE",
        };
        registeredActions.right_gesture = {
            notification: "RIGHT_GESTURE",
        };

        registeredActions.user_detected = {
            notification: "USER_PRESENCE_DETECTED",
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