import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Index()
  @Column({
    unique: true,
    transformer: {
      to: (val: string) => val?.toLowerCase(),
      from: (val: string) => val,
    },
  })
  email!: string;

  /** Never returned in responses — loaded only when explicitly selected */
  @Exclude()
  @Column({ nullable: true, select: false })
  password?: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role!: UserRole;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  phone?: string;

  /** Present in DB (managed by NextAuth/Prisma) — not used by backend */
  @Column({ nullable: true, name: 'emailVerified' })
  emailVerified?: Date;

  /** Present in DB (managed by NextAuth/Prisma) — not used by backend */
  @Column({ nullable: true })
  image?: string;

  /** Stored as bcrypt hash — never exposed in responses */
  @Exclude()
  @Column({ nullable: true, select: false })
  refreshToken?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @BeforeInsert()
  generateId(): void {
    if (!this.id) this.id = uuidv4();
  }

  @BeforeInsert()
  @BeforeUpdate()
  normalizeEmail(): void {
    if (this.email) {
      this.email = this.email.toLowerCase().trim();
    }
  }
}
