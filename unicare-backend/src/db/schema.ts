import { create } from "domain";
import { relations } from "drizzle-orm";
import {
  date,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
  varchar,
  text,
} from "drizzle-orm/pg-core";

// role ENUM
export const userRoleEnum = pgEnum("user_role", [
  "doctor",
  "nurse",
  "receptionist",
  "lab_technician",
  "admin",
]);
export const appontmentStatus = pgEnum("status", [
  "pending",
  "in session",
  "done",
]);

// Patient Type ENUM
export const patientTypeEnum = pgEnum("patient_type", [
  "inpatient",
  "outpatient",
]);

// Departments Table
export const DepartmentsTable = pgTable("departments", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Departments Relations
export const DepartmentsTableRelations = relations(
  DepartmentsTable,
  ({ many }) => ({
    users: many(UserTable),
  }),
);

// Users Table
export const UserTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  phone_number: varchar("phone_number", { length: 15 }).notNull().unique(),
  work_id: varchar("work_id", { length: 100 }).notNull().unique(),
  department_id: uuid("department_id")
    .notNull()
    .references(() => DepartmentsTable.id, {
      onDelete: "cascade",
    }),
  role: userRoleEnum("role").notNull(),
  email: varchar("email", { length: 70 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Users Relations
export const UserTableRelations = relations(UserTable, ({ one, many }) => ({
  department: one(DepartmentsTable, {
    fields: [UserTable.department_id],
    references: [DepartmentsTable.id],
  }),
  medical_records: many(PatientMedicalRecords),
}));

// Students Table
export const StudentTable = pgTable("students", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  phone_number: varchar("phone_number", { length: 15 }).unique().notNull(),
  reg_no: varchar("reg_no", { length: 15 }).unique().notNull(),
  emergency_contact: varchar("emergency_contact", { length: 15 }),
  special_conditions: text("special_conditions"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Students Relations
export const StudentTableRelations = relations(
  StudentTable,
  ({ many, one }) => ({
    appointments: many(AppointmentsTable),
    medical_records: many(PatientMedicalRecords),
    inpatients: many(InpatientTable),
  }),
);

// Appointments Table
export const AppointmentsTable = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  reg_no: varchar("reg_no", { length: 15 }).references(
    () => StudentTable.reg_no,
    { onDelete: "cascade" },
  ),
  doctor_id: uuid("doctor_id")
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
  appointment_date: timestamp("appointment_date").notNull(),
  status: appontmentStatus("status").default("pending"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Appointments Relations
export const AppointmentsTableRelations = relations(
  AppointmentsTable,
  ({ one }) => ({
    student: one(StudentTable, {
      fields: [AppointmentsTable.reg_no],
      references: [StudentTable.reg_no],
    }),
    doctor: one(UserTable, {
      fields: [AppointmentsTable.doctor_id],
      references: [UserTable.id],
    }),
  }),
);

// student medical records table
export const PatientMedicalRecords = pgTable("medical_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  reg_no: varchar("reg_no")
    .notNull()
    .references(() => StudentTable.reg_no, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  prescription: varchar("prescription", { length: 400 }),
  prescribed_by_id: uuid("prescribed_by_id").references(() => UserTable.id),
  lab_results: varchar("lab_results", { length: 400 }),
  tested_by_id: uuid("tested_by_id").references(() => UserTable.id),
  doctor_recommendation: varchar("doctor_recommendation", { length: 400 }),
  patient_type: patientTypeEnum("patient_type").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// medical records relations
export const PatientMedicalRecordsRelations = relations(
  PatientMedicalRecords,
  ({ one }) => ({
    student: one(StudentTable, {
      fields: [PatientMedicalRecords.reg_no],
      references: [StudentTable.reg_no],
    }),
    prescribing_doctor: one(UserTable, {
      fields: [PatientMedicalRecords.prescribed_by_id],
      references: [UserTable.id],
    }),
    lab_technician: one(UserTable, {
      fields: [PatientMedicalRecords.tested_by_id],
      references: [UserTable.id],
    }),
  }),
);

// rooms table
export const RoomsTable = pgTable("rooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  available_beds: integer("available_beds").default(0),
  total_beds: integer("total_beds").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// rooms table relations
export const RoomsTableRelations = relations(RoomsTable, ({ many }) => ({
  inpatients: many(InpatientTable),
}));

// inpatients table
export const InpatientTable = pgTable(
  "inpatients",
  {
    reg_no: varchar("reg_no", { length: 15 }).references(
      () => StudentTable.reg_no,
    ),
    room_id: uuid("room_id").references(() => RoomsTable.id),
    admission_date: timestamp("admission_date").defaultNow(),
    discharge_date: timestamp("discharge_date"),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.reg_no, table.room_id] }),
    };
  },
);

// inpatients table relations
export const InpatientTableRelations = relations(InpatientTable, ({ one }) => ({
  room: one(RoomsTable, {
    fields: [InpatientTable.room_id],
    references: [RoomsTable.id],
  }),
  student: one(StudentTable, {
    fields: [InpatientTable.reg_no],
    references: [StudentTable.reg_no],
  }),
}));

// drugs table
export const DrugsTable = pgTable("drugs", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  quantity: integer("quantity").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
