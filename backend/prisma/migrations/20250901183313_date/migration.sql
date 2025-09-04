-- CreateTable
CREATE TABLE "public"."Image" (
    "id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "original_object_key" TEXT NOT NULL,
    "phash" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);
