import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Product } from './product.entity';

@Entity('product_images')
export class ProductImage {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column()
  productId!: string;

  @Column()
  url!: string;

  @Column({ nullable: true })
  altText?: string;

  @Column({ default: false })
  isPrimary!: boolean;

  @Column({ default: 0 })
  sortOrder!: number;

  @ManyToOne(() => Product, (product) => product.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @BeforeInsert()
  generateId(): void {
    if (!this.id) this.id = uuidv4();
  }
}
