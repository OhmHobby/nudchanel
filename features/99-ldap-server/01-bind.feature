@ldap
@ldap_bind
Feature: LDAP Bind

  Scenario: valid root credential
    Given bindDn = "cn=root"
    When do ldap bind
    Then ldap response should not have error

  Scenario: invalid root credential
    Given bindDn = "cn=root"
    And bindSecret = "Secret"
    When do ldap bind
    Then ldap response should have error
