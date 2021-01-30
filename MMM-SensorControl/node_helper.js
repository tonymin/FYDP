var NodeHelper = require("node_helper")
module.exports = NodeHelper.create({
    start: function(){
        console.log(this.name + " has started!");
    },

    socketNotificationRecieved: function( notification, payload){
        switch(notification){
            case "LOG":
                console.log(this.name + " [node_helper]: " + payload);
                break;
            default:
                break;
        }
    },

});

