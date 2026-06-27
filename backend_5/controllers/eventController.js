const Event = require('../models/Event');

//Event.find()
exports.getEvents = async (req, res) => {
    try {
        const filters = {};
        if (req.query.category)
             filters.category = req.query.category;
        if (req.query.search) 
            filters.title = { $regex: req.query.search, $options: 'i' };

        //req.query -> question 
        //filters   -> answer

        const events = await Event.find(filters).populate('createdBy', 'name email');
        res.json(events);  
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

//Event.findbyId()
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);  
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

//Event.create()
exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, location, category, totalSeats, ticketPrice, image } = req.body;
        const event = await Event.create({
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            availableSeats: totalSeats,
            ticketPrice: ticketPrice || 0,
            image: image || '',
            createdBy: req.user.id
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

//Event.findbyIandUpdate()
exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

//Event.findbyIdandDelete()
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// khali Event.find() se pehle ek special hai aur Event.create() mai 123 rcr baki sab jagah 23 rcr

// sare type ke find function mai ( req.params.id ) pass krna
// findbyIdandUpdate mai (req.body) extra aega
// create mai to tumhe pata hi hai kya pass karna hai