const { createTestDB, bootstrapDB } = require('../../util/db');
const { createBike, storages } = require('../../util/model');
const { Storage } = require('../storage');

describe('Storage', () => {
  const db = createTestDB();
  bootstrapDB(db);

  describe('Storage', () => {
    let bike;
    let storage;

    beforeAll(() => {
      storage = new storages.BikeStorage(db);
    });

    beforeEach(() => {
      bike = createBike();
    });

    it('provides interface for composed Models', () => {
      expect(storage.composed.price).toBeInstanceOf(Storage);
    });

    it('provides interface for related Models', () => {
      expect(storage.relations.wheels).toBeInstanceOf(Storage);
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
          await storage.store(bike);
        });

        it('returns model for id', async () => {
          const returned = await storage.fetch(bike.id);
          expect(returned).toEqual(bike);
        });
      });
    });

    describe('#store', () => {
      beforeEach(async () => {
        await storage.store(bike);
      });

      it('inserts row in DB with revision 1', async () => {
        const res = await db.query(
          'SELECT * FROM bike_revision WHERE id = $1',
          [bike.id]
        );
        expect(res.rowCount).toEqual(1);
        const row = res.rows[0];
        expect(row.revision).toEqual(1);
      });

      it('stores model relations', async () => {
        const res = await db.query(
          'SELECT * FROM price_revision WHERE id = $1',
          [bike.price.id]
        );
        expect(res.rowCount).toEqual(1);
        const row = res.rows[0];
        expect(row.revision).toEqual(1);
      });

      describe('when storing same object again', () => {
        beforeEach(async () => {
          bike.brand = 'DSB';
          await storage.store(bike);
        });

        it('adds a revision', async () => {
          const res = await db.query(
            'SELECT * FROM bike_revision WHERE id = $1 ORDER BY revision ASC',
            [bike.id]
          );
          expect(res.rowCount).toEqual(2);
          expect(res.rows[0].brand).toEqual('Crescent');
          expect(res.rows[0].revision).toEqual(1);

          expect(res.rows[1].brand).toEqual('DSB');
          expect(res.rows[1].revision).toEqual(2);
        });
      });
    });
  });
});
