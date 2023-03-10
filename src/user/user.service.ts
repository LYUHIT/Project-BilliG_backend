/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReportService } from 'src/report/report.service';
import { UpdateUserDTO } from './dto/updateUser.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private reportService: ReportService,
  ) {}

  async getUserById(_id: string) {
    const user = await this.userModel.findOne({ _id }, { password: false });
    if (!user) {
      throw new HttpException(
        '사용자가 존재하지 않습니다',
        HttpStatus.NOT_FOUND,
      );
    }

    const reports = await this.reportService.getReportsByTarget(user._id);

    return { ...user.toObject(), reports: reports };
  }

  async getUserByEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    return user;
  }

  async getMany() {
    const users = await this.userModel.find({}, { password: false });
    return users;
  }

  async create(userInfo: User) {
    const createdUser = new this.userModel(userInfo);
    return createdUser.save();
  }

  async update(_id: string, userInfo: UpdateUserDTO, fields?: string) {
    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id },
      userInfo,
      {
        fields: fields ? fields : {},
        returnOriginal: false,
        runValidators: true,
      },
    );

    const { password, ...result } = updatedUser.toObject();
    return result;
  }

  async deleteUserById(_id: string) {
    await this.userModel.deleteOne({ _id });
  }
}
