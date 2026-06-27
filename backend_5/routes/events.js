const express = require('express');
const router = express.Router();
const { getEvents, getEventById, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getEvents);
router.get('/:id', getEventById);

router.post('/', protect, admin, createEvent);                    // only for admin dashboard
router.put('/:id', protect, admin, updateEvent);                  // only for admin dashboard
router.delete('/:id', protect, admin, deleteEvent);               // only for admin dashboard

module.exports = router;