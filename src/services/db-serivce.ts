import { FileData, FileRecord, ResourceData, ResourceRecord } from "@/types";
import { Database } from "sqlite";

class DBService {
  db: Database;
  constructor(db: Database) {
    this.db = db;
  }

  async createResource(data: ResourceData): Promise<number> {
    const { name, description, downloadPath, sourcePath, targetPath, type } = data;

    const stmt = `
      INSERT INTO resources (name, description, downloadPath, sourcePath, targetPath, type)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      name,
      description || null,
      downloadPath || null,
      sourcePath,
      targetPath,
      type
    ];

    try {
      const result = await this.db.run(stmt, ...params);
      return result.lastID  ?? 0;
    } catch (error) {
      console.error("Error creating resource:", error);
      throw new Error("Failed to insert new resource into database.");
    }
  }

  async getResource(resourceId: number): Promise<ResourceRecord | null> {
    const stmt = `SELECT * FROM resources WHERE id = ?`;
    
    try {
      const resource = await this.db.get<ResourceRecord>(stmt, resourceId);
      return resource || null;
    } catch (error) {
      console.error(`Error getting resource with ID ${resourceId}:`, error);
      throw new Error(`Failed to retrieve resource from database.`);
    }
  }

  async getFiles(resourceId: number): Promise<FileRecord[]> {
    const stmt = `SELECT * FROM files WHERE resource_id = ?`;
    
    try {
      const files = await this.db.all<FileRecord[]>(stmt, resourceId);
      return files || [];
    } catch (error) {
      console.error(`Error getting resource files with ID ${resourceId}:`, error);
      throw new Error(`Failed to retrieve resource files from database.`);
    }
  }

  async getFilesTree(resourceId: number, parentId?: number) {
    let stmt = `SELECT * FROM files WHERE resource_id = ?`;
    if (!parentId) {
      stmt += " AND parent_id IS NULL";
    } else {
      stmt += " AND parent_id = ?";
    }

    stmt += " ORDER BY CASE WHEN type = 'folder' THEN 0 ELSE 1 END, type ASC";

    try {
      const files = await this.db.all<FileRecord[]>(stmt, [resourceId, parentId]);  
      const out: FileRecord[] = [];

      for (let i = 0; i < files.length; ++i) {
        if (files[i].type === 'folder') {
          files[i].files = await this.getFilesTree(files[i].resource_id, files[i].id);
        }

        out.push(files[i]);
      }

      return out || [];
    } catch (error) {
      console.error(`Error getting resource files with ID ${resourceId}:`, error);
      throw new Error(`Failed to retrieve resource files from database.`);
    }
  }

  async searchFiles(resourceId: number, search?: string, limit?: number, offset?: number): Promise<FileRecord[]> {
    let stmt = `SELECT * FROM files WHERE resource_id = ?`;
    let params: any[] = [resourceId];
    if (search && search.length) {
      stmt += ` AND name LIKE ?`
      params.push(`%${search}%`);
    }
    
    if (limit) {
      stmt += ` LIMIT ?`;
      params.push(limit);
    }
    
    if (offset) {
      stmt += ` OFFSET ?`;
      params.push(offset);
    }
    
    try {
      const files = await this.db.all<FileRecord[]>(stmt, params);
      return files || [];
    } catch (error) {
      console.error(`Error getting files with ${search}`, error);
      throw new Error(`Failed to retrieve files from database.`);
    }
  }


  async updateResource(resourceId: number, data: Partial<ResourceData>): Promise<number> {
    const fieldsToUpdate = (Object.keys(data) as Array<keyof ResourceData>).filter(key => data[key] !== undefined);
    
    if (fieldsToUpdate.length === 0) {
      return 0; 
    }

    const setClause = fieldsToUpdate.map(field => 
      field === 'description' && data[field] === '' ? `${field} = NULL` : `${field} = ?`
    ).join(', ');

    const params: (string | number | boolean | null | undefined)[] = [];

    for (const field of fieldsToUpdate) {
        const value = data[field];

        if (field === 'description' && value === '') {
            continue; 
        }
        
        params.push(value);
    }
    
    params.push(resourceId);

    const stmt = `
      UPDATE resources
      SET ${setClause}
      WHERE id = ?
    `;

    try {
      const result = await this.db.run(stmt, ...params);
      return result.changes ?? 0;
    } catch (error) {
      console.error(`Error updating resource with ID ${resourceId}:`, error);
      throw new Error("Failed to update resource in database.");
    }
  }

  async createFile(data: FileData): Promise<number> {
    const { resource_id, name, fileId, downloadPath, downloaded, relativePath, extension, parent_id, type, path } = data;

    const stmt = `
      INSERT INTO files (resource_id, name, fileId, downloadPath, downloaded, relativePath, extension, parent_id, type, path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      resource_id,
      name,
      fileId || null,
      downloadPath || null,
      downloaded || 0,
      relativePath || null,
      extension || null,
      parent_id || null,
      type,
      path || null
    ];

    try {
      const result = await this.db.run(stmt, ...params);
      return result.lastID ?? 0;
    } catch (error) {
      console.error("Error creating file:", error);
      throw new Error("Failed to insert new file into database.");
    }
  }

