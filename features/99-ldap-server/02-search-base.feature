@ldap
@ldap_search_base
Feature: LDAP Search Base

  Scenario: search base
    Given searchBase = ""
    And searchScope = "base"
    And searchFilter = "(objectclass=*)"
    And searchAttributes += "*"
    And searchAttributes += "altServer"
    And searchAttributes += "namingContexts"
    And searchAttributes += "supportedControl"
    And searchAttributes += "supportedExtension"
    And searchAttributes += "supportedFeatures"
    And searchAttributes += "supportedLDAPVersion"
    And searchAttributes += "supportedSASLMechanisms"
    And searchAttributes += "domainControllerFunctionality"
    And searchAttributes += "defaultNamingContext"
    And searchAttributes += "lastUSN"
    And searchAttributes += "highestCommittedUSN"
    When do ldap search
    Then ldap response should not have error
    And search result DN "" should have "namingContexts" = "o=nudchannel.com"
    And search result DN "" should have "subschemaSubentry" = "cn=Subschema"
