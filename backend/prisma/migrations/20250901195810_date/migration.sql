/*
  Warnings:

  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Image";

-- CreateTable
CREATE TABLE "public"."images" (
    "id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "original_object_key" TEXT NOT NULL,
    "phash" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);
