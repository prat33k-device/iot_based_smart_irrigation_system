const mongoose = require("mongoose");

const pump_status_schema = new mongoose.Schema({
    status: {
        type: Number,
        min: [0, "Status can't be other than 0 or 1.  Entererd value: {VALUE}"],
        max: [1, "Status can't be other than 0 or 1.  Entererd value: {VALUE}"]
    },
    last_updated_time: Date
});

module.exports = mongoose.model("pump_status", pump_status_schema);