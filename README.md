# flow-codemorphs

[![CircleCI](https://circleci.com/gh/codemodsquad/flow-codemorphs.svg?style=svg)](https://circleci.com/gh/codemodsquad/flow-codemorphs)
[![Coverage Status](https://codecov.io/gh/codemodsquad/flow-codemorphs/branch/master/graph/badge.svg)](https://codecov.io/gh/codemodsquad/flow-codemorphs)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm version](https://badge.fury.io/js/flow-codemorphs.svg)](https://badge.fury.io/js/flow-codemorphs)

general purpose codemods for flow

# Table of Contents

<!-- toc -->

- [makeExact](#makeexact)
- [makeInexact](#makeinexact)
- [makeReadOnly](#makereadonly)

<!-- tocstop -->

# makeExact

Converts object shape types to exact objects.

## Options

`ambiguousOnly` - if truthy, only ambiguous object shape types will be converted.

You can pass `selectionStart` and `selectionEnd` options to only convert types within that
range. If `selectionStart === selectionEnd`, only converts the type annotation containing
the cursor, unless no type annotation contains the cursor, in which case it converts
everything.

## Example

### Before

```ts

// @flow

type Foo = {
  bar: number,
  baz: Array<{
    qux: number,
    blah: $ReadOnly<{
      blsdf: string,
    }>,
    glorb: {a: number}[],
    ...
  }>,
}

```

### Command

```
jscodeshift -t path/to/flow-codemorphs/makeExact.js <file>
```

### After

```ts

// @flow

type Foo = {|
  bar: number,
  baz: Array<{|
    qux: number,
    blah: $ReadOnly<{| blsdf: string |}>,
    glorb: {| a: number |}[],
  |}>,
|}

```

# makeInexact

Converts object shape types to inexact objects.

## Options

`ambiguousOnly` - if truthy, only ambiguous object shape types will be converted.

You can pass `selectionStart` and `selectionEnd` options to only convert types within that
range. If `selectionStart === selectionEnd`, only converts the type annotation containing
the cursor, unless no type annotation contains the cursor, in which case it converts
everything.

## Example

### Before

```ts

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

```

### Command

```
jscodeshift -t path/to/flow-codemorphs/makeInexact.js <file>
```

### After

```ts

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

```

# makeReadOnly

Converts mutable object shape and array types to readonly types.

## Options

You can pass `selectionStart` and `selectionEnd` options to only convert types within that
range. If `selectionStart === selectionEnd`, only converts the type annotation containing
the cursor, unless no type annotation contains the cursor, in which case it converts
everything.

## Example

### Before

```ts
// @flow

type Foo = {
  bar: number
  baz: Array<{
    qux: number
    blah: $ReadOnly<{
      blsdf: string
    }>
    glorb: { a: number }[]
  }>
}
```

### Command

```
jscodeshift -t path/to/flow-codemorphs/makeReadOnly.js <file>
```

### After

```ts
// @flow

type Foo = $ReadOnly<{
  bar: number
  baz: $ReadOnlyArray<
    $ReadOnly<{
      qux: number
      blah: $ReadOnly<{
        blsdf: string
      }>
      glorb: $ReadOnlyArray<$ReadOnly<{ a: number }>>
    }>
  >
}>
```
