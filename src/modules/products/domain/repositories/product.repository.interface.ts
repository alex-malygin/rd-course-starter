import { Product } from '../entities/product.entity';

export interface IProductRepository {
  save(product: Product): Promise<Product>
  findById(id: string): Promise<Product | null>;
  updateStock(id: string, newStock: number): Promise<void>;
}

export const PRODUCT_REPOSITORY = Symbol('IProductRepository');
