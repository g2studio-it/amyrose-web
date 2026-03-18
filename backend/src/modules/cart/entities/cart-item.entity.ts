import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Cart } from './cart.entity';

@Entity('cart_items')
@Unique(['cartId', 'variantId'])
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
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
}
