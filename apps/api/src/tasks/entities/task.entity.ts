import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TaskStatus } from './task-status.enum';

@Entity()
@Index(['parentTask'])
@Index(['status', 'dueDate'])
@Index(['user', 'dueDate'])
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
  status!: TaskStatus;

  @Column({ type: 'date', nullable: true })
  dueDate?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.tasks, { nullable: true })
  user?: User;

  @ManyToOne(() => Task, (task) => task.subtasks, { nullable: true })
  parentTask?: Task;

  @OneToMany(() => Task, (task) => task.parentTask)
  subtasks?: Task[];
}
