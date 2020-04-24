import {
  ASTPath,
  Node,
  FileInfo,
  API,
  Options,
  GenericTypeAnnotation,
  ArrayTypeAnnotation,
} from 'jscodeshift'
import { FlowTypeKind } from 'ast-types/gen/kinds'

import hasAncestor from './util/hasAncestor'
import isClassOrInterfaceBody from './util/isClassOrInterfaceBody'

type Filter = (
  path: ASTPath<Node>,
  index: number,
  paths: Array<ASTPath<Node>>
) => boolean

module.exports = function makeReadOnly(
  fileInfo: FileInfo,
  api: API,
  options: Options
): string | null | undefined | void {
  const j = api.jscodeshift

  const root = j(fileInfo.source)

  let filter: Filter

  const selectionStart = parseInt(options.selectionStart)
  const selectionEnd = options.selectionEnd
    ? parseInt(options.selectionEnd)
    : selectionStart

  if (selectionStart < selectionEnd) {
    filter = ({ node }: ASTPath<any>): boolean =>
      node.start >= selectionStart && node.end <= selectionEnd
  } else if (selectionStart === selectionEnd) {
    const containing = new Set(
      root
        .find(j.FlowType)
        .filter(
          ({ node }: ASTPath<any>): boolean =>
            node.start < selectionEnd && node.end >= selectionStart
        )
        .nodes()
    )
    filter = hasAncestor((path: ASTPath<any>) => containing.has(path.node))

    if (
      !root
        .find(j.ObjectTypeAnnotation)
        .filter(filter)
        .size() &&
      !root
        .find(j.GenericTypeAnnotation, { id: { name: 'Array' } })
        .filter(filter)
        .size() &&
      !root
        .find(j.ArrayTypeAnnotation)
        .filter(filter)
        .size()
    ) {
      filter = (): boolean => true
    }
  } else {
    filter = (): boolean => true
  }

  root
    .find(j.ObjectTypeAnnotation)
    .filter(filter)
    .filter(path => !isClassOrInterfaceBody(path))
    .replaceWith(
      (path: ASTPath<any>): FlowTypeKind => {
        const { node } = path
        const enclosing: GenericTypeAnnotation | undefined = j(path)
          .closest(j.GenericTypeAnnotation, {
            id: { name: '$ReadOnly' },
          })
          .nodes()[0]
        if (enclosing && enclosing.typeParameters?.params?.[0] === node) {
          return node
        }
        return j.genericTypeAnnotation(
          j.identifier('$ReadOnly'),
          j.typeParameterInstantiation([node])
        )
      }
    )

  root
    .find(j.GenericTypeAnnotation, {
      id: { name: 'Array' },
    })
    .filter(filter)
    .replaceWith(
      (path: ASTPath<GenericTypeAnnotation>): FlowTypeKind => {
        const elementType = path.node.typeParameters?.params?.[0]
        return elementType
          ? j.genericTypeAnnotation(
              j.identifier('$ReadOnlyArray'),
              j.typeParameterInstantiation([elementType])
            )
          : path.node
      }
    )

  root
    .find(j.ArrayTypeAnnotation)
    .filter(filter)
    .replaceWith(
      (path: ASTPath<ArrayTypeAnnotation>): FlowTypeKind =>
        j.genericTypeAnnotation(
          j.identifier('$ReadOnlyArray'),
          j.typeParameterInstantiation([path.node.elementType])
        )
    )

  return root.toSource()
}
