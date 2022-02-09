/*
  Warnings:

  - A unique constraint covering the columns `[sketchId]` on the table `SelectedSketch` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SelectedSketch_sketchId_key" ON "SelectedSketch"("sketchId");

-- AddForeignKey
ALTER TABLE "SelectedSketch" ADD CONSTRAINT "SelectedSketch_sketchId_fkey" FOREIGN KEY ("sketchId") REFERENCES "Sketch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
