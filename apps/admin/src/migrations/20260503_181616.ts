import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."payment_status" AS ENUM('requires_action', 'processing', 'succeeded', 'failed', 'refunded', 'partially_refunded');
  CREATE TYPE "public"."pack_hold_status" AS ENUM('held', 'debited', 'released');
  CREATE TYPE "public"."email_type" AS ENUM('booking_confirmation', 'booking_reminder', 'booking_cancellation');
  CREATE TYPE "public"."email_status" AS ENUM('pending', 'sent', 'failed');
  CREATE TYPE "public"."enum_services_status" AS ENUM('active', 'disabled');
  CREATE TYPE "public"."enum_resources_status" AS ENUM('active', 'disabled');
  CREATE TYPE "public"."enum_rooms_status" AS ENUM('active', 'disabled');
  CREATE TYPE "public"."enum_availability_rules_kind" AS ENUM('recurring', 'override');
  CREATE TYPE "public"."enum_availability_rules_day_of_week" AS ENUM('0', '1', '2', '3', '4', '5', '6');
  CREATE TYPE "public"."enum_policies_late_cancel_behavior" AS ENUM('credit', 'none');
  CREATE TYPE "public"."enum_policies_no_show_behavior" AS ENUM('charged', 'refundable', 'partial');
  CREATE TYPE "public"."enum_bookings_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
  CREATE TABLE "tenants" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"slug" text NOT NULL,
  	"display_name" text NOT NULL,
  	"timezone" text DEFAULT 'Europe/Paris' NOT NULL,
  	"default_locale" text DEFAULT 'fr' NOT NULL,
  	"locales" jsonb DEFAULT '["fr","en"]'::jsonb NOT NULL,
  	"branding" jsonb DEFAULT '{"logoUrl":null,"primaryColor":null}'::jsonb NOT NULL,
  	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
  	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
  );
  
  CREATE TABLE "service_resources" (
  	"service_id" uuid NOT NULL,
  	"resource_id" uuid NOT NULL,
  	CONSTRAINT "service_resources_service_id_resource_id_pk" PRIMARY KEY("service_id","resource_id")
  );
  
  CREATE TABLE "service_rooms" (
  	"service_id" uuid NOT NULL,
  	"room_id" uuid NOT NULL,
  	CONSTRAINT "service_rooms_service_id_room_id_pk" PRIMARY KEY("service_id","room_id")
  );
  
  CREATE TABLE "payments" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant_id" uuid NOT NULL,
  	"booking_id" uuid NOT NULL,
  	"stripe_payment_intent_id" text,
  	"paid_by_card_cents" integer DEFAULT 0 NOT NULL,
  	"paid_by_pack_cents" integer DEFAULT 0 NOT NULL,
  	"paid_by_gift_card_cents" integer DEFAULT 0 NOT NULL,
  	"total_cents" integer NOT NULL,
  	"currency" text DEFAULT 'eur' NOT NULL,
  	"status" "payment_status" DEFAULT 'requires_action' NOT NULL,
  	"idempotency_key" text NOT NULL,
  	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
  	CONSTRAINT "payments_idempotency_key_unique" UNIQUE("idempotency_key")
  );
  
  CREATE TABLE "refunds" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant_id" uuid NOT NULL,
  	"payment_id" uuid NOT NULL,
  	"booking_id" uuid NOT NULL,
  	"refunded_to_card_cents" integer DEFAULT 0 NOT NULL,
  	"refunded_to_pack_cents" integer DEFAULT 0 NOT NULL,
  	"refunded_to_gift_card_cents" integer DEFAULT 0 NOT NULL,
  	"total_cents" integer NOT NULL,
  	"reason" text NOT NULL,
  	"status" text DEFAULT 'pending' NOT NULL,
  	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
  	"completed_at" timestamp with time zone
  );
  
  CREATE TABLE "pack_holds" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant_id" uuid NOT NULL,
  	"customer_id" uuid NOT NULL,
  	"booking_id" uuid NOT NULL,
  	"amount_cents" integer NOT NULL,
  	"status" "pack_hold_status" DEFAULT 'held' NOT NULL,
  	"expires_at" timestamp with time zone NOT NULL,
  	"created_at" timestamp with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "scheduled_emails" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant_id" uuid NOT NULL,
  	"booking_id" uuid NOT NULL,
  	"type" "email_type" NOT NULL,
  	"scheduled_at" timestamp with time zone NOT NULL,
  	"status" "email_status" DEFAULT 'pending' NOT NULL,
  	"attempts" integer DEFAULT 0 NOT NULL,
  	"last_attempt_at" timestamp with time zone,
  	"sent_at" timestamp with time zone,
  	"created_at" timestamp with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "services" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"name_fr" varchar NOT NULL,
  	"name_en" varchar NOT NULL,
  	"description_fr" varchar,
  	"description_en" varchar,
  	"duration_minutes" numeric NOT NULL,
  	"price_cents" numeric NOT NULL,
  	"requires_resource" boolean DEFAULT true,
  	"requires_room" boolean DEFAULT true,
  	"status" "enum_services_status" DEFAULT 'active' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "resources" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar,
  	"status" "enum_resources_status" DEFAULT 'active' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "rooms" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"bookable_without_resource" boolean DEFAULT false,
  	"status" "enum_rooms_status" DEFAULT 'active' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "availability_rules" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"scope" varchar NOT NULL,
  	"kind" "enum_availability_rules_kind" NOT NULL,
  	"day_of_week" "enum_availability_rules_day_of_week",
  	"start_time" varchar NOT NULL,
  	"end_time" varchar NOT NULL,
  	"date_range_start" timestamp(3) with time zone,
  	"date_range_end" timestamp(3) with time zone,
  	"is_unavailable" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "policies" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"scope" varchar DEFAULT 'global' NOT NULL,
  	"free_cancel_hours" numeric DEFAULT 24 NOT NULL,
  	"late_cancel_behavior" "enum_policies_late_cancel_behavior" DEFAULT 'credit' NOT NULL,
  	"no_show_behavior" "enum_policies_no_show_behavior" DEFAULT 'charged' NOT NULL,
  	"free_reschedule_hours" numeric DEFAULT 24 NOT NULL,
  	"max_reschedules" numeric DEFAULT 2 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "bookings" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"service_id" varchar NOT NULL,
  	"resource_id" varchar,
  	"room_id" varchar NOT NULL,
  	"customer_id" varchar NOT NULL,
  	"starts_at" timestamp(3) with time zone NOT NULL,
  	"ends_at" timestamp(3) with time zone NOT NULL,
  	"status" "enum_bookings_status" NOT NULL,
  	"payment_id" varchar NOT NULL,
  	"policy_id" varchar NOT NULL,
  	"reschedule_count" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "customers" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"shopify_customer_id" varchar,
  	"email" varchar NOT NULL,
  	"display_name" varchar NOT NULL,
  	"phone" varchar,
  	"pack_credit_cents" numeric DEFAULT 0,
  	"gift_card_balance_cents" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "audit_logs" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"entity_type" varchar NOT NULL,
  	"entity_id" varchar NOT NULL,
  	"action" varchar NOT NULL,
  	"actor" varchar NOT NULL,
  	"before" jsonb,
  	"after" jsonb,
  	"reason" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" uuid,
  	"services_id" uuid,
  	"resources_id" uuid,
  	"rooms_id" uuid,
  	"availability_rules_id" uuid,
  	"policies_id" uuid,
  	"bookings_id" uuid,
  	"customers_id" uuid,
  	"audit_logs_id" uuid
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" uuid
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "service_resources" ADD CONSTRAINT "service_resources_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;
  ALTER TABLE "service_resources" ADD CONSTRAINT "service_resources_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE no action ON UPDATE no action;
  ALTER TABLE "service_rooms" ADD CONSTRAINT "service_rooms_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;
  ALTER TABLE "service_rooms" ADD CONSTRAINT "service_rooms_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
  ALTER TABLE "refunds" ADD CONSTRAINT "refunds_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
  ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;
  ALTER TABLE "refunds" ADD CONSTRAINT "refunds_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;
  ALTER TABLE "pack_holds" ADD CONSTRAINT "pack_holds_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
  ALTER TABLE "pack_holds" ADD CONSTRAINT "pack_holds_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
  ALTER TABLE "pack_holds" ADD CONSTRAINT "pack_holds_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;
  ALTER TABLE "scheduled_emails" ADD CONSTRAINT "scheduled_emails_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
  ALTER TABLE "scheduled_emails" ADD CONSTRAINT "scheduled_emails_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_resources_fk" FOREIGN KEY ("resources_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rooms_fk" FOREIGN KEY ("rooms_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_availability_rules_fk" FOREIGN KEY ("availability_rules_id") REFERENCES "public"."availability_rules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_policies_fk" FOREIGN KEY ("policies_id") REFERENCES "public"."policies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bookings_fk" FOREIGN KEY ("bookings_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_customers_fk" FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_logs_fk" FOREIGN KEY ("audit_logs_id") REFERENCES "public"."audit_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "resources_updated_at_idx" ON "resources" USING btree ("updated_at");
  CREATE INDEX "resources_created_at_idx" ON "resources" USING btree ("created_at");
  CREATE INDEX "rooms_updated_at_idx" ON "rooms" USING btree ("updated_at");
  CREATE INDEX "rooms_created_at_idx" ON "rooms" USING btree ("created_at");
  CREATE INDEX "availability_rules_updated_at_idx" ON "availability_rules" USING btree ("updated_at");
  CREATE INDEX "availability_rules_created_at_idx" ON "availability_rules" USING btree ("created_at");
  CREATE INDEX "policies_updated_at_idx" ON "policies" USING btree ("updated_at");
  CREATE INDEX "policies_created_at_idx" ON "policies" USING btree ("created_at");
  CREATE INDEX "bookings_updated_at_idx" ON "bookings" USING btree ("updated_at");
  CREATE INDEX "bookings_created_at_idx" ON "bookings" USING btree ("created_at");
  CREATE INDEX "customers_updated_at_idx" ON "customers" USING btree ("updated_at");
  CREATE INDEX "customers_created_at_idx" ON "customers" USING btree ("created_at");
  CREATE INDEX "audit_logs_updated_at_idx" ON "audit_logs" USING btree ("updated_at");
  CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_resources_id_idx" ON "payload_locked_documents_rels" USING btree ("resources_id");
  CREATE INDEX "payload_locked_documents_rels_rooms_id_idx" ON "payload_locked_documents_rels" USING btree ("rooms_id");
  CREATE INDEX "payload_locked_documents_rels_availability_rules_id_idx" ON "payload_locked_documents_rels" USING btree ("availability_rules_id");
  CREATE INDEX "payload_locked_documents_rels_policies_id_idx" ON "payload_locked_documents_rels" USING btree ("policies_id");
  CREATE INDEX "payload_locked_documents_rels_bookings_id_idx" ON "payload_locked_documents_rels" USING btree ("bookings_id");
  CREATE INDEX "payload_locked_documents_rels_customers_id_idx" ON "payload_locked_documents_rels" USING btree ("customers_id");
  CREATE INDEX "payload_locked_documents_rels_audit_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_logs_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "tenants" CASCADE;
  DROP TABLE "service_resources" CASCADE;
  DROP TABLE "service_rooms" CASCADE;
  DROP TABLE "payments" CASCADE;
  DROP TABLE "refunds" CASCADE;
  DROP TABLE "pack_holds" CASCADE;
  DROP TABLE "scheduled_emails" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "resources" CASCADE;
  DROP TABLE "rooms" CASCADE;
  DROP TABLE "availability_rules" CASCADE;
  DROP TABLE "policies" CASCADE;
  DROP TABLE "bookings" CASCADE;
  DROP TABLE "customers" CASCADE;
  DROP TABLE "audit_logs" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."payment_status";
  DROP TYPE "public"."pack_hold_status";
  DROP TYPE "public"."email_type";
  DROP TYPE "public"."email_status";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum_resources_status";
  DROP TYPE "public"."enum_rooms_status";
  DROP TYPE "public"."enum_availability_rules_kind";
  DROP TYPE "public"."enum_availability_rules_day_of_week";
  DROP TYPE "public"."enum_policies_late_cancel_behavior";
  DROP TYPE "public"."enum_policies_no_show_behavior";
  DROP TYPE "public"."enum_bookings_status";`)
}
