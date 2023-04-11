const mongoose = require("mongoose");

const sensor_data_schema = mongoose.Schema({
    sensor_name: {
        type: String,
        required: [true, "Can't add data without specifing sensor_name"]
    },
    value: {
        type: Number,
        required: [true, "Can't add data without specifing sensor value"]
    },
    unit: String,
    time: { 
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("sensor_data", sensor_data_schema);