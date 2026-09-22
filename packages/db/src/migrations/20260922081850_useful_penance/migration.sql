CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'reader' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "annotations" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"type" text DEFAULT 'highlight' NOT NULL,
	"chapter_num" text NOT NULL,
	"chapter_title" text NOT NULL,
	"sentence_idx" integer NOT NULL,
	"text" text,
	"note" text,
	"color" text DEFAULT 'gold' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"type" text DEFAULT 'chapter' NOT NULL,
	"chapter_num" text NOT NULL,
	"chapter_title" text NOT NULL,
	"sentence_idx" integer DEFAULT -1 NOT NULL,
	"text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crypto_payments" (
	"id" serial PRIMARY KEY,
	"user_id" text,
	"device_id" text,
	"email" text,
	"plan" text NOT NULL,
	"amount_usdt" numeric(12,6),
	"required_usdt" numeric(12,6),
	"currency" text DEFAULT 'USDT' NOT NULL,
	"network" text DEFAULT 'TRON_TRC20' NOT NULL,
	"wallet_address" text,
	"token_contract" text,
	"tx_hash" text NOT NULL UNIQUE,
	"status" text DEFAULT 'verifying' NOT NULL,
	"raw" jsonb,
	"failure_reason" text,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "device_links" (
	"device_id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY,
	"email" text,
	"username" text,
	"tier" text DEFAULT 'mortal' NOT NULL,
	"daily_chat_used" integer DEFAULT 0 NOT NULL,
	"daily_audio_used" integer DEFAULT 0 NOT NULL,
	"narrations_remaining" integer DEFAULT 0 NOT NULL,
	"chats_remaining" integer DEFAULT 0 NOT NULL,
	"last_reset_date" text,
	"avatar_choice" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hall_venerables" (
	"id" text PRIMARY KEY,
	"username" text NOT NULL,
	"title" text DEFAULT 'Venerable' NOT NULL,
	"avatar_choice" text,
	"codex_count" integer DEFAULT 0 NOT NULL,
	"total_gu" integer DEFAULT 0 NOT NULL,
	"is_myriad" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "highlights" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"chapter_num" text NOT NULL,
	"chapter_title" text NOT NULL,
	"sentence_idx" integer NOT NULL,
	"text" text,
	"color" text DEFAULT 'gold' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"chapter_num" text NOT NULL,
	"chapter_title" text NOT NULL,
	"sentence_idx" integer NOT NULL,
	"text" text,
	"note" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_codes" (
	"id" serial PRIMARY KEY,
	"code" text NOT NULL UNIQUE,
	"device_id" text,
	"email" text,
	"customer_email" text,
	"tier" text NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"payment_reference" text,
	"payment_provider" text DEFAULT 'flutterwave' NOT NULL,
	"flutterwave_transaction_id" text,
	"paystack_reference" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY,
	"email" text,
	"username" text DEFAULT '' NOT NULL,
	"tier" text DEFAULT 'mortal' NOT NULL,
	"daily_chat_used" integer DEFAULT 0 NOT NULL,
	"daily_audio_used" integer DEFAULT 0 NOT NULL,
	"narrations_remaining" integer DEFAULT 0 NOT NULL,
	"chats_remaining" integer DEFAULT 0 NOT NULL,
	"last_reset_date" text,
	"collected_gu" jsonb,
	"avatar_choice" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_progress" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"chapter_num" text NOT NULL,
	"chapter_title" text NOT NULL,
	"scroll_percent" integer DEFAULT 0 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY,
	"device_id" text,
	"email" text,
	"username" text,
	"reference" text,
	"amount" integer,
	"currency" text,
	"plan" text,
	"status" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL UNIQUE,
	"slug" text NOT NULL UNIQUE,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" text PRIMARY KEY,
	"bucket" text NOT NULL,
	"path" text NOT NULL,
	"url" text NOT NULL,
	"kind" text DEFAULT 'image' NOT NULL,
	"mime_type" text,
	"size" integer,
	"alt" text DEFAULT '' NOT NULL,
	"post_id" text,
	"uploaded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" text PRIMARY KEY,
	"slug" text NOT NULL UNIQUE,
	"type" text DEFAULT 'post' NOT NULL,
	"num" text,
	"title" text NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"cover_image_url" text,
	"cover_image_path" text,
	"cover_image_alt" text DEFAULT '' NOT NULL,
	"video_url" text,
	"video_storage_path" text,
	"video_provider" text DEFAULT 'none' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"category_id" text,
	"seo_title" text,
	"seo_description" text,
	"author_id" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts_to_tags" (
	"post_id" text NOT NULL,
	"tag_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL UNIQUE,
	"slug" text NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
CREATE INDEX "media_assets_post_idx" ON "media_assets" ("post_id");--> statement-breakpoint
CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" ("slug");--> statement-breakpoint
CREATE INDEX "posts_status_idx" ON "posts" ("status");--> statement-breakpoint
CREATE INDEX "posts_type_idx" ON "posts" ("type");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "hall_venerables" ADD CONSTRAINT "hall_venerables_id_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_post_id_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "posts_to_tags" ADD CONSTRAINT "posts_to_tags_post_id_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "posts_to_tags" ADD CONSTRAINT "posts_to_tags_tag_id_tags_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE;