/**
 * HAL OIMS — Category Controller
 */
import { Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { sendSuccess, sendCreated } from '../../shared/response';
import { AuthenticatedRequest } from '../../shared/types';
import { AppError } from '../../middleware/errorHandler.middleware';

export const categoryController = {
  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const categories = await prisma.category.findMany({
        where: { deletedAt: null },
        include: { subcategories: { where: { deletedAt: null } }, _count: { select: { items: true } } },
        orderBy: { name: 'asc' },
      });
      sendSuccess(res, categories);
    } catch (err) { next(err); }
  },

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const cat = await prisma.category.findFirst({
        where: { id: req.params.id, deletedAt: null },
        include: { subcategories: { where: { deletedAt: null } }, _count: { select: { items: true } } },
      });
      if (!cat) throw new AppError('Category not found', 404);
      sendSuccess(res, cat);
    } catch (err) { next(err); }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const cat = await prisma.category.create({ data: req.body });
      sendCreated(res, cat, 'Category created');
    } catch (err) { next(err); }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const cat = await prisma.category.update({ where: { id: req.params.id }, data: req.body });
      sendSuccess(res, cat, 'Category updated');
    } catch (err) { next(err); }
  },

  async createSubcategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sub = await prisma.subcategory.create({
        data: { ...req.body, categoryId: req.params.id },
      });
      sendCreated(res, sub, 'Subcategory created');
    } catch (err) { next(err); }
  },
};
