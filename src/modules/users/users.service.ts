import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entity/user.entity";
// import { UpdateUserDto } from './user.dto';
import { PaginationDto, paginate } from "../../common/dto/pagination.dto";
import { UserRole } from "../../common/enums";
import { UpdateUserDto } from "./dto/user-update.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(pagination: PaginationDto, role?: UserRole) {
    const qb = this.userRepo
      .createQueryBuilder("user")
      .select([
        "user.id",
        "user.email",
        "user.role",
        "user.isActive",
        "user.createdAt",
      ])
      .orderBy("user.createdAt", "DESC")
      .skip(pagination.skip)
      .take(pagination.limit);

    if (role) qb.where("user.role = :role", { role });

    // 2. Qidiruv mantiqi (email bo'yicha)
    if (pagination.search) {
      qb.andWhere("user.email ILIKE :search", {
        search: `%${pagination.search}%`,
      });
    }

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, pagination.page, pagination.limit);
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      select: ["id", "email", "role", "isActive", "createdAt", "updatedAt"],
    });
    if (!user) throw new NotFoundException(`Foydalanuvchi topilmadi: ${id}`);
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findById(id);
    await this.userRepo.update(id, dto);
    return this.findById(id);
  }

  async deactivate(id: string): Promise<{ message: string }> {
    await this.findById(id);
    await this.userRepo.update(id, { isActive: false, refreshToken: null });
    return { message: "Foydalanuvchi deaktivlashtirildi" };
  }
}
