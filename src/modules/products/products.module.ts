import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './domain/entities/product.entity';
import { ProductsController } from './interface/controllers/products.controller';
import { ProductsService } from './application/services/products.service';
import { PRODUCT_REPOSITORY } from './domain/repositories/product.repository.interface';
import { TypeOrmProductRepository } from './infrastructure/persistence/typeorm-product.repository';

export const ProductsRepositoryProvider = {
  provide: PRODUCT_REPOSITORY,
  useClass: TypeOrmProductRepository,
};

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepositoryProvider],
  exports: [ProductsService, PRODUCT_REPOSITORY],
})
export class ProductsModule {}
