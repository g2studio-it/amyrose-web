import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ unique: true })
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true, eager: true })
  items!: CartItem[];

  @BeforeInsert()
  generateId(): void {
    if (!this.id) this.id = uuidv4();
  }
}
