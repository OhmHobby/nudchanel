import { Injectable } from '@nestjs/common'
import { InsufficientAccessRightsError } from 'ldapjs'
import { LdapRequest } from './types/ldap-request.type'

@Injectable()
export class LdapAuthorizeService {
  handler(req: LdapRequest, res, next) {
    if (req.connection.ldap.bindDN.equals('cn=root')) {
      return next()
    } else {
      return next(new InsufficientAccessRightsError())
    }
  }
}
