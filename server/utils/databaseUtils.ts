import { PoolConnection } from 'mysql2/promise';
import { MySQLResultMetadata } from '../../shared/types/database';
import logger from './logger';
import { LOG_CONTEXTS, createTimer } from '../config/logging';

/**
 * 类型守卫：检查对象是否为 MySQL 操作结果元数据
 */
export function isMySQLMetadata(obj: unknown): obj is MySQLResultMetadata {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'affectedRows' in obj &&
    'insertId' in obj &&
    typeof (obj as MySQLResultMetadata).affectedRows === 'number' &&
    typeof (obj as MySQLResultMetadata).insertId === 'number'
  );
}

/**
 * 批量插入数据
 *
 * @param connection 数据库连接或连接池
 * @param table 表名
 * @param rows 行数据数组
 * @param options 配置选项
 * @returns 插入的总行数
 *
 * @example
 * const rows = [
 *   { name: 'case1', status: 'passed' },
 *   { name: 'case2', status: 'failed' }
 * ];
 * const affected = await batchInsert(connection, 'test_results', rows);
 */
export async function batchInsert<T extends Record<string, unknown>>(
  connection: PoolConnection | { execute: (sql: string, params?: unknown[]) => Promise<[unknown, unknown]> },
  table: string,
  rows: T[],
  options: { batchSize?: number } = {}
): Promise<number> {
  if (rows.length === 0) {
    return 0;
  }

  const { batchSize = 1000 } = options;
  const timer = createTimer();
  let totalAffected = 0;

  try {
    logger.debug('Starting batch insert', {
      table,
      rowCount: rows.length,
      batchSize,
    }, LOG_CONTEXTS.DATABASE);

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const columns = Object.keys(batch[0]);

      // 构建 placeholders: (?, ?, ?), (?, ?, ?), ...
      const placeholders = batch.map(() =>
        `()`
      ).join(',');

      // 构建参数数组
      const values = batch.flatMap(row =>
        columns.map(col => row[col])
      );

      const sql = `
        INSERT INTO \`\` (\`\`)
        VALUES
      `;

      const [result] = await connection.execute(sql, values as any[]);

      if (isMySQLMetadata(result)) {
        totalAffected += result.affectedRows;
      }

      logger.debug('Batch insert chunk completed', {
        table,
        batchIndex: Math.floor(i / batchSize),
        totalBatches: Math.ceil(rows.length / batchSize),
        rowsInBatch: batch.length,
        affectedRows: isMySQLMetadata(result) ? result.affectedRows : 0,
      }, LOG_CONTEXTS.DATABASE);
    }

    const duration = timer();
    logger.info('Batch insert completed successfully', {
      table,
      totalRows: rows.length,
      totalAffected,
      durationMs: duration,
      averagePerRow: (duration / rows.length).toFixed(2),
    }, LOG_CONTEXTS.DATABASE);

    return totalAffected;

  } catch (error) {
    const duration = timer();
    logger.errorLog(error, 'Batch insert failed', {
      table,
      rowCount: rows.length,
      durationMs: duration,
    });
    throw error;
  }
}

/**
 * 批量更新数据
 *
 * @param connection 数据库连接
 * @param table 表名
 * @param updates 更新数据和条件
 * @param options 配置选项
 * @returns 更新的总行数
 *
 * @example
 * const updates = [
 *   { set: { status: 'completed', duration: 100 }, where: { id: 1 } },
 *   { set: { status: 'failed', duration: 50 }, where: { id: 2 } }
 * ];
 * const affected = await batchUpdate(connection, 'test_results', updates);
 */
export async function batchUpdate<T extends Record<string, unknown>>(
  connection: PoolConnection,
  table: string,
  updates: Array<{
    set: Record<string, unknown>;
    where: Record<string, unknown>;
  }>,
  options: { batchSize?: number } = {}
): Promise<number> {
  if (updates.length === 0) {
    return 0;
  }

  const { batchSize = 100 } = options;
  const timer = createTimer();
  let totalAffected = 0;

  try {
    logger.debug('Starting batch update', {
      table,
      updateCount: updates.length,
      batchSize,
    }, LOG_CONTEXTS.DATABASE);

    for (const update of updates) {
      const setColumns = Object.keys(update.set);
      const whereColumns = Object.keys(update.where);

      const setClause = setColumns.map(col => `\`\` = ?`).join(', ');
      const whereClause = whereColumns.map(col => `\`\` = ?`).join(' AND ');

      const values = [
        ...setColumns.map(col => update.set[col]),
        ...whereColumns.map(col => update.where[col]),
      ];

      const sql = `
        UPDATE \`\`
        SET
        WHERE
      `;

      const [result] = await connection.execute(sql, values as any[]);

      if (isMySQLMetadata(result)) {
        totalAffected += result.affectedRows;
      }
    }

    const duration = timer();
    logger.info('Batch update completed successfully', {
      table,
      totalUpdates: updates.length,
      totalAffected,
      durationMs: duration,
    }, LOG_CONTEXTS.DATABASE);

    return totalAffected;

  } catch (error) {
    const duration = timer();
    logger.errorLog(error, 'Batch update failed', {
      table,
      updateCount: updates.length,
      durationMs: duration,
    });
    throw error;
  }
}

