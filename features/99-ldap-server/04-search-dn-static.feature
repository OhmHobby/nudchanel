@ldap
@ldap_search_dn_static
Feature: LDAP Search DN static

  Background:
    Given bindDn = "cn=root"

  Scenario: Search DN base
    Given searchBase = "o=nudchannel.com"
    And searchScope = "base"
    And searchFilter = "(objectclass=*)"
    When do ldap bind and search
    Then ldap response should not have error
    And search result DN "o=nudchannel.com" should have "objectclass" contains "top"
    And search result DN "o=nudchannel.com" should have "objectclass" contains "dcObject"
    And search result DN "o=nudchannel.com" should have "objectclass" contains "organization"

  Scenario: Search DN sub
    Given searchBase = "o=nudchannel.com"
    And searchScope = "sub"
    And searchFilter = "(objectclass=top)"
    When do ldap bind and search
    Then ldap response should not have error
    And search result DN "ou=users,o=nudchannel.com" should have "objectclass" contains "top"
    And search result DN "ou=groups,o=nudchannel.com" should have "objectclass" contains "top"
