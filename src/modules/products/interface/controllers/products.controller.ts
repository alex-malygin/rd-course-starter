import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProductsService } from '@products/application/services/products.service';
import { Product } from '@products/domain/entities/product.entity';
import { CreateProductDto } from '@products/interface/dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.createProduct(createProductDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product | null> {
    return this.productsService.getProductById(id);
  }
}
