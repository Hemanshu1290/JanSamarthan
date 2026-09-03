import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  jsonb,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";

export const auditStatusEnum = pgEnum("audit_status", [
  "PASSED",
  "FLAGGED_DUPLICATE",
  "FAILED_GEO",
  "EXPIRED_TIMESTAMP",
]);
export const trancheStatusEnum = pgEnum("tranche_status", [
  "LOCKED",
  "ADVANCE_RELEASED",
  "MID_PROOF_RELEASED",
  "FINAL_AUDIT_RELEASED",
]);

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

export const ngoGovProfiles = pgTable("ngo_gov_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  ngoName: text("ngo_name").notNull(),
  darpanId: text("darpan_id").notNull().unique(),
  panTaxId: text("pan_tax_id").notNull().unique(),
  is12aVerified: boolean("is_12a_verified").default(false),
  is80gVerified: boolean("is_80g_verified").default(false),
  fcraStatus: boolean("fcra_status").default(false),
  activeProjectSites: jsonb("active_project_sites").$type<string[]>(),
});

export const cagAuditLogs = pgTable("cag_audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  schemeId: uuid("scheme_id").notNull(),
  ngoId: uuid("ngo_id").notNull(),
  action: text("action").notNull(),
  auditStatus: auditStatusEnum("audit_status").notNull(),
  metaData: jsonb("meta_data"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
