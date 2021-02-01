

Module.register("MMM-SensorControl",{

    requiresVersion: "2.1.0", // minimum MagicMirror version to run this module

    // module configurations (default)
    defaults:{
        text: "Hello world"
    },

    start: function() {
        // after all modules are loaded and ready to start. DOM objects not created yet

        Log.info("Starting module: " + this.name);
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
            case "PIR_USER_DETECTED":
                this.my_temp_counter += 1
                this.sendSocketNotification("LOG", "PIR detected, payload: " + JSON.stringify(payload));
                // Register API actions for MMM-Remote-Control.
                this.sendNotification("REGISTER_API", {
                    module: this.name, 
                        path: this.name, 
                        actions: {
                            pir_trigger: { 
                                notification: "PIR_USER_DETECTED",
                                payload: {
                                    'counter':this.my_temp_counter,
                                    'x': 1
                                }
                            },

                        }    
                });
                break;
            case "ALL_MODULES_STARTED":
                // now we can send notifications to other modules
                
                // Register API actions for MMM-Remote-Control.
                this.sendNotification("REGISTER_API", {
                    module: this.name, 
                        path: this.name, 
                        actions: {
                            pir_trigger: { 
                                notification: "PIR_USER_DETECTED",
                                payload: {
                                    'counter':this.my_temp_counter,
                                    'x': 1
                                }
                            },

                        }    
                });
                break;
            default:
                break;
        }
    },

    socketNotificationRecieved: function(notification, payload){
        // notifications  directly from node_helper
    },

    updateRemoteControlAPI : function(notification){
        // registers API for MMM-Remote-Control
        let actions = {}
        if (notification == 'ALL' || notification == "PIR_USER_DETECTED"){
            actions.pir_trigger = {notification: "PIR_USER_DETECTED",
            payload: {
                'counter':this.my_temp_counter,
                'x': 1
            }}
             
                    
        }

    },

});