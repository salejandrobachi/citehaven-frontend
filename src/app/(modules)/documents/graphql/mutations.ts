import { gql } from '@apollo/client'

export const DOCUMENTS_QUERY = gql`
  query Documents($where: DocumentFilter) {
    documents(where: $where) {
      id
      filename
      fileType
      status
      createdAt
      storageUrl
    }
  }
`

export interface Document {
  id: string
  filename: string
  fileType: string
  status: string
  createdAt: string
  storageUrl: string
}

export interface DocumentsData {
  documents: Document[]
}

export interface DocumentFilter {
  vaultId?: string
}

export interface DocumentsVariables {
  where?: DocumentFilter
}

export const CREATE_DOCUMENT = gql`
  mutation CreateDocument(
    $vaultId: ID!
    $filename: String!
    $fileType: String!
    $storageUrl: String!
  ) {
    createDocument(
      vaultId: $vaultId
      filename: $filename
      fileType: $fileType
      storageUrl: $storageUrl
    ) {
      id
      status
    }
  }
`

export const PROCESS_DOCUMENT = gql`
  mutation ProcessDocument($id: ID!) {
    processDocument(id: $id) {
      id
      status
      filename
    }
  }
`

export interface CreateDocumentData {
  createDocument: {
    id: string
    status: string
  }
}

export interface CreateDocumentVariables {
  vaultId: string
  filename: string
  fileType: string
  storageUrl: string
}

export interface ProcessDocumentData {
  processDocument: {
    id: string
    status: string
    filename: string
  }
}

export interface ProcessDocumentVariables {
  id: string
}

export interface ProcessedDocument {
  id: string
  status: string
  filename: string
}
