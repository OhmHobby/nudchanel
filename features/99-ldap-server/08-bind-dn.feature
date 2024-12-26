@ldap
@ldap_bind_dn
Feature: LDAP Bind DN

  Scenario: Valid password
    Given bindDn = "uid=nattawatj, ou=users, o=nudchannel.com"
    And bindSecret = "nudchDev!123"
    When do ldap bind
    Then ldap response should not have error

  Scenario: Invalid password
    Given bindDn = "uid=nattawatj, ou=users, o=nudchannel.com"
    And bindSecret = "Password"
    When do ldap bind
    Then ldap response should have error

  Scenario: Invalid username
    Given bindDn = "uid=developmentu, ou=users, o=nudchannel.com"
    And bindSecret = "password"
    When do ldap bind
    Then ldap response should have error
