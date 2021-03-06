export const input = `
// @flow

type Foo = {|
  bar: number,
  baz: Array<{
    qux: number,
    blah: $ReadOnly<{|
      blsdf: string,
    |}>,
    glorb: {a: number}[],
    ...
  }>,
|}

// position
type Bar = {|
  baz: number,
  qux: {|
    blah: string,
  |},
|}
`

export const parser = 'babylon'

export const expected = `
// @flow

type Foo = {
  bar: number,
  baz: Array<{
    qux: number,
    blah: $ReadOnly<{ blsdf: string, ... }>,
    glorb: { a: number, ... }[],
    ...
  }>,
  ...
}

type Bar = {
  baz: number,
  qux: { blah: string, ... },
  ...
}
`
