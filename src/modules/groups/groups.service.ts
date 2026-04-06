import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Group } from "./group.entity";
import { Teacher } from "../teachers/entity/teacher.entity";
import { Course } from "../courses/course.entity";
import { Branch } from "../branches/branch.entity";
import { CreateGroupDto, UpdateGroupDto, FilterGroupDto } from "./group.dto";
import { paginate } from "../../common/dto/pagination.dto";

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(Teacher)
    private readonly teacherRepo: Repository<Teacher>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
  ) {}

  async findAll(filter: FilterGroupDto) {
    const qb = this.groupRepo
      .createQueryBuilder("group")
      .leftJoinAndSelect("group.course", "course")
      .leftJoinAndSelect("group.teacher", "teacher")
      .leftJoinAndSelect("group.branch", "branch")
      .loadRelationCountAndMap(
        "group.studentCount",
        "group.groupStudents",
        "gs",
        (gsQb) => gsQb.where("gs.isActive = true"),
      )
      .orderBy("group.createdAt", "DESC")
      .skip(filter.skip)
      .take(filter.limit);

    if (filter.status)
      qb.andWhere("group.status = :status", { status: filter.status });
    if (filter.branchId)
      qb.andWhere("group.branchId = :branchId", { branchId: filter.branchId });
    if (filter.teacherId)
      qb.andWhere("group.teacherId = :teacherId", {
        teacherId: filter.teacherId,
      });
    if (filter.courseId)
      qb.andWhere("group.courseId = :courseId", { courseId: filter.courseId });
    if (filter.search) {
      qb.andWhere("group.name ILIKE :s", { s: `%${filter.search}%` });
    }

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, filter.page, filter.limit);
  }

  async findById(id: string) {
    const group = await this.groupRepo.findOne({
      where: { id },
      relations: [
        "course",
        "teacher",
        "teacher.user",
        "branch",
        "groupStudents",
        "groupStudents.student",
      ],
    });
    if (!group) throw new NotFoundException(`Guruh topilmadi: ${id}`);

    // Filter only active students
    group.groupStudents =
      group.groupStudents?.filter((gs) => gs.isActive) ?? [];
    return group;
  }

  async create(dto: CreateGroupDto): Promise<Group> {
    const [teacher, course, branch] = await Promise.all([
      this.teacherRepo.findOne({
        where: { id: dto.teacherId, isActive: true, deletedAt: null },
      }),
      this.courseRepo.findOne({ where: { id: dto.courseId, isActive: true } }),
      this.branchRepo.findOne({ where: { id: dto.branchId } }),
    ]);

    if (!teacher)
      throw new BadRequestException(
        `O'qituvchi topilmadi yoki faol emas: ${dto.teacherId}`,
      );
    if (!course)
      throw new BadRequestException(
        `Kurs topilmadi yoki faol emas: ${dto.courseId}`,
      );
    if (!branch)
      throw new BadRequestException(`Filial topilmadi: ${dto.branchId}`);

    // scheduleDays string bo'lgani uchun LIKE bilan tekshiramiz
    const days = dto.scheduleDays.split(",").map((d) => d.trim());

    const qb = this.groupRepo
      .createQueryBuilder("g")
      .where("g.teacherId = :teacherId", { teacherId: dto.teacherId })
      .andWhere("g.status IN (:...statuses)", {
        statuses: ["upcoming", "active"],
      })
      .andWhere("g.startTime < :endTime AND g.endTime > :startTime", {
        startTime: dto.startTime,
        endTime: dto.endTime,
      });

    // Har bir kun uchun LIKE tekshiruvi
    const dayConditions = days
      .map((_, i) => `g.scheduleDays LIKE :day${i}`)
      .join(" OR ");
    const dayParams: Record<string, string> = {};
    days.forEach((day, i) => {
      dayParams[`day${i}`] = `%${day}%`;
    });

    qb.andWhere(`(${dayConditions})`, dayParams);

    const conflict = await qb.getOne();

    if (conflict) {
      throw new ConflictException(
        `O'qituvchida jadval to'qnashuvi: "${conflict.name}" guruhi bilan`,
      );
    }

    const group = this.groupRepo.create({
      name: dto.name,
      courseId: dto.courseId,
      teacherId: dto.teacherId,
      branchId: dto.branchId,
      scheduleDays: dto.scheduleDays,
      startTime: dto.startTime,
      endTime: dto.endTime,
      maxStudents: dto.maxStudents ?? 20,
      status: dto.status,
      startedAt: dto.startedAt ? new Date(dto.startedAt) : new Date(),
    });

    return this.groupRepo.save(group);
  }

  async update(id: string, dto: UpdateGroupDto): Promise<Group> {
    await this.findById(id);

    if (dto.teacherId) {
      const teacher = await this.teacherRepo.findOne({
        where: { id: dto.teacherId, isActive: true, deletedAt: null },
      });
      if (!teacher)
        throw new BadRequestException(`O'qituvchi topilmadi: ${dto.teacherId}`);
    }

    await this.groupRepo.update(id, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.teacherId !== undefined && { teacherId: dto.teacherId }),
      ...(dto.scheduleDays !== undefined && { scheduleDays: dto.scheduleDays }),
      ...(dto.startTime !== undefined && { startTime: dto.startTime }),
      ...(dto.endTime !== undefined && { endTime: dto.endTime }),
      ...(dto.maxStudents !== undefined && { maxStudents: dto.maxStudents }),
      ...(dto.status !== undefined && { status: dto.status }),
    });

    return this.findById(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const group = await this.groupRepo.findOne({
      where: { id },
      relations: ["groupStudents"],
    });
    if (!group) throw new NotFoundException(`Guruh topilmadi: ${id}`);

    const activeStudents =
      group.groupStudents?.filter((gs) => gs.isActive) ?? [];
    if (activeStudents.length > 0) {
      throw new ConflictException(
        `Guruhda ${activeStudents.length} ta faol o'quvchi bor. Avval o'quvchilarni chiqaring`,
      );
    }

    await this.groupRepo.remove(group);
    return { message: "Guruh o'chirildi" };
  }

  async getAttendanceSummary(groupId: string, month: number, year: number) {
    await this.findById(groupId);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // last day of month

    return this.groupRepo.manager
      .createQueryBuilder()
      .select("a.status", "status")
      .addSelect("COUNT(a.id)", "count")
      .from("attendance", "a")
      .where("a.group_id = :groupId", { groupId })
      .andWhere("a.lesson_date BETWEEN :start AND :end", {
        start: startDate.toISOString().split("T")[0],
        end: endDate.toISOString().split("T")[0],
      })
      .groupBy("a.status")
      .getRawMany();
  }
}
