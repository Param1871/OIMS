import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler.middleware';

export const taskService = {
  async getAllTasks() {
    return prisma.task.findMany({
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true, employee: { include: { designation: true } } } },
        assigner: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { messages: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async getMyTasks(userId: string) {
    return prisma.task.findMany({
      where: { assigneeId: userId },
      include: {
        assigner: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { messages: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async getTaskById(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true } },
        assigner: { select: { id: true, firstName: true, lastName: true } },
        messages: {
          include: { user: { select: { id: true, firstName: true, lastName: true, role: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    if (!task) throw new AppError('Task not found', 404);
    return task;
  },

  async createTask(data: any, assignerId: string) {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assigneeId: data.assigneeId,
        assignerId,
      },
      include: { assignee: true, assigner: true }
    });

    // Notify assignee
    const notif = await prisma.notification.create({
      data: {
        type: 'TASK_ASSIGNED',
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${task.title}`,
        entityType: 'task',
        entityId: task.id,
        severity: 'INFO'
      }
    });
    await prisma.userNotification.create({
      data: { userId: task.assigneeId, notificationId: notif.id }
    });

    return task;
  },

  async updateTaskStatus(id: string, status: string, userId: string) {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new AppError('Task not found', 404);
    
    // Check permission - either Admin or Assignee
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    if (task.assigneeId !== userId && user?.role.name !== 'SUPER_ADMIN') {
      throw new AppError('Not authorized to update this task', 403);
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { status },
      include: { assigner: true, assignee: true }
    });

    // Notify Admin if completed by employee
    if (status === 'COMPLETED' && task.assigneeId === userId) {
      const notif = await prisma.notification.create({
        data: {
          type: 'TASK_COMPLETED',
          title: 'Task Completed',
          message: `${updated.assignee.firstName} completed the task: ${updated.title}`,
          entityType: 'task',
          entityId: task.id,
          severity: 'SUCCESS'
        }
      });
      await prisma.userNotification.create({
        data: { userId: task.assignerId, notificationId: notif.id }
      });
    }

    return updated;
  },

  async addMessage(taskId: string, content: string, userId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new AppError('Task not found', 404);

    const message = await prisma.taskMessage.create({
      data: { taskId, userId, content },
      include: { user: { select: { id: true, firstName: true, lastName: true } } }
    });

    // Notify the other party
    const recipientId = userId === task.assigneeId ? task.assignerId : task.assigneeId;
    const notif = await prisma.notification.create({
      data: {
        type: 'TASK_MESSAGE',
        title: 'New Message on Task',
        message: `${message.user.firstName} left a message on: ${task.title}`,
        entityType: 'task',
        entityId: task.id,
        severity: 'INFO'
      }
    });
    await prisma.userNotification.create({
      data: { userId: recipientId, notificationId: notif.id }
    });

    return message;
  },

  async deleteTask(taskId: string, userId: string, isAdmin: boolean) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new AppError('Task not found', 404);

    // Only SUPER_ADMIN or the assigner can delete
    if (!isAdmin && task.assignerId !== userId) {
      throw new AppError('Unauthorized to delete this task', 403);
    }

    await prisma.task.delete({ where: { id: taskId } });
  }
};
