@sign_in_local
Feature: Sign in local

  Scenario: Sign in OK
    Given sign in with username = "nattawatj"
    And sign in with password = "nudchDev!123"
    When POST /api/v1/accounts/sign-in/local
    Then HTTP response status should be OK

  Scenario: Sign in - username not found
    Given sign in with username = "nattawat"
    And sign in with password = "nudchDev!123"
    When POST /api/v1/accounts/sign-in/local
    Then HTTP response status should be UNAUTHORIZED

  Scenario: Sign in - invalid password
    Given sign in with username = "nattawatj"
    And sign in with password = "nudchDev1123"
    When POST /api/v1/accounts/sign-in/local
    Then HTTP response status should be UNAUTHORIZED
