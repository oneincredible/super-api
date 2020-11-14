const uuidv4 = require('uuid/v4');
const { createTestDB } = require('../../util/db');
const { storages } = require('../../util/model');

describe('ACL Storage', () => {
  const db = createTestDB();

  let storage;

  beforeAll(() => {
    storage = new storages.ACLStorage(db);
  });

  it('returns negative check when relation not made', async () => {
    const result = await storage.check('2cdbeedc-003c-11e9-93f9-00090ffe0001', {
      id: '319ca8bc-003c-11e9-84de-00090ffe0001',
    });
    expect(result).toBe(false);
  });

  it('returns id of permission when relation made', async () => {
    const resourceId = uuidv4();
    const owner = {
      id: uuidv4(),
    };

    await storage.add(resourceId, owner);

    const permissionId = await storage.check(resourceId, owner);
    const permission = await storage.fetch(permissionId);
    expect(permission).toEqual({
      id: permissionId,
      ownerId: owner.id,
      resourceId: resourceId,
    });
  });

  describe('revisions', () => {
    it('are created sequentially', async () => {});
  });
});
