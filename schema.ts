import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  jsonb,
  decimal,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "CORPORATE",
  "NGO",
  "GOVERNMENT_OFFICIAL",
  "ADMIN",
]);
export const milestoneStatusEnum = pgEnum("milestone_status", [
  "BACKLOG",
  "IN_PROGRESS",
  "NEEDS_REVIEW",
  "APPROVED",
  "RELEASED",
]);
export const auditStatusEnum = pgEnum("audit_status", [
  "PASSED",
  "FLAGGED_DUPLICATE",
  "FAILED_GEO",
  "EXPIRED_TIMESTAMP",
]);

// Core Auth Users
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: userRoleEnum("role").default("NGO").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// NGO Trust Profiles & NITI Aayog Verification
export const ngoProfiles = pgTable("ngo_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  organizationName: text("organization_name").notNull(),
  darpanId: text("darpan_id").unique(), // NITI Aayog NGO-Darpan
  csr1Number: text("csr_1_number"),
  is12aVerified: boolean("is_12a_verified").default(false),
  is80gVerified: boolean("is_80g_verified").default(false),
  fcraStatus: boolean("fcra_status").default(false),
  trustScore: integer("trust_score").default(0),
  embedding: jsonb("embedding").$type<number[]>(),
  latitude: decimal("latitude", { precision: 10, scale: 6 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 6 }).notNull(),
});

// Government Schemes & Corporate Profiles
export const governmentSchemes = pgTable("government_schemes", {
  id: uuid("id").primaryKey().defaultRandom(),
  departmentName: text("department_name").notNull(),
  schemeName: text("scheme_name").notNull(),
  allocatedBudget: decimal("allocated_budget", {
    precision: 14,
    scale: 2,
  }).notNull(),
  targetDistrictLat: decimal("target_district_lat", {
    precision: 10,
    scale: 6,
  }).notNull(),
  targetDistrictLng: decimal("target_district_lng", {
    precision: 10,
    scale: 6,
  }).notNull(),
});

// Milestone Kanban & Proof Verification
export const milestones = pgTable("milestones", {
  id: uuid("id").primaryKey().defaultRandom(),
  ngoId: uuid("ngo_id")
    .references(() => ngoProfiles.id)
    .notNull(),
  title: text("title").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: milestoneStatusEnum("status").default("BACKLOG").notNull(),
  proofImageUrl: text("proof_image_url"),
  exifData: jsonb("exif_data").$type<{
    lat?: number;
    lng?: number;
    timestamp?: string;
    isValidGeo?: boolean;
  }>(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// CAG Unalterable Audit Trail Log
export const cagAuditLogs = pgTable("cag_audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  schemeId: uuid("scheme_id"),
  ngoId: uuid("ngo_id"),
  action: text("action").notNull(),
  auditStatus: auditStatusEnum("audit_status").notNull(),
  metaData: jsonb("meta_data"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
