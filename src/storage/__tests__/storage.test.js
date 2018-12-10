const { createTestDB, bootstrapDB } = require('../../util/db');
const { createBike } = require('../../util/model');

describe('Storage', () => {
  const db = createTestDB();
  const { storages } = bootstrapDB(db);

  describe('Storage', () => {
    let bikeFixture = createBike();
    let storage;

    beforeAll(() => {
      storage = new storages.BikeStorage(db);
    });

    describe('#fetch', () => {
      describe('when id badly formatted', () => {
        it('throws error', () => {
          expect(storage.fetch('bla-he')).rejects.toThrow();
        });
      });

      describe('when id not exists', () => {
        it('returns null', async () => {
          const result = await storage.fetch(
            '2ebcd514-ee34-11e8-80c0-00090ffe0001'
          );
          expect(result).toBe(null);
        });
      });

      describe('when id exists', () => {
        beforeEach(async () => {
          await storage.store(bikeFixture);
        });

        it('returns model for id', async () => {
          const returned = await storage.fetch(bikeFixture.id);
          expect(returned).toEqual(bikeFixture);
        });
      });
    });
  });
});
