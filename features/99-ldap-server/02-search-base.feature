@ldap
@ldap_search_base
Feature: LDAP Search Base

  Scenario: search base
    Given searchBase = ""
    And searchScope = "base"
    And searchFilter = "(objectclass=*)"
    When do ldap search
    Then ldap response should not have error
    And search result DN "" should have "namingContexts" = "o=nudchannel.com"
    And search result DN "" should have "subschemaSubentry" = "cn=Subschema"
