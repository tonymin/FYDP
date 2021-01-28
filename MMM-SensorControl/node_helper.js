var NodeHelper = require("node_helper")
module.exports = NodeHelper.create({
    start: function(){
        console.log(this.name + " has started!");
    },
});

