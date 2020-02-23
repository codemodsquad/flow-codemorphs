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
  if (options.selectionStart) {
    const selectionStart = parseInt(options.selectionStart)
    const selectionEnd = options.selectionEnd
      ? parseInt(options.selectionEnd)
      : selectionStart
    filter = ({ node }: ASTPath<any>): boolean =>
      node.start >= selectionStart && node.end <= selectionEnd
  } else {
    filter = (): boolean => true
  }

  root
    .find(j.ObjectTypeAnnotation)
    .filter(filter)
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
