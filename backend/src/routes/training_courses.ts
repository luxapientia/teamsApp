import express, { Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import Course from '../models/Course';
import { ApiError } from '../utils/apiError';

const router = express.Router();

// Get all courses for a tenant
router.get('/:tenantId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tenantId } = req.params;
    const courses = await Course.find({ tenantId }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Create a new course
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, status } = req.body;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      throw new ApiError('Tenant ID is required', 400);
    }

    // Check if course with same name exists for this tenant
    const existingCourse = await Course.findOne({ name, tenantId });
    if (existingCourse) {
      throw new ApiError('A course with this name already exists', 400);
    }

    const course = await Course.create({
      name,
      description,
      status,
      tenantId
    });

    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create course' });
    }
  }
});

// Update a course
router.put('/:courseId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { name, description, status } = req.body;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      throw new ApiError('Tenant ID is required', 400);
    }

    // Check if course exists and belongs to the tenant
    const existingCourse = await Course.findOne({ _id: courseId, tenantId });
    if (!existingCourse) {
      throw new ApiError('Course not found', 404);
    }

    // Check if another course with the same name exists
    if (name !== existingCourse.name) {
      const duplicateCourse = await Course.findOne({ name, tenantId });
      if (duplicateCourse) {
        throw new ApiError('A course with this name already exists', 400);
      }
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { name, description, status },
      { new: true }
    );

    res.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update course' });
    }
  }
});

// Delete a course
router.delete('/:courseId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      throw new ApiError('Tenant ID is required', 400);
    }

    // Check if course exists and belongs to the tenant
    const course = await Course.findOne({ _id: courseId, tenantId });
    if (!course) {
      throw new ApiError('Course not found', 404);
    }

    await Course.findByIdAndDelete(courseId);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete course' });
    }
  }
});

export default router; 