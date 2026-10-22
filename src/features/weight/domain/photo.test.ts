import { photoResize, planPhotoChange } from './photo';

describe('photoResize', () => {
  it('shrinks the long side of a portrait photo to 1280 px', () =>
    expect(photoResize(3024, 4032)).toEqual({ height: 1280 }));
  it('shrinks the long side of a landscape photo to 1280 px', () =>
    expect(photoResize(4032, 3024)).toEqual({ width: 1280 }));
  it('shrinks a square photo by its width', () =>
    expect(photoResize(2000, 2000)).toEqual({ width: 1280 }));
  it('leaves a small photo as it is (never enlarges)', () => {
    expect(photoResize(1080, 1280)).toBeNull();
    expect(photoResize(640, 480)).toBeNull();
  });
});

describe('planPhotoChange', () => {
  it('a new entry with a picked photo: store it', () =>
    expect(planPhotoChange(null, { picked: 'file:///cache/a.jpg' })).toEqual({
      store: 'file:///cache/a.jpg',
      column: 'set',
      remove: null,
    }));

  it('a new entry without a photo: nothing to store or delete', () =>
    expect(planPhotoChange(null, null)).toEqual({ store: null, column: 'set', remove: null }));

  it('the same photo as before: keep the column, touch no file', () =>
    expect(planPhotoChange('photos/a.jpg', { stored: 'photos/a.jpg' })).toEqual({
      store: null,
      column: 'keep',
      remove: null,
    }));

  it('a replaced photo: store the new one, delete the old one', () =>
    expect(planPhotoChange('photos/a.jpg', { picked: 'file:///cache/b.jpg' })).toEqual({
      store: 'file:///cache/b.jpg',
      column: 'set',
      remove: 'photos/a.jpg',
    }));

  it('a removed photo: clear the column, delete the file', () =>
    expect(planPhotoChange('photos/a.jpg', null)).toEqual({
      store: null,
      column: 'set',
      remove: 'photos/a.jpg',
    }));

  it("never deletes a file that isn't this entry's", () =>
    expect(planPhotoChange('photos/a.jpg', { stored: 'photos/other.jpg' }).remove).toBeNull());
});
