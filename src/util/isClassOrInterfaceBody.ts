import { ASTPath } from 'jscodeshift'

export default function isClassOrInterfaceBody({
  parentPath,
}: ASTPath<any>): boolean {
  const parentType = parentPath?.node?.type
  return (
    parentType === 'DeclareClass' ||
    parentType === 'DeclareInterface' ||
    parentType === 'ClassDeclaration' ||
    parentType === 'InterfaceDeclaration'
  )
}