  async getFile(fileId: number): Promise<FileRecord | null> {
    const stmt = `SELECT * FROM files WHERE id = ?`;
    
    try {
      const file = await this.db.get<FileRecord>(stmt, fileId);
      return file || null;
    } catch (error) {
      console.error(`Error getting file with ID ${fileId}:`, error);
      throw new Error(`Failed to retrieve file from database.`);
    }
  }

  async updateFile(fileId: number, data: Partial<FileData>): Promise<number> {
    const fieldsToUpdate = (Object.keys(data) as Array<keyof FileData>).filter(key => data[key] !== undefined);
    
    if (fieldsToUpdate.length === 0) {
      return 0; 
    }

    const nullableFields: (keyof FileData)[] = ['downloadPath', 'downloaded', 'extension', 'parent_id', 'path'];

    const setClause = fieldsToUpdate.map(field => {
      const value = data[field];
      
      if (nullableFields.includes(field) && (value === null || value === '' || value === 0)) {
        return `${field} = NULL`;
      }
      return `${field} = ?`;
    }).join(', ');
    
    const params: (string | number | boolean | number | null)[] = [];

    for (const field of fieldsToUpdate) {
        const value = data[field];
        const setClauseUsedNull = nullableFields.includes(field) && (value === null || value === '' || value === 0);
        
        if (setClauseUsedNull) {
            continue; 
        }

        params.push(value ?? null);
    }
    
    params.push(fileId);

    const stmt = `
      UPDATE files
      SET ${setClause}
      WHERE id = ?
    `;

    try {
      const result = await this.db.run(stmt, ...params);
      return result.changes ?? 0;
    } catch (error) {
      console.error(`Error updating file with ID ${fileId}:`, error);
      throw new Error("Failed to update file in database.");
    }
  }

  async deleteResource(resourceId: number) {
    const stmt = "DELETE FROM `resources` WHERE `id` = ?";
    const stmt2 = "DELETE FROM `files` WHERE `resource_id` = ?";
    await this.db.run(stmt2, [resourceId]);
    return await this.db.run(stmt, [resourceId]);
  }

  async deleteFile(fileId: number) {
    const stmt = "DELETE FROM `files` WHERE `id` = ?";
    return await this.db.run(stmt, [fileId]);
  }
  
  async allResource() {
    const result = await this.db.prepare("SELECT * FROM `resources` ORDER BY `created_at` DESC");
    return result.all();
  }

  init() {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS resources (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          sourcePath TEXT NOT NULL,
          targetPath TEXT NOT NULL,
          downloadPath TEXT NULL,
          type TEXT NOT NULL, -- e.g., 'local', 'remote', etc.
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      this.db.run(`
        CREATE TABLE IF NOT EXISTS files (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          resource_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          path TEXT,
          fileId TEXT NULL,
          downloadPath TEXT NULL,
          downloaded DEFAULT 0,
          relativePath TEXT NULL,
          extension TEXT,
          parent_id INTEGER, -- references another file (folder nesting)
          type TEXT CHECK(type IN ('folder', 'file')) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
          FOREIGN KEY (parent_id) REFERENCES files(id) ON DELETE CASCADE
        );
      `);
      
      this.db.run(`
        CREATE TRIGGER IF NOT EXISTS update_files_updated_at
        AFTER UPDATE ON files
        FOR EACH ROW
        BEGIN
          UPDATE files SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END;
      `);
      
      this.db.run(`
        CREATE TRIGGER IF NOT EXISTS update_resources_updated_at
        AFTER UPDATE ON resources
        FOR EACH ROW
        BEGIN
          UPDATE resources SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END;
      `);

  }
}

export default DBService;