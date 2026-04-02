-- AlterTable
ALTER TABLE "PortfolioImage" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'image';

-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN     "videoUrl" TEXT;
