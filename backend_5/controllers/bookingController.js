const Booking = require('../models/Booking');
const Event = require('../models/Event');
const OTP = require('../models/OTP');
const { sendBookingEmail, sendOTPEmail } = require('../utils/email');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();       //user model mai likhna tha

                                                                                       

exports.sendBookingOTP = async (req, res) => {                                           //r otp  or l otp
    try {
        const otp = generateOTP();                                                       //1
        await OTP.findOneAndDelete({ email: req.user.email, action: 'event_booking' });  //2 OTP.findoneandDelete
        await OTP.create({ email: req.user.email, otp, action: 'event_booking' });       //3
        await sendOTPEmail(req.user.email, otp, 'event_booking');                        //special
        res.json({ message: 'OTP sent successfully' });                                  //rcr
    } catch (error) {
        res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
};

exports.bookEvent = async (req, res) => {
    try {
        const { eventId , otp } = req.body;                                               //1 dhyann rkhna ye eventid aur otp postman mai pass kiye the islye liye hai yha
        console.log("otp is", otp );

        // Verify OTP explicitly before proceeding
        const validOTP = await OTP.findOne({ email: req.user.email, otp, action: 'event_booking' });  //2a OTP.findone()
        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP for booking' });
        }

        const event = await Event.findById(eventId);                                     //2b event.findbyId()
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.availableSeats <= 0) return res.status(400).json({ message: 'No seats available' });

        const existingBooking = await Booking.findOne({ userId: req.user.id, eventId });  //2c booking.findone()
        if (existingBooking && existingBooking.status !== 'cancelled') {
            return res.status(400).json({ message: 'Already booked or pending' });
        }

        const booking = await Booking.create({                                            //3
            userId: req.user.id,
            eventId,
            status: 'pending',
            paymentStatus: 'not_paid',
            amount: event.ticketPrice
        });

        await OTP.deleteOne({ _id: validOTP._id }); 

        res.status(201).json({ message: 'Booking request submitted', booking });           //rcr
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.confirmBooking = async (req, res) => {
    try {
        const { paymentStatus } = req.body;                                                //1  dhyann rkhna ye paymentstatus postman mai pass kiye the islye liye hai yha

        const booking = await Booking.findById(req.params.id).populate('userId').populate('eventId');//2a booking.findbyId().populate().populate()
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.status === 'confirmed') return res.status(400).json({ message: 'Booking is already confirmed' });

        const event = await Event.findById(booking.eventId._id);                           //2b event.findbyId()
        if (event.availableSeats <= 0) {
            return res.status(400).json({ message: 'No seats available to confirm this booking' });
        }

        booking.status = 'confirmed';                                                       //special 1
        if (paymentStatus) {
            booking.paymentStatus = paymentStatus;
        }
        await booking.save();                           

        event.availableSeats -= 1;                                                          //special 2
        await event.save();

        await sendBookingEmail(booking.userId.email, booking.userId.name, booking.eventId.title); //special 3

        res.json({ message: 'Booking confirmed successfully', booking });                   //rcr
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const bookings = req.user.role === 'admin'                                           
            ? await Booking.find().populate('eventId').populate('userId', 'name email').sort({ createdAt: -1 }) //2aa booking.find().populate().populate().sort
            : await Booking.find({ userId: req.user.id }).populate('eventId').sort({ createdAt: -1 }); // 2ab booking.find().populate.sort()
        res.json(bookings);                                                                  //rcr
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
    

exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);                               //2 booking.findbyId()
        if (!booking) return res.status(404).json({ message: 'Booking not found' });         
        
        if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {        //special 1 
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (booking.status === 'cancelled')                                                  //special 2 
        return res.status(400).json({ message: 'Already cancelled' });        
         const wasConfirmed = booking.status === 'confirmed';                              
        booking.status = 'cancelled';                                                         
        await booking.save();

        
        if (wasConfirmed) {                                                                   //special 3
            const event = await Event.findById(booking.eventId);
            if (event) {
                event.availableSeats += 1;
                await event.save();
            }
        }

        res.json({ message: 'Booking cancelled successfully' });                             // rcr
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// sare rcr ke 1st r mai bookings pass karna sirf cancel vale ko chhod ke
//in line 1 bookevent mai { eventid , otp } lena hai req.body se and confirmbooking mai { paymentstatus } lena hai hai req.body se