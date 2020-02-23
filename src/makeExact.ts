import {
  ASTPath,
  Node,
  FileInfo,
  API,
  Options,
  ObjectTypeAnnotation,
} from 'jscodeshift'

type Filter = (
  path: ASTPath<Node>,
  index: number,
  paths: Array<ASTPath<Node>>
) => boolean

module.exports = function makeExact(
  fileInfo: FileInfo,
  api: API,
  options: Options
): string | null | undefined | void {
  const j = api.jscodeshift

  const root = j(fileInfo.source)

  const ambiguousOnly = Boolean(options.ambiguousOnly)

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
    .forEach((path: ASTPath<ObjectTypeAnnotation>): void => {
      const { node } = path
      if (!node.inexact || !ambiguousOnly) {
        node.exact = true
        node.inexact = false
      }
    })

  return root.toSource()
}
