import { execute, PoolClient } from '@evershop/postgres-query-builder';

export default async (connection /** @type {PoolClient} */) => {
  await execute(
    connection,
    `CREATE TABLE IF NOT EXISTS "fitment_vehicle" (
      "vehicle_id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
      "year" INT NOT NULL,
      "year_from" INT,
      "year_to" INT,
      "make" VARCHAR(128) NOT NULL,
      "make_normalized" VARCHAR(128) NOT NULL,
      "model" VARCHAR(128) NOT NULL,
      "model_normalized" VARCHAR(128) NOT NULL,
      "submodel" VARCHAR(128),
      "submodel_normalized" VARCHAR(128),
      "engine_code" VARCHAR(128),
      "engine_code_normalized" VARCHAR(128),
      "engine_name" VARCHAR(256),
      "engine_name_normalized" VARCHAR(256),
      "body" VARCHAR(128),
      "body_normalized" VARCHAR(128),
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`
  );

  await execute(
    connection,
    `CREATE UNIQUE INDEX IF NOT EXISTS "UNQ_FITMENT_VEHICLE" ON "fitment_vehicle" (
      "year",
      "make_normalized",
      "model_normalized",
      COALESCE("submodel_normalized", ''),
      COALESCE("engine_code_normalized", ''),
      COALESCE("engine_name_normalized", ''),
      COALESCE("body_normalized", '')
    )`
  );

  await execute(
    connection,
    `CREATE TABLE IF NOT EXISTS "fitment_link" (
      "fitment_link_id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      "product_id" INT NOT NULL,
      "vehicle_id" INT NOT NULL,
      "position" VARCHAR(64),
      "side" VARCHAR(64),
      "notes" TEXT,
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "FK_FITMENT_LINK_PRODUCT" FOREIGN KEY ("product_id") REFERENCES "product"("product_id") ON DELETE CASCADE,
      CONSTRAINT "FK_FITMENT_LINK_VEHICLE" FOREIGN KEY ("vehicle_id") REFERENCES "fitment_vehicle"("vehicle_id") ON DELETE CASCADE,
      CONSTRAINT "UNQ_FITMENT_LINK" UNIQUE ("product_id", "vehicle_id", COALESCE("position", ''), COALESCE("side", ''))
    )`
  );

  await execute(
    connection,
    `CREATE TABLE IF NOT EXISTS "fitment_cross_reference" (
      "fitment_cross_reference_id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      "product_id" INT NOT NULL,
      "reference_type" VARCHAR(64) NOT NULL,
      "reference_value" VARCHAR(256) NOT NULL,
      "reference_brand" VARCHAR(128),
      "notes" TEXT,
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "FK_FITMENT_CROSS_REF_PRODUCT" FOREIGN KEY ("product_id") REFERENCES "product"("product_id") ON DELETE CASCADE,
      CONSTRAINT "UNQ_FITMENT_CROSS_REF" UNIQUE ("product_id", "reference_type", "reference_value", COALESCE("reference_brand", ''))
    )`
  );

  await execute(
    connection,
    `CREATE INDEX IF NOT EXISTS "IDX_FITMENT_VEHICLE_MAKE_MODEL" ON "fitment_vehicle" ("make_normalized", "model_normalized")`
  );
  await execute(
    connection,
    `CREATE INDEX IF NOT EXISTS "IDX_FITMENT_LINK_PRODUCT" ON "fitment_link" ("product_id")`
  );
  await execute(
    connection,
    `CREATE INDEX IF NOT EXISTS "IDX_FITMENT_LINK_VEHICLE" ON "fitment_link" ("vehicle_id")`
  );
  await execute(
    connection,
    `CREATE INDEX IF NOT EXISTS "IDX_FITMENT_CROSS_REF_PRODUCT" ON "fitment_cross_reference" ("product_id")`
  );
};
