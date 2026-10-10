import fs from 'fs';
import path from 'path';
import cron from 'node-cron';

export class BackupService {
  private dbPath: string;
  private backupDir: string;

  constructor() {
    // Determine the active database path from environment variable
    const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
    let parsedPath = dbUrl.replace('file:', '');
    if (!path.isAbsolute(parsedPath)) {
      // Prisma resolves relative paths against the schema.prisma directory
      // When deployed in Electron, the schema is often in a specific spot,
      // but if DATABASE_URL is absolute, it will skip this.
      if (process.env.NODE_ENV !== 'production') {
        parsedPath = path.resolve(process.cwd(), 'prisma', parsedPath);
      } else {
        parsedPath = path.resolve(process.cwd(), parsedPath); // Adjust for prod if needed
      }
    }
    this.dbPath = parsedPath;
    
    // Create a backup directory next to the active database
    this.backupDir = path.join(path.dirname(this.dbPath), 'backups');
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  // PRAGMA integrity_check before creating backup
  public async verifyIntegrity(): Promise<boolean> {
    // Prisma doesn't expose a raw pragma integrity_check easily returning scalar, 
    // but we can execute a simple query to ensure the DB is readable.
    try {
      const prisma = require('../../config/database').default;
      await prisma.$queryRawUnsafe(`PRAGMA integrity_check;`);
      return true;
    } catch (e) {
      console.error('Integrity check failed:', e);
      return false;
    }
  }

  public async createBackup(type: 'manual' | 'auto' | 'rescue' = 'manual'): Promise<string> {
    const isHealthy = await this.verifyIntegrity();
    if (!isHealthy) {
      throw new Error('Database integrity check failed. Aborting backup.');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `backup_${type}_${timestamp}.db`;
    const destPath = path.join(this.backupDir, backupFilename);
    
    // SQLite allows safe copying if WAL is checkpointed, but a simple file copy is usually okay for small apps.
    // For safer approach, we use fs.copyFileSync.
    fs.copyFileSync(this.dbPath, destPath);
    
    // Also copy WAL file if it exists, to prevent corruption
    if (fs.existsSync(`${this.dbPath}-wal`)) {
      fs.copyFileSync(`${this.dbPath}-wal`, `${destPath}-wal`);
    }
    if (fs.existsSync(`${this.dbPath}-shm`)) {
      fs.copyFileSync(`${this.dbPath}-shm`, `${destPath}-shm`);
    }

    return destPath;
  }

  public async restoreBackup(backupFilename: string): Promise<boolean> {
    const backupPath = path.join(this.backupDir, backupFilename);
    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup file not found');
    }

    // Create a rescue backup of the current state before restoring
    await this.createBackup('rescue');

    // Restore
    fs.copyFileSync(backupPath, this.dbPath);
    
    if (fs.existsSync(`${backupPath}-wal`)) {
      fs.copyFileSync(`${backupPath}-wal`, `${this.dbPath}-wal`);
    } else if (fs.existsSync(`${this.dbPath}-wal`)) {
      fs.unlinkSync(`${this.dbPath}-wal`); // Remove old WAL if backup doesn't have one
    }

    if (fs.existsSync(`${backupPath}-shm`)) {
      fs.copyFileSync(`${backupPath}-shm`, `${this.dbPath}-shm`);
    } else if (fs.existsSync(`${this.dbPath}-shm`)) {
      fs.unlinkSync(`${this.dbPath}-shm`);
    }

    const prisma = require('../../config/database').default;
    await prisma.$disconnect();

    return true;
  }

  public getBackups(): Array<{ filename: string, size: number, createdAt: Date }> {
    const files = fs.readdirSync(this.backupDir).filter(f => f.endsWith('.db'));
    return files.map(filename => {
      const stats = fs.statSync(path.join(this.backupDir, filename));
      return {
        filename,
        size: stats.size,
        createdAt: stats.birthtime
      };
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public startAutoBackup() {
    // Run every day at 3 AM
    cron.schedule('0 3 * * *', async () => {
      console.log('Running automatic daily backup...');
      try {
        await this.createBackup('auto');
        console.log('Automatic backup successful.');
        
        // Keep only the last 7 auto backups
        const autoBackups = this.getBackups().filter(b => b.filename.includes('backup_auto_'));
        if (autoBackups.length > 7) {
          const toDelete = autoBackups.slice(7);
          toDelete.forEach(b => {
            fs.unlinkSync(path.join(this.backupDir, b.filename));
          });
        }
      } catch (err) {
        console.error('Automatic backup failed:', err);
      }
    });
  }
}

export const backupService = new BackupService();
