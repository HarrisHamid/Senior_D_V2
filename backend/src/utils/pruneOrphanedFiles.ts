import fs from "fs";
import { UploadedFile } from "../models/UploadedFile.model";

export async function pruneOrphanedFileRecords(): Promise<void> {
  const files = await UploadedFile.find(
    {},
    { _id: 1, path: 1, originalName: 1 },
  ).lean();

  if (files.length === 0) return;

  const orphaned = files.filter((f) => !fs.existsSync(f.path));

  if (orphaned.length === 0) {
    console.log(
      `[startup] File integrity: all ${files.length} record(s) have matching files on disk.`,
    );
    return;
  }

  const ids = orphaned.map((f) => f._id);
  await UploadedFile.deleteMany({ _id: { $in: ids } });

  console.log(
    `[startup] Pruned ${orphaned.length} orphaned file record(s) (no matching file on disk): ` +
      orphaned.map((f) => f.originalName).join(", "),
  );
}
