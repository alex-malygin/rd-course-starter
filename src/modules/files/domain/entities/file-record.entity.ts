import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum FileStatus {
  PENDING = 'pending',
  READY = 'ready',
}

export enum FileVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

@Entity('file_records')
export class FileRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ownerId: string;

  @Column({ nullable: true })
  entityId: string;

  @Column()
  key: string;

  @Column()
  contentType: string;

  @Column({ type: 'int', nullable: true })
  size: number;

  @Column({
    type: 'enum',
    enum: FileStatus,
    default: FileStatus.PENDING,
  })
  status: FileStatus;

  @Column({
    type: 'enum',
    enum: FileVisibility,
    default: FileVisibility.PUBLIC,
  })
  visibility: FileVisibility;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
