import {
  ASTPath,
  FileInfo,
  API,
  Options,
  ObjectTypeAnnotation,
} from 'jscodeshift'
import hasAncestor from './util/hasAncestor'

module.exports = function makeInexact(
  fileInfo: FileInfo,
  api: API,
  options: Options
): string | null | undefined | void {
  const j = api.jscodeshift

  const root = j(fileInfo.source)

  const ambiguousOnly = Boolean(options.ambiguousOnly)

  const selectionStart = parseInt(options.selectionStart)
  const selectionEnd = options.selectionEnd
    ? parseInt(options.selectionEnd)
    : selectionStart

  let target = root.find(j.ObjectTypeAnnotation)

  if (selectionStart < selectionEnd) {
    target = target.filter(
      ({ node }: ASTPath<any>): boolean =>
        node.start >= selectionStart && node.end <= selectionEnd
    )
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
    target = target.filter(hasAncestor(path => containing.has(path.node)))

    if (!target.size()) target = root.find(j.ObjectTypeAnnotation)
  }

  target.forEach((path: ASTPath<ObjectTypeAnnotation>): void => {
    const { node } = path
    if (!node.exact || !ambiguousOnly) {
      node.inexact = true
      node.exact = false
    }
  })

  return root.toSource()
}
