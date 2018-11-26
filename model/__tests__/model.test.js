const { createModel, Field } = require('..');
const { float, date, int } = require('../transform');

describe('Model modules', () => {
  describe('#createModel', () => {
    const birthdate = Field.value('birthdate', date());

    const Child = createModel([Field.value('name'), birthdate]);

    const Parent = createModel([
      Field.value('name'),
      Field.value('salary', float()),
      Field.value('bytes', int(10)),
      birthdate,
      Field.model('child', Child),
      Field.list('children', Child),
    ]);

    it('creates a Model', () => {
      expect(Parent).toBeInstanceOf(Object);
    });

    const rich = {
      id: 1,
      name: 'John',
      salary: 12444.22,
      bytes: 121412541,
      birthdate: new Date('2018-05-11'),
      child: {
        id: 2,
        name: 'Bear',
        birthdate: new Date('1992-02-01'),
      },
      children: [
        {
          id: 3,
          name: 'John',
          birthdate: new Date('1992-02-02'),
        },
        {
          id: 4,
          name: 'Stig',
          birthdate: new Date('1993-02-02'),
        },
      ],
    };

    const serialized = {
      birthdate: '2018-05-11T00:00:00.000Z',
      bytes: 121412541,
      child: { birthdate: '1992-02-01T00:00:00.000Z', id: 2, name: 'Bear' },
      children: [
        { birthdate: '1992-02-02T00:00:00.000Z', id: 3, name: 'John' },
        { birthdate: '1993-02-02T00:00:00.000Z', id: 4, name: 'Stig' },
      ],
      id: 1,
      name: 'John',
      salary: 12444.22,
    };

    describe('created Model', () => {
      it('serializes', () => {
        const payload = Parent.encode(rich);
        expect(payload).toEqual(serialized);
      });

      it('deserializes', () => {
        const model = Parent.decode(serialized);
        expect(model).toEqual(rich);
      });
    });
  });
});
