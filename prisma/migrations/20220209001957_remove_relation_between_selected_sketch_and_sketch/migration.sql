-- DropForeignKey
ALTER TABLE "SelectedSketch" DROP CONSTRAINT "SelectedSketch_sketchId_fkey";

-- DropIndex
DROP INDEX "SelectedSketch_sketchId_key";
