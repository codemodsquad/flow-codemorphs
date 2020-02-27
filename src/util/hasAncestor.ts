import { ASTPath } from 'jscodeshift'

const hasAncestor = <N>(predicate: (path: ASTPath<N>) => boolean) => (
  path: ASTPath<N>
): boolean => {
  while (path) {
    if (predicate(path)) return true
    path = path.parent
  }
  return false
}

export default hasAncestor
