export const input = `
export class A {
  foo: number;
}
declare class B {
  foo: number;
}
interface C {
  foo: number;
}
declare interface D {
  foo: number;
}
declare type E = {
  foo: number;
}
`

export const parser = 'babylon'
export const options = {}

// note: a recast bug seems to strip the declare from declare type

export const expected = `
export class A {
  foo: number;
}
declare class B {
  foo: number;
}
interface C {
  foo: number;
}
declare interface D {
  foo: number;
}
type E = $ReadOnly<{
  foo: number,
}>
`
