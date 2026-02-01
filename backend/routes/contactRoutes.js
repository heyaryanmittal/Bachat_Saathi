const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const auth = require('../middleware/auth'); // For admin routes

// @route   POST /api/contact
// @desc    Submit contact form (public route)
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { fullName, email, subject, message } = req.body;

    // Validate required fields
    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Create new contact submission
    const contact = new Contact({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim()
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
      data: {
        id: contact._id,
        submittedAt: contact.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while submitting your message. Please try again later.'
    });
  }
});

// @route   GET /api/contact
// @desc    Get all contact submissions (admin only)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build filter object
    const filter = {};
    if (status && ['new', 'read', 'replied', 'resolved'].includes(status)) {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get contacts with pagination
    const contacts = await Contact.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const totalContacts = await Contact.countDocuments(filter);
    const totalPages = Math.ceil(totalContacts / parseInt(limit));

    res.json({
      success: true,
      data: contacts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalContacts,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contacts'
    });
  }
});

// @route   GET /api/contact/:id
// @desc    Get single contact submission (admin only)
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    // Mark as read when viewed
    if (!contact.isRead) {
      contact.isRead = true;
      if (contact.status === 'new') {
        contact.status = 'read';
      }
      await contact.save();
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contact'
    });
  }
});

// @route   PUT /api/contact/:id
// @desc    Update contact submission status/notes (admin only)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, adminNotes, isRead } = req.body;
    
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    // Update fields if provided
    if (status && ['new', 'read', 'replied', 'resolved'].includes(status)) {
      contact.status = status;
    }
    
    if (adminNotes !== undefined) {
      contact.adminNotes = adminNotes.trim();
    }
    
    if (isRead !== undefined) {
      contact.isRead = isRead;
    }

    await contact.save();

    res.json({
      success: true,
      message: 'Contact submission updated successfully',
      data: contact
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating contact'
    });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact submission (admin only)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Contact submission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting contact'
    });
  }
});

// @route   GET /api/contact/stats/summary
// @desc    Get contact statistics (admin only)
// @access  Private
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalContacts = await Contact.countDocuments();
    const unreadContacts = await Contact.countDocuments({ isRead: false });

    // Format stats
    const statusStats = {
      new: 0,
      read: 0,
      replied: 0,
      resolved: 0
    };

    stats.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        total: totalContacts,
        unread: unreadContacts,
        byStatus: statusStats
      }
    });
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

module.exports = router;
