import { DN } from 'ldapjs'
import { LdapRequestScope } from 'src/enums/ldap-request-scope.enum'

export type LdapRequestFilter = {
  matches: (attributes: object) => boolean
  filters: { attribute: string; raw: any; value: any }[]
}

export type LdapRequest = {
  dn: DN
  scope: LdapRequestScope
  filter: LdapRequestFilter
  json: Record<string, any>
  connection: { ldap: { bindDN: DN } }
  attributes: string[]
  credentials?: string
  startTime: number
  suffix: object
}
