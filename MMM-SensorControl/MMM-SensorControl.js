

Module.register("MMM-SensorControl",{

    requiresVersion: "2.1.0", // minimum MagicMirror version to run this module

    // module configurations (default)
    defaults:{
        text: "Hello world"
    },

    start: function() {
        Log.info("Starting module: " + this.name);
    },

    getDom: function(){
        var wrapper = document.createElement("div");
        wrapper.innerHTML = this.config.text;
        return wrapper;
    },

    loaded: function(callback){
        this.finishLoading();
        console.log(this.name + " is loaded!");
        callback();
    },

    notificationRecieved: function(notification, payload, sender){
        // notifications from all modules
    },

    socketNotificationRecieved: function(notification, payload){
        // notifications  directly from node_helper
    },

});