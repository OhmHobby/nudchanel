@ldap
@ldap_search_dn_users
Feature: LDAP Search DN users

  Background:
    Given bindDn = "cn=root"

  @search_dn_users
  Scenario: Search user base
    Given searchBase = "uid=nattawatj,ou=users,o=nudchannel.com"
    And searchScope = "base"
    When do ldap bind and search
    Then ldap response should not have error
    And search result DN "uid=nattawatj,ou=users,o=nudchannel.com" should have "uid" = "nattawatj"
    And search result should not have DN "uid=pheranatl,ou=users,o=nudchannel.com"

  @search_dn_users
  Scenario: Search posixAccount - objectClass
    Given searchBase = "o=nudchannel.com"
    And searchScope = "sub"
    And searchFilter = "(objectClass=posixAccount)"
    When do ldap bind and search
    Then ldap response should not have error
    And search result DN "uid=nattawatj,ou=users,o=nudchannel.com" should have "cn" = "Nattawat Jamlongrad"
    And search result DN "uid=pheranatl,ou=users,o=nudchannel.com" should have "cn" = "Pheranat Lorwongkamol"

  @search_dn_user
  Scenario: Search posixAccount - objectClass and uid
    Given searchBase = "o=nudchannel.com"
    And searchScope = "sub"
    And searchFilter = "(&(uid=yanisab))"
    When do ldap bind and search
    Then ldap response should not have error
    And search result DN "uid=yanisab,ou=users,o=nudchannel.com" should have "uid" = "yanisab"
    And search result DN "uid=yanisab,ou=users,o=nudchannel.com" should have "mail" = "yanisab65@nu.ac.th"
    And search result DN "uid=yanisab,ou=users,o=nudchannel.com" should have "givenName" = "Yanisa"
    And search result DN "uid=yanisab,ou=users,o=nudchannel.com" should have "uidNumber" = "1005"
    And search result DN "uid=yanisab,ou=users,o=nudchannel.com" should have "gidNumber" = "1005"
    And search result DN "uid=yanisab,ou=users,o=nudchannel.com" should have "objectclass" contains "posixAccount"
    And search result DN "uid=yanisab,ou=users,o=nudchannel.com" should have "jpegPhoto" = "null"

  @search_dn_user
  Scenario: Search posixAccount - objectClass and uid and any uid
    Given searchBase = "o=nudchannel.com"
    And searchScope = "sub"
    And searchFilter = "(&(uid=silas)(objectclass=posixaccount)(uid=*)(uidNumber=*))"
    When do ldap bind and search
    Then ldap response should not have error
    And search result DN "uid=silas,ou=users,o=nudchannel.com" should have "uid" = "silas"

  @search_dn_user
  Scenario: Search posixAccount - uid
    Given searchBase = "o=nudchannel.com"
    And searchScope = "sub"
    And searchFilter = "(uid=sirapitw)"
    When do ldap bind and search
    Then ldap response should not have error
    And search result DN "uid=sirapitw,ou=users,o=nudchannel.com" should have "uid" = "sirapitw"
