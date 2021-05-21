import { deleteAllCollections, sync2mongo } from "./sync2mongo";

describe("Sync to mongodb", () => {
  it("should empty", async () => {
    const result = await deleteAllCollections();
    expect(result).toBe("SUCCESS");
  });
  it("should sync", async () => {
    const result = await sync2mongo();
    expect(result).toBe("SUCCESS");
  });
});
