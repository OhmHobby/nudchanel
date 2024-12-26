@ldap
@ldap_search_dn_all
Feature: LDAP Search DN all

  Background:
    Given bindDn = "cn=root"

  Scenario: Search All
    Given searchBase = "o=nudchannel.com"
    And searchScope = "sub"
    And searchFilter = "(objectclass=*)"
    When do ldap bind and search
    Then ldap response should not have error
    And search result DN "ou=users,o=nudchannel.com" should have "objectclass" contains "top"
    And search result DN "ou=groups,o=nudchannel.com" should have "objectclass" contains "top"
    And search result DN "cn=nudch,ou=groups,o=nudchannel.com" should have "cn" = "nudch"
    And search result DN "uid=silas,ou=users,o=nudchannel.com" should have "uid" = "silas"

  Scenario: search without bind should error
    And searchBase = "o=nudchannel.com"
    And searchScope = "sub"
    And searchFilter = "(objectclass=posixGroup)"
    When do ldap search
    Then ldap response should have error
