

Module.register("MMM-SensorControl",{

    requiresVersion: "2.1.0", // minimum MagicMirror version to run this module

    // module configurations (default)
    defaults:{
        text: "Hello world"
    },

    start: function() {
        // after all modules are loaded and ready to start. DOM objects not created yet

        Log.info("Starting module: " + this.name);

        
          
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
            case "GET_REQ":
                this.sendSocketNotification("LOG", "'GET_REQ' received!");
                break;
            case "ALL_MODULES_STARTED":
                // now we can send notifications to other modules
                // Register API actions for MMM-Remote-Control
                this.sendNotification("REGISTER_API", {
                    module: this.name, 
                        path: "MMM-SensorControl", 
                        actions: {   
                            getrequests111: { 
                                notification: "GET_REQ"
                            }
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

});