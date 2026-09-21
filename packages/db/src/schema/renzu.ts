import {
	boolean,
	integer,
	jsonb,
	numeric,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export type Tier = "mortal" | "gu_master" | "gu_immortal" | "venerable";

export type CodexGu = {
	id: string;
	name: string;
	symbol: string;
	lore: string;
	tier: string;
	discoveredAt: number;
	source: string;
	isMain: boolean;
	status?: string;
};

const timestamps = {
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
};

const uuidPk = () =>
	text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID());

const counters = {
	dailyChatUsed: integer("daily_chat_used").default(0).notNull(),
	dailyAudioUsed: integer("daily_audio_used").default(0).notNull(),
	narrationsRemaining: integer("narrations_remaining").default(0).notNull(),
	chatsRemaining: integer("chats_remaining").default(0).notNull(),
	lastResetDate: text("last_reset_date"),
};

// Email-account profiles (better-auth user id is the primary key).
export const profiles = pgTable("profiles", {
	id: text("id").primaryKey(),
	email: text("email"),
	username: text("username").default("").notNull(),
	tier: text("tier").default("mortal").notNull(),
	...counters,
	collectedGu: jsonb("collected_gu").$type<CodexGu[]>(),
	avatarChoice: text("avatar_choice").default("").notNull(),
	...timestamps,
});

// Guest/device rows for readers who never log in.
export const guestUsers = pgTable("users", {
	id: text("id").primaryKey(),
	email: text("email"),
	username: text("username"),
	tier: text("tier").default("mortal").notNull(),
	...counters,
	avatarChoice: text("avatar_choice").default("").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const deviceLinks = pgTable("device_links", {
	deviceId: text("device_id").primaryKey(),
	userId: text("user_id").notNull(),
	...timestamps,
});

export const transactions = pgTable("transactions", {
	id: serial("id").primaryKey(),
	deviceId: text("device_id"),
	email: text("email"),
	username: text("username"),
	reference: text("reference"),
	amount: integer("amount"),
	currency: text("currency"),
	plan: text("plan"),
	status: text("status"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const paymentCodes = pgTable("payment_codes", {
	id: serial("id").primaryKey(),
	code: text("code").unique().notNull(),
	deviceId: text("device_id"),
	email: text("email"),
	customerEmail: text("customer_email"),
	tier: text("tier").notNull(),
	used: boolean("used").default(false).notNull(),
	paymentReference: text("payment_reference"),
	paymentProvider: text("payment_provider").default("flutterwave").notNull(),
	flutterwaveTransactionId: text("flutterwave_transaction_id"),
	paystackReference: text("paystack_reference"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const bookmarks = pgTable("bookmarks", {
	id: uuidPk(),
	userId: text("user_id").notNull(),
	type: text("type").default("chapter").notNull(),
	chapterNum: text("chapter_num").notNull(),
	chapterTitle: text("chapter_title").notNull(),
	sentenceIdx: integer("sentence_idx").default(-1).notNull(),
	text: text("text"),
	...timestamps,
});

export const annotations = pgTable("annotations", {
	id: uuidPk(),
	userId: text("user_id").notNull(),
	type: text("type").default("highlight").notNull(),
	chapterNum: text("chapter_num").notNull(),
	chapterTitle: text("chapter_title").notNull(),
	sentenceIdx: integer("sentence_idx").notNull(),
	text: text("text"),
	note: text("note"),
	color: text("color").default("gold").notNull(),
	...timestamps,
});

export const highlights = pgTable("highlights", {
	id: uuidPk(),
	userId: text("user_id").notNull(),
	chapterNum: text("chapter_num").notNull(),
	chapterTitle: text("chapter_title").notNull(),
	sentenceIdx: integer("sentence_idx").notNull(),
	text: text("text"),
	color: text("color").default("gold").notNull(),
	...timestamps,
});

export const notes = pgTable("notes", {
	id: uuidPk(),
	userId: text("user_id").notNull(),
	chapterNum: text("chapter_num").notNull(),
	chapterTitle: text("chapter_title").notNull(),
	sentenceIdx: integer("sentence_idx").notNull(),
	text: text("text"),
	note: text("note").notNull(),
	...timestamps,
});

export const readingProgress = pgTable("reading_progress", {
	id: uuidPk(),
	userId: text("user_id").notNull(),
	chapterNum: text("chapter_num").notNull(),
	chapterTitle: text("chapter_title").notNull(),
	scrollPercent: integer("scroll_percent").default(0).notNull(),
	completed: boolean("completed").default(false).notNull(),
	...timestamps,
});

export const hallVenerables = pgTable("hall_venerables", {
	id: text("id")
		.primaryKey()
		.references(() => profiles.id, { onDelete: "cascade" }),
	username: text("username").notNull(),
	title: text("title").default("Venerable").notNull(),
	avatarChoice: text("avatar_choice"),
	codexCount: integer("codex_count").default(0).notNull(),
	totalGu: integer("total_gu").default(0).notNull(),
	isMyriad: boolean("is_myriad").default(false).notNull(),
	displayOrder: integer("display_order").default(100).notNull(),
	...timestamps,
});

export const cryptoPayments = pgTable("crypto_payments", {
	id: serial("id").primaryKey(),
	userId: text("user_id"),
	deviceId: text("device_id"),
	email: text("email"),
	plan: text("plan").notNull(),
	amountUsdt: numeric("amount_usdt", { precision: 12, scale: 6 }),
	requiredUsdt: numeric("required_usdt", { precision: 12, scale: 6 }),
	currency: text("currency").default("USDT").notNull(),
	network: text("network").default("TRON_TRC20").notNull(),
	walletAddress: text("wallet_address"),
	tokenContract: text("token_contract"),
	txHash: text("tx_hash").unique().notNull(),
	status: text("status").default("verifying").notNull(),
	raw: jsonb("raw").$type<unknown>(),
	failureReason: text("failure_reason"),
	approvedAt: timestamp("approved_at", { withTimezone: true }),
	...timestamps,
});
