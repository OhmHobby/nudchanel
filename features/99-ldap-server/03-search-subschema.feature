@ldap
@ldap_search_subschema
Feature: LDAP Search Subschema

  Scenario: search subschema
    Given searchBase = "cn=Subschema"
    And searchFilter = "(objectclass=*)"
    When do ldap search
    Then ldap response should not have error
    And search result DN "cn=Subschema" should have "cn" = "Subschema"
    And search result DN "cn=Subschema" should have "objectclass" contains "top"
    And search result DN "cn=Subschema" should have "objectclass" contains "subentry"
    And search result DN "cn=Subschema" should have "objectclass" contains "subschema"
    And search result DN "cn=Subschema" should have "objectclass" contains "extensibleObject"
