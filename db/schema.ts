import {sqliteTable,text,integer,primaryKey,index} from 'drizzle-orm/sqlite-core';

export const ghostAccounts=sqliteTable('ghost_accounts',{
 userId:text('user_id').primaryKey(),
 cipher:text('key_cipher'),iv:text('key_iv'),
 updatedAt:integer('updated_at').notNull(),
 verifiedAt:integer('verified_at'),
 blocked:integer('blocked').notNull().default(0),
});
export const ghostUsage=sqliteTable('ghost_usage',{
 userId:text('user_id').notNull(),month:text('month').notNull(),
 spentNanos:integer('spent_nanos').notNull().default(0),
 heldNanos:integer('held_nanos').notNull().default(0),
},t=>[primaryKey({columns:[t.userId,t.month]})]);
export const ghostRequests=sqliteTable('ghost_requests',{
 id:text('id').primaryKey(),userId:text('user_id').notNull(),
 month:text('month').notNull(),day:text('day').notNull(),
 reservedNanos:integer('reserved_nanos').notNull(),actualNanos:integer('actual_nanos'),
 status:text('status').notNull(),createdAt:integer('created_at').notNull(),
},t=>[index('ghost_requests_user_day').on(t.userId,t.day)]);
export const ghostLocks=sqliteTable('ghost_locks',{
 userId:text('user_id').primaryKey(),requestId:text('request_id').notNull(),expiresAt:integer('expires_at').notNull(),
});

export const station = sqliteTable("station", {id: integer("id").primaryKey(), owner: text("owner").notNull()});
export const genres = sqliteTable("genres", {name: text("name").primaryKey()});
export const tracks = sqliteTable("tracks", {
 id:text("id").primaryKey(), title:text("title").notNull(), artist:text("artist").notNull(), genre:text("genre").notNull(),
 status:text("status").notNull(), uploader:text("uploader").notNull(), audioKey:text("audio_key").notNull(), coverKey:text("cover_key"),
 mime:text("mime").notNull(), bytes:integer("bytes").notNull(), created:integer("created").notNull()
},t=>[index("idx_tracks_status_created").on(t.status,t.created),index("idx_tracks_uploader_created").on(t.uploader,t.created)]);
export const uploads = sqliteTable("uploads", {
 id:text("id").primaryKey(), user:text("user").notNull(), size:integer("size").notNull(), contentType:text("content_type").notNull(), created:integer("created").notNull(), state:text("state").notNull().default("uploading"), result:text("result"), progress:text("progress"), updated:integer("updated").notNull().default(0)
},t=>[index("idx_uploads_user").on(t.user)]);
