export const input = `
// @flow

type Foo = {
  bar: number,
  baz: Array<{
    qux: number,
    blah: $ReadOnly<{
      blsdf: string,
    }>,
    glorb: {a: number}[],
  }>,
}
`

export const parser = 'babylon'

export const expected = `
// @flow

type Foo = $ReadOnly<{
  bar: number,
  baz: $ReadOnlyArray<$ReadOnly<{
    qux: number,
    blah: $ReadOnly<{
      blsdf: string,
    }>,
    glorb: $ReadOnlyArray<$ReadOnly<{a: number}>>,
  }>>,
}>
`
