import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductService } from 'src/product/product.service';
import { Product, ProductDocument } from 'src/product/schemas/product.schema';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async getAllCategories() {
    return await this.categoryModel.find({});
  }

  async addCategory(name: string) {
    return await this.categoryModel.create({ name });
  }

  async editCategory(_id: string, newName: string) {
    return await this.categoryModel.findOneAndUpdate(
      { _id: _id },
      { name: newName },
    );
  }

  async deleteCategory(_id: string) {
    const existProduct = (
      await this.productModel.find({
        category: _id,
      })
    ).length;

    if (existProduct) {
      throw new HttpException(
        '해당 카테고리를 사용하는 제품이 존재합니다.',
        HttpStatus.BAD_REQUEST,
      );
    } else {
      return await this.categoryModel.findOneAndDelete({ _id: _id });
    }
  }
}
