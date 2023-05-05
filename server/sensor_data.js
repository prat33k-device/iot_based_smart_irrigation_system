const mongoose = require("mongoose");

const sensor_data_schema = mongoose.Schema({
    soil_moisture: {
        type: Number,
        required: [true, "Can't add data without specifing soil moisture value"]
    },
    temperature: Number,
    humidity: Number,
    time: { 
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model("sensor_data", sensor_data_schema);