const Testimonial = require('../models/Testimonial');
const path = require('path');
const fs = require('fs').promises;

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Private
exports.getAllTestimonials = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }

    // Count total documents
    const total = await Testimonial.countDocuments(query);

    // Get paginated results
    const testimonials = await Testimonial.find(query)
      // .populate('createdBy', 'firstName lastName email') // TODO: Enable when User model exists
      // .populate('approvedBy', 'firstName lastName email') // TODO: Enable when User model exists
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: testimonials,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'שגיאה בשליפת ההמלצות',
      error: error.message
    });
  }
};

// @desc    Get single testimonial
// @route   GET /api/testimonials/:id
// @access  Private
exports.getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
      // .populate('createdBy', 'firstName lastName email') // TODO: Enable when User model exists
      // .populate('approvedBy', 'firstName lastName email'); // TODO: Enable when User model exists

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'המלצה לא נמצאה'
      });
    }

    res.status(200).json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'שגיאה בשליפת ההמלצה',
      error: error.message
    });
  }
};

// @desc    Create new testimonial
// @route   POST /api/testimonials
// @access  Private
exports.createTestimonial = async (req, res) => {
  try {
    console.log('📥 Request Body:', req.body);
    console.log('📎 File:', req.file);
    
    const testimonialData = {
      clientName: req.body.clientName,
      clientRole: req.body.clientRole,
      companyName: req.body.companyName,
      content: req.body.content,
      rating: Number(req.body.rating), // Convert string to number
      isVisible: req.body.isVisible === 'true' || req.body.isVisible === true, // Convert to boolean
      image: req.file ? `/uploads/images/${req.file.filename}` : null
      // createdBy will be null by default in the model
    };

    console.log('💾 Testimonial Data:', testimonialData);
    
    const testimonial = await Testimonial.create(testimonialData);

    res.status(201).json({
      success: true,
      message: 'ההמלצה נוצרה בהצלחה',
      data: testimonial
    });
  } catch (error) {
    console.error('❌ Error creating testimonial:', error.message);
    console.error('❌ Validation errors:', error.errors);
    
    // Delete uploaded file if testimonial creation failed
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }

    res.status(400).json({
      success: false,
      message: 'שגיאה ביצירת ההמלצה',
      error: error.message,
      details: error.errors
    });
  }
};

// @desc    Update testimonial
// @route   PUT /api/testimonials/:id
// @access  Private
exports.updateTestimonial = async (req, res) => {
  try {
    let testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'המלצה לא נמצאה'
      });
    }

    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (testimonial.image) {
        const oldImagePath = path.join(__dirname, '../../uploads/images', path.basename(testimonial.image));
        await fs.unlink(oldImagePath).catch(console.error);
      }
      req.body.image = `/uploads/images/${req.file.filename}`;
    }

    testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'ההמלצה עודכנה בהצלחה',
      data: testimonial
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'שגיאה בעדכון ההמלצה',
      error: error.message
    });
  }
};

// @desc    Delete testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private
exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'המלצה לא נמצאה'
      });
    }

    // Delete image if exists
    if (testimonial.image) {
      const imagePath = path.join(__dirname, '../../uploads/images', path.basename(testimonial.image));
      await fs.unlink(imagePath).catch(console.error);
    }

    await testimonial.deleteOne();

    res.status(200).json({
      success: true,
      message: 'ההמלצה נמחקה בהצלחה'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'שגיאה במחיקת ההמלצה',
      error: error.message
    });
  }
};

// @desc    Update testimonial status (approve/reject)
// @route   PATCH /api/testimonials/:id/status
// @access  Private (Admin only)
exports.updateTestimonialStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'סטטוס לא תקין'
      });
    }

    const updateData = {
      status,
      isVisible: status === 'approved'
    };

    if (status === 'approved') {
      updateData.approvedBy = req.user?.id || null;
      updateData.approvedAt = new Date();
    }

    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'המלצה לא נמצאה'
      });
    }

    res.status(200).json({
      success: true,
      message: `ההמלצה ${status === 'approved' ? 'אושרה' : 'נדחתה'} בהצלחה`,
      data: testimonial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון סטטוס ההמלצה',
      error: error.message
    });
  }
};

// @desc    Update testimonials order (for drag & drop)
// @route   PATCH /api/testimonials/reorder
// @access  Private
exports.reorderTestimonials = async (req, res) => {
  try {
    const { testimonials } = req.body; // Array of {id, displayOrder}

    if (!Array.isArray(testimonials)) {
      return res.status(400).json({
        success: false,
        message: 'פורמט לא תקין'
      });
    }

    // Update all testimonials in parallel
    const updatePromises = testimonials.map(({ id, displayOrder }) =>
      Testimonial.findByIdAndUpdate(id, { displayOrder })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: 'סדר ההמלצות עודכן בהצלחה'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון סדר ההמלצות',
      error: error.message
    });
  }
};

// @desc    Get approved testimonials for public website
// @route   GET /api/testimonials/public
// @access  Public
exports.getPublicTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({
      status: 'approved',
      isVisible: true
    })
      .select('-createdBy -approvedBy -__v')
      .sort({ displayOrder: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: testimonials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'שגיאה בשליפת ההמלצות',
      error: error.message
    });
  }
};