/**
 * 事务执行辅助函数
 * 自动处理事务的开始、提交和回滚
 *
 * @param connection 数据库连接
 * @param callback 事务内执行的回调函数
 * @param options 配置选项
 *   - timeout: 超时时间（毫秒，暂未实现）
 *   - autoRelease: 事务结束后是否自动释放连接（默认 true）
 *     传入 `{ autoRelease: false }` 以保留连接，用于需要在事务外进行额外操作的场景
 * @returns 回调函数的返回值
 *
 * @example
 * // 默认：自动释放连接
 * const result = await executeInTransaction(connection, async (conn) => {
 *   const [result1] = await conn.execute('INSERT INTO ...', values1);
 *   const [result2] = await conn.execute('UPDATE ...', values2);
 *   return { insertId: result1.insertId };
 * });
 *
 * @example
 * // 不释放连接（原 executeInTransactionNoRelease 行为）
 * const result = await executeInTransaction(connection, async (conn) => {
 *   return await doSomething(conn);
 * }, { autoRelease: false });
 */
export async function executeInTransaction<T>(
  connection: PoolConnection,
  callback: (connection: PoolConnection) => Promise<T>,
  options: { timeout?: number; autoRelease?: boolean } = {}
): Promise<T> {
  const { autoRelease = true } = options;
  const timer = createTimer();

  try {
    logger.debug(
      autoRelease ? 'Starting transaction' : 'Starting transaction (no auto-release)',
      {},
      LOG_CONTEXTS.DATABASE
    );

    await connection.beginTransaction();

    const result = await callback(connection);

    await connection.commit();

    const duration = timer();
    logger.debug('Transaction committed successfully', {
      durationMs: duration,
    }, LOG_CONTEXTS.DATABASE);

    return result;

  } catch (error) {
    const duration = timer();

    try {
      await connection.rollback();
      logger.warn('Transaction rolled back due to error', {
        error: error instanceof Error ? error.message : String(error),
        durationMs: duration,
      }, LOG_CONTEXTS.DATABASE);
    } catch (rollbackError) {
      logger.errorLog(
        rollbackError,
        'Failed to rollback transaction',
        { durationMs: duration }
      );
    }

    throw error;

  } finally {
    if (autoRelease) {
      connection.release();
    }
  }
}

/**
 * 使用 Savepoint 进行条件性回滚
 * 适用于部分操作可以失败的场景
 *
 * @param connection 数据库连接
 * @param savepointName Savepoint 的名称
 * @param callback 需要设置 Savepoint 的回调
 *
 * @example
 * try {
 *   await executeWithSavepoint(connection, 'before_details', async () => {
 *     // 这些操作失败时可以回滚到 savepoint
 *     await updateDetailResults();
 *   });
 * } catch (error) {
 *   // Savepoint 已回滚，主记录的更新仍然有效
 * }
 */
export async function executeWithSavepoint(
  connection: PoolConnection,
  savepointName: string,
  callback: (connection: PoolConnection) => Promise<void>
): Promise<boolean> {
  try {
    logger.debug('Creating savepoint', { savepointName }, LOG_CONTEXTS.DATABASE);

    await connection.execute(`SAVEPOINT \`\``);

    try {
      await callback(connection);
      return true;
    } catch (error) {
      logger.warn('Savepoint callback failed, rolling back to savepoint', {
        savepointName,
        error: error instanceof Error ? error.message : String(error),
      }, LOG_CONTEXTS.DATABASE);

      await connection.execute(`ROLLBACK TO SAVEPOINT \`\``);
      return false;
    }

  } catch (error) {
    logger.errorLog(error, 'Savepoint operation failed', { savepointName });
    throw error;
  }
}

export default {
  isMySQLMetadata,
  batchInsert,
  batchUpdate,
  executeInTransaction,
  executeWithSavepoint,
};
