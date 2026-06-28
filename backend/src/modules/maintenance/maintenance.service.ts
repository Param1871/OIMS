import { prisma } from '../../config/database';
import { generateDocNumber } from '../../shared/helpers';

const getNextSeq = async (prefix: string): Promise<number> => {
  const setting = await prisma.setting.findFirst({ where: { key: `seq.${prefix}` } });
  const seq = parseInt(setting?.value || '0') + 1;
  await prisma.setting.upsert({
    where: { key: `seq.${prefix}` },
    update: { value: String(seq) },
    create: { key: `seq.${prefix}`, value: String(seq), category: 'sequence' },
  });
  return seq;
};

export const maintenanceService = {
  async findAllSchedules() {
    return prisma.maintenanceSchedule.findMany({
      orderBy: { scheduledDate: 'asc' }
    });
  },

  async createSchedule(data: any) {
    const seq = await getNextSeq('MAIN');
    const scheduleNumber = generateDocNumber('MAIN', seq);

    return prisma.maintenanceSchedule.create({
      data: {
        scheduleNumber,
        title: data.title,
        assetCode: data.assetCode,
        assetName: data.assetName,
        scheduledDate: new Date(data.scheduledDate),
        status: 'SCHEDULED',
        priority: data.priority || 'NORMAL'
      }
    });
  },

  async updateScheduleStatus(id: string, status: string) {
    return prisma.maintenanceSchedule.update({
      where: { id },
      data: { status }
    });
  },

  async findAllCalibrationRecords() {
    return prisma.calibrationRecord.findMany({
      orderBy: { nextCalibrationDate: 'asc' }
    });
  },

  async createCalibrationRecord(data: any) {
    const seq = await getNextSeq('CAL');
    const recordNumber = generateDocNumber('CAL', seq);

    return prisma.calibrationRecord.create({
      data: {
        recordNumber,
        instrumentCode: data.toolId,
        instrumentName: data.name,
        calibratedDate: new Date(data.lastCalibrated),
        nextCalibrationDate: new Date(data.nextCalibration),
        result: 'PASS',
      }
    });
  }
};
