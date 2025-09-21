-- CreateTable
CREATE TABLE "BoardColumn" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "board_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "index" INTEGER NOT NULL,
    CONSTRAINT "BoardColumn_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "Board" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BoardColumn_board_id_index_key" ON "BoardColumn"("board_id", "index");
