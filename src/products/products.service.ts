import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository, MoreThan } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  async create(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
  ) {
    const results: (UploadApiResponse | UploadApiErrorResponse)[] =
      await this.cloudinaryService.uploadMultipleImages(files, {
        folder: 'ecommerce-store',
      });
    const images = results
      .map((img) =>
        typeof img.secure_url === 'string' ? img.secure_url : null,
      )
      .filter((url): url is string => url !== null);
    const product = this.productsRepo.create({ ...createProductDto, images });
    return await this.productsRepo.save(product);
  }

  findAll() {
    return this.productsRepo.find({ where: { stock: MoreThan(0) } });
  }

  findOne(id: string) {
    return this.productsRepo.findOne({ where: { id } });
  }
  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.productsRepo.update(id, updateProductDto);
    return await this.productsRepo.findOne({ where: { id } });
  }

  async remove(id: string) {
    const product = await this.productsRepo.findOne({ where: { id } });
    if (!product) {
      return { deleted: false, deleteCount: 0 };
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map(async (url: string) => {
          // Extract public_id from the URL
          const publicIdMatch = url.match(/\/ecommerce-store\/([^./]+)\./);
          if (publicIdMatch && publicIdMatch[1]) {
            const publicId = `ecommerce-store/${publicIdMatch[1]}`;
            try {
              await this.cloudinaryService.deleteImage(publicId);
            } catch (err) {
              throw new InternalServerErrorException(err);
            }
          }
        }),
      );
    }

    const deleted = await this.productsRepo.delete(id);
    return {
      deleted: deleted.affected ? true : false,
      deleteCount: deleted.affected ?? 0,
    };
  }
}
