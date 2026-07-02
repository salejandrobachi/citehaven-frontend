import { gql } from '@apollo/client'

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      userId
      email
    }
  }
`

export const REGISTER_MUTATION = gql`
  mutation Register(
    $email: String!
    $password: String!
    $name: String
    $organizationCode: String
  ) {
    register(
      email: $email
      password: $password
      name: $name
      organizationCode: $organizationCode
    ) {
      token
      userId
      email
    }
  }
`

export const VAULTS_QUERY = gql`
  query Vaults {
    vaults {
      id
      title
      createdAt
    }
  }
`

export const CREATE_VAULT_MUTATION = gql`
  mutation CreateVault($title: String!) {
    createVault(title: $title) {
      id
      title
      createdAt
    }
  }
`

export const UPDATE_VAULT_MUTATION = gql`
  mutation UpdateVault($id: ID!, $title: String!) {
    updateVault(id: $id, title: $title) {
      id
      title
      createdAt
    }
  }
`

export const DELETE_VAULT_MUTATION = gql`
  mutation DeleteVault($id: ID!) {
    deleteVault(id: $id) {
      id
    }
  }
`

export interface AuthPayload {
  token: string
  userId: string
  email: string
}

export interface LoginData {
  login: AuthPayload
}

export interface LoginVariables {
  email: string
  password: string
}

export interface RegisterData {
  register: AuthPayload
}

export interface RegisterVariables {
  email: string
  password: string
  name?: string
  organizationCode?: string
}

export interface Vault {
  id: string
  title: string
  createdAt: string
}

export interface VaultsData {
  vaults: Vault[]
}

export interface CreateVaultData {
  createVault: Vault
}

export interface CreateVaultVariables {
  title: string
}

export interface UpdateVaultData {
  updateVault: Vault
}

export interface UpdateVaultVariables {
  id: string
  title: string
}

export interface DeleteVaultData {
  deleteVault: { id: string }
}

export interface DeleteVaultVariables {
  id: string
}
