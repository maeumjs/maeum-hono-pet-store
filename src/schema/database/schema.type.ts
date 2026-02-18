import type { container } from '#/loader';

// 1. 스키마를 포함한 완벽한 트랜잭션 타입 정의
// export type TDBTransaction<T = unknown> = SQLiteTransaction<
//   'async',
//   T, // 결과 타입 (보통 any로 둠)
//   typeof schema, // 스키마 정의 (핵심!)
//   ExtractTablesWithRelations<typeof schema> // 관계 정보 (핵심!)
// >;

export type TDBTransaction = Parameters<Parameters<typeof container.db.writer.transaction>[0]>[0];

export type TDatabase = typeof container.db.writer;

export type TDataSource = TDBTransaction | TDatabase;
