import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Cart } from './cart.entity';

@Entity('cart_items')
@Unique(['cartId', 'variantId'])
export class CartItem {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column()
  cartId!: string;

  @Column()
  productId!: string;

  @Column()
  variantId!: string;

  @Column({ default: 1 })
  quantity!: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart!: Cart;

  @BeforeInsert()
  generateId(): void {
    if (!this.id) this.id = uuidv4();
  }
}
