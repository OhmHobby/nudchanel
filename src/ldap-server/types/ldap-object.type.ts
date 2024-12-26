import { DN } from 'ldapjs'

export type LdapObject = {
  dn: DN
  attributes: object
}
