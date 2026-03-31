import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Order } from './order.entity';
import { DecimalColumnTransformer } from '../../../common/transformers/decimal.transformer';

@Entity('order_items')
export class OrderItem {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column()
  orderId!: string;

  @Column()
  productId!: string;

  @Column()
  variantId!: string;

  /** Snapshot of product name at time of order */
  @Column()
  productName!: string;

  /** Snapshot of variant name at time of order */
  @Column()
  variantName!: string;

  @Column()
  quantity!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new DecimalColumnTransformer(),
  })
  unitPrice!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new DecimalColumnTransformer(),
  })
  subtotal!: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  @BeforeInsert()
  generateId(): void {
    if (!this.id) this.id = uuidv4();
  }
}
