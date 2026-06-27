const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    totalSeats: { type: Number, required: true },        //* total seats
    availableSeats: { type: Number, required: true },    //available seats
    image: { type: String },
    ticketPrice: { type: Number, required: true, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } //event createdby
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);