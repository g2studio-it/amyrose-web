import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  OneToMany,
  Index,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Product } from './product.entity';

@Entity('categories')
export class Category {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Index({ unique: true })
  @Column({ unique: true, length: 120 })
  slug!: string;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: 0 })
  sortOrder!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];

  @BeforeInsert()
  generateId(): void {
    if (!this.id) this.id = uuidv4();
  }
}
