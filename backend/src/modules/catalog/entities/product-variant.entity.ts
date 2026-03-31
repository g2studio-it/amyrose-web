import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Product } from './product.entity';
import { DecimalColumnTransformer } from '../../../common/transformers/decimal.transformer';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column()
  productId!: string;

  @Column({ length: 100 })
  name!: string;

  @Index()
  @Column({ nullable: true, unique: true, length: 50 })
  sku?: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new DecimalColumnTransformer(),
  })
  price!: number;

  @Column({ default: 0 })
  stock!: number;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: 0 })
  sortOrder!: number;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @BeforeInsert()
  generateId(): void {
    if (!this.id) this.id = uuidv4();
  }
}
