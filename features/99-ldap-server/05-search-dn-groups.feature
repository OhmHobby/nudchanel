@ldap
@ldap_search_dn_groups
Feature: LDAP Search DN groups

  Background:
    Given bindDn = "cn=root"

  @search_dn_group
  Scenario: Search base
    Given searchBase = "cn=nudch,ou=groups,o=nudchannel.com"
    And searchScope = "base"
    When do ldap bind and search
    Then ldap response should not have error
    And search result should not have DN "cn=admin,ou=groups,o=nudchannel.com"
    And search result DN "cn=nudch,ou=groups,o=nudchannel.com" should have "cn" = "nudch"
    And search result DN "cn=nudch,ou=groups,o=nudchannel.com" should have "gidNumber" = "106"
    And search result DN "cn=nudch,ou=groups,o=nudchannel.com" should have "objectclass" contains "posixGroup"
    And search result DN "cn=nudch,ou=groups,o=nudchannel.com" should have "memberUid" contains "nattawatj"
    And search result DN "cn=nudch,ou=groups,o=nudchannel.com" should have "memberUid" contains "sirapitw"

  @search_dn_groups
  Scenario: Search sub posixGroup
    Given searchBase = "o=nudchannel.com"
    And searchScope = "sub"
    And searchFilter = "(objectClass=posixGroup)"
    When do ldap bind and search
    Then ldap response should not have error
    And search result DN "cn=admin,ou=groups,o=nudchannel.com" should have "cn" = "admin"
    And search result DN "cn=admin,ou=groups,o=nudchannel.com" should have "gidNumber" = "101"
    And search result DN "cn=nudch,ou=groups,o=nudchannel.com" should have "cn" = "nudch"
    And search result DN "cn=nudch,ou=groups,o=nudchannel.com" should have "gidNumber" = "106"
    And search result DN "cn=nudch,ou=groups,o=nudchannel.com" should have "objectclass" contains "posixGroup"
    And search result DN "cn=nudch,ou=groups,o=nudchannel.com" should have "memberUid" contains "nattawatj"
    And search result DN "cn=nudch,ou=groups,o=nudchannel.com" should have "memberUid" contains "sirapitw"
