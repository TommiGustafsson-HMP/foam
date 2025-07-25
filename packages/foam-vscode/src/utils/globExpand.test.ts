import { expandAlternateGroups } from './globExpand';

describe('testExpandAlternateGroupsForGlobs', () => {
  it('expands simple alternates', () => {
    expect(expandAlternateGroups('ignoredFile{1,2}.txt').sort()).toEqual(
      ['ignoredFile1.txt', 'ignoredFile2.txt'].sort()
    );
  });

  it('returns pattern unchanged if no braces', () => {
    expect(expandAlternateGroups('**/.git')).toEqual(['**/.git']);
  });

  it('multiple alternates recursively', () => {
    expect(expandAlternateGroups('foo{a,b}bar{1,2}.txt').sort()).toEqual(
      ['fooabar1.txt', 'fooabar2.txt', 'foobbar1.txt', 'foobbar2.txt'].sort()
    );
  });

  it('handles patterns with no alternates etc.', () => {
    expect(expandAlternateGroups('plainfile.txt')).toEqual(['plainfile.txt']);
  });

  it('handles empty alternates', () => {
    expect(expandAlternateGroups('file{}.txt')).toEqual(['file{}.txt']);
  });

  it('expands nested alternates', () => {
    expect(expandAlternateGroups('foo{{a,b},c}.txt').sort()).toEqual(
      ['fooa.txt', 'fooc.txt', 'foob.txt', 'fooc.txt'].sort()
    );
  });

  it('handles highly nested braces as literals', () => {
    expect(expandAlternateGroups('foo{{a,{b,c}},d}.txt').sort()).toEqual(
      [
        'fooa.txt',
        'food.txt',
        'foob.txt',
        'food.txt',
        'fooa.txt',
        'food.txt',
        'fooc.txt',
        'food.txt',
      ].sort()
    );
  });

  it('expands alternates at the start of the pattern', () => {
    expect(expandAlternateGroups('{a,b}file.txt').sort()).toEqual(
      ['afile.txt', 'bfile.txt'].sort()
    );
  });

  it('expands alternates at the end of the pattern', () => {
    expect(expandAlternateGroups('file.{js,ts}').sort()).toEqual(
      ['file.js', 'file.ts'].sort()
    );
  });

  it('expands alternates with more than two options', () => {
    expect(expandAlternateGroups('file{1,2,3}.txt').sort()).toEqual(
      ['file1.txt', 'file2.txt', 'file3.txt'].sort()
    );
  });

  it('handles patterns with multiple sets of braces (not nested)', () => {
    expect(expandAlternateGroups('foo{a,b}bar{x,y}.txt').sort()).toEqual(
      ['fooabarx.txt', 'fooabary.txt', 'foobbarx.txt', 'foobbary.txt'].sort()
    );
  });

  it('handles spaces outside the groups by treating them as part of the pattern', () => {
    expect(expandAlternateGroups('foo {a,b} bar.txt').sort()).toEqual(
      ['foo a bar.txt', 'foo b bar.txt'].sort()
    );
  });

  it('handles spaces inside the groups by treating them as part of the alternates', () => {
    expect(expandAlternateGroups('foo{ a, b }bar.txt').sort()).toEqual(
      ['foo abar.txt', 'foo b bar.txt'].sort()
    );
  });

  it('handles multiple patterns with nesting and spaces', () => {
    expect(
      expandAlternateGroups(
        'foo{a,b}bar{1,2}with{e,{ f ,g },{ h,{i, j,{k , l, m}}}}.txt'
      ).sort()
    ).toEqual(
      [
        'fooabar1with f .txt',
        'fooabar1with f .txt',
        'fooabar1with f .txt',
        'fooabar1with f .txt',
        'fooabar1with f .txt',
        'fooabar1with f .txt',
        'fooabar1with f .txt',
        'fooabar1with f .txt',
        'fooabar1with f .txt',
        'fooabar1with f .txt',
        'fooabar1with f .txt',
        'fooabar1with f .txt',
        'fooabar1with f .txt',
        'fooabar1with f .txt',
        'fooabar1with f .txt',
        'fooabar1with f .txt',
        'fooabar1with f .txt',
        'fooabar1with f .txt',
        'fooabar1with h.txt',
        'fooabar1with h.txt',
        'fooabar1with h.txt',
        'fooabar1with h.txt',
        'fooabar1with h.txt',
        'fooabar1with h.txt',
        'fooabar1with h.txt',
        'fooabar1with h.txt',
        'fooabar1with h.txt',
        'fooabar1with h.txt',
        'fooabar1with h.txt',
        'fooabar1with h.txt',
        'fooabar1with h.txt',
        'fooabar1with h.txt',
        'fooabar1with h.txt',
        'fooabar1with h.txt',
        'fooabar1with h.txt',
        'fooabar1with h.txt',
        'fooabar1with j.txt',
        'fooabar1with j.txt',
        'fooabar1with j.txt',
        'fooabar1with j.txt',
        'fooabar1with j.txt',
        'fooabar1with j.txt',
        'fooabar1with l.txt',
        'fooabar1with l.txt',
        'fooabar1with m.txt',
        'fooabar1with m.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withe.txt',
        'fooabar1withg .txt',
        'fooabar1withg .txt',
        'fooabar1withg .txt',
        'fooabar1withg .txt',
        'fooabar1withg .txt',
        'fooabar1withg .txt',
        'fooabar1withg .txt',
        'fooabar1withg .txt',
        'fooabar1withg .txt',
        'fooabar1withg .txt',
        'fooabar1withg .txt',
        'fooabar1withg .txt',
        'fooabar1withg .txt',
        'fooabar1withg .txt',
        'fooabar1withg .txt',
        'fooabar1withg .txt',
        'fooabar1withg .txt',
        'fooabar1withg .txt',
        'fooabar1withi.txt',
        'fooabar1withi.txt',
        'fooabar1withi.txt',
        'fooabar1withi.txt',
        'fooabar1withi.txt',
        'fooabar1withi.txt',
        'fooabar1withk .txt',
        'fooabar1withk .txt',
        'fooabar2with f .txt',
        'fooabar2with f .txt',
        'fooabar2with f .txt',
        'fooabar2with f .txt',
        'fooabar2with f .txt',
        'fooabar2with f .txt',
        'fooabar2with f .txt',
        'fooabar2with f .txt',
        'fooabar2with f .txt',
        'fooabar2with f .txt',
        'fooabar2with f .txt',
        'fooabar2with f .txt',
        'fooabar2with f .txt',
        'fooabar2with f .txt',
        'fooabar2with f .txt',
        'fooabar2with f .txt',
        'fooabar2with f .txt',
        'fooabar2with f .txt',
        'fooabar2with h.txt',
        'fooabar2with h.txt',
        'fooabar2with h.txt',
        'fooabar2with h.txt',
        'fooabar2with h.txt',
        'fooabar2with h.txt',
        'fooabar2with h.txt',
        'fooabar2with h.txt',
        'fooabar2with h.txt',
        'fooabar2with h.txt',
        'fooabar2with h.txt',
        'fooabar2with h.txt',
        'fooabar2with h.txt',
        'fooabar2with h.txt',
        'fooabar2with h.txt',
        'fooabar2with h.txt',
        'fooabar2with h.txt',
        'fooabar2with h.txt',
        'fooabar2with j.txt',
        'fooabar2with j.txt',
        'fooabar2with j.txt',
        'fooabar2with j.txt',
        'fooabar2with j.txt',
        'fooabar2with j.txt',
        'fooabar2with l.txt',
        'fooabar2with l.txt',
        'fooabar2with m.txt',
        'fooabar2with m.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withe.txt',
        'fooabar2withg .txt',
        'fooabar2withg .txt',
        'fooabar2withg .txt',
        'fooabar2withg .txt',
        'fooabar2withg .txt',
        'fooabar2withg .txt',
        'fooabar2withg .txt',
        'fooabar2withg .txt',
        'fooabar2withg .txt',
        'fooabar2withg .txt',
        'fooabar2withg .txt',
        'fooabar2withg .txt',
        'fooabar2withg .txt',
        'fooabar2withg .txt',
        'fooabar2withg .txt',
        'fooabar2withg .txt',
        'fooabar2withg .txt',
        'fooabar2withg .txt',
        'fooabar2withi.txt',
        'fooabar2withi.txt',
        'fooabar2withi.txt',
        'fooabar2withi.txt',
        'fooabar2withi.txt',
        'fooabar2withi.txt',
        'fooabar2withk .txt',
        'fooabar2withk .txt',
        'foobbar1with f .txt',
        'foobbar1with f .txt',
        'foobbar1with f .txt',
        'foobbar1with f .txt',
        'foobbar1with f .txt',
        'foobbar1with f .txt',
        'foobbar1with f .txt',
        'foobbar1with f .txt',
        'foobbar1with f .txt',
        'foobbar1with f .txt',
        'foobbar1with f .txt',
        'foobbar1with f .txt',
        'foobbar1with f .txt',
        'foobbar1with f .txt',
        'foobbar1with f .txt',
        'foobbar1with f .txt',
        'foobbar1with f .txt',
        'foobbar1with f .txt',
        'foobbar1with h.txt',
        'foobbar1with h.txt',
        'foobbar1with h.txt',
        'foobbar1with h.txt',
        'foobbar1with h.txt',
        'foobbar1with h.txt',
        'foobbar1with h.txt',
        'foobbar1with h.txt',
        'foobbar1with h.txt',
        'foobbar1with h.txt',
        'foobbar1with h.txt',
        'foobbar1with h.txt',
        'foobbar1with h.txt',
        'foobbar1with h.txt',
        'foobbar1with h.txt',
        'foobbar1with h.txt',
        'foobbar1with h.txt',
        'foobbar1with h.txt',
        'foobbar1with j.txt',
        'foobbar1with j.txt',
        'foobbar1with j.txt',
        'foobbar1with j.txt',
        'foobbar1with j.txt',
        'foobbar1with j.txt',
        'foobbar1with l.txt',
        'foobbar1with l.txt',
        'foobbar1with m.txt',
        'foobbar1with m.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withe.txt',
        'foobbar1withg .txt',
        'foobbar1withg .txt',
        'foobbar1withg .txt',
        'foobbar1withg .txt',
        'foobbar1withg .txt',
        'foobbar1withg .txt',
        'foobbar1withg .txt',
        'foobbar1withg .txt',
        'foobbar1withg .txt',
        'foobbar1withg .txt',
        'foobbar1withg .txt',
        'foobbar1withg .txt',
        'foobbar1withg .txt',
        'foobbar1withg .txt',
        'foobbar1withg .txt',
        'foobbar1withg .txt',
        'foobbar1withg .txt',
        'foobbar1withg .txt',
        'foobbar1withi.txt',
        'foobbar1withi.txt',
        'foobbar1withi.txt',
        'foobbar1withi.txt',
        'foobbar1withi.txt',
        'foobbar1withi.txt',
        'foobbar1withk .txt',
        'foobbar1withk .txt',
        'foobbar2with f .txt',
        'foobbar2with f .txt',
        'foobbar2with f .txt',
        'foobbar2with f .txt',
        'foobbar2with f .txt',
        'foobbar2with f .txt',
        'foobbar2with f .txt',
        'foobbar2with f .txt',
        'foobbar2with f .txt',
        'foobbar2with f .txt',
        'foobbar2with f .txt',
        'foobbar2with f .txt',
        'foobbar2with f .txt',
        'foobbar2with f .txt',
        'foobbar2with f .txt',
        'foobbar2with f .txt',
        'foobbar2with f .txt',
        'foobbar2with f .txt',
        'foobbar2with h.txt',
        'foobbar2with h.txt',
        'foobbar2with h.txt',
        'foobbar2with h.txt',
        'foobbar2with h.txt',
        'foobbar2with h.txt',
        'foobbar2with h.txt',
        'foobbar2with h.txt',
        'foobbar2with h.txt',
        'foobbar2with h.txt',
        'foobbar2with h.txt',
        'foobbar2with h.txt',
        'foobbar2with h.txt',
        'foobbar2with h.txt',
        'foobbar2with h.txt',
        'foobbar2with h.txt',
        'foobbar2with h.txt',
        'foobbar2with h.txt',
        'foobbar2with j.txt',
        'foobbar2with j.txt',
        'foobbar2with j.txt',
        'foobbar2with j.txt',
        'foobbar2with j.txt',
        'foobbar2with j.txt',
        'foobbar2with l.txt',
        'foobbar2with l.txt',
        'foobbar2with m.txt',
        'foobbar2with m.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withe.txt',
        'foobbar2withg .txt',
        'foobbar2withg .txt',
        'foobbar2withg .txt',
        'foobbar2withg .txt',
        'foobbar2withg .txt',
        'foobbar2withg .txt',
        'foobbar2withg .txt',
        'foobbar2withg .txt',
        'foobbar2withg .txt',
        'foobbar2withg .txt',
        'foobbar2withg .txt',
        'foobbar2withg .txt',
        'foobbar2withg .txt',
        'foobbar2withg .txt',
        'foobbar2withg .txt',
        'foobbar2withg .txt',
        'foobbar2withg .txt',
        'foobbar2withg .txt',
        'foobbar2withi.txt',
        'foobbar2withi.txt',
        'foobbar2withi.txt',
        'foobbar2withi.txt',
        'foobbar2withi.txt',
        'foobbar2withi.txt',
        'foobbar2withk .txt',
        'foobbar2withk .txt',
      ].sort()
    );
  });
});
