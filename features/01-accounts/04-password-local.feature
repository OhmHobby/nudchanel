@password_local
Feature: Password local

  Scenario: Too short password is not allowed
    Given user profileId 5b794c41fd533e3b2f61cf05
    And change password using current password = "password"
    And change password using new password = "nudch"
    When PATCH /api/v1/accounts/users/local/password
    Then HTTP response status should be BAD_REQUEST
    And HTTP response error message should be "Password requires at least 10 character(s)"

  Scenario: Common password is not allowed
    Given user profileId 5b794c41fd533e3b2f61cf05
    And change password using current password = "password"
    And change password using new password = "password"
    When PATCH /api/v1/accounts/users/local/password
    Then HTTP response status should be BAD_REQUEST
    And HTTP response error message should be "Common password is not allowed"

  Scenario: Similar to a commonly used password
    Given user profileId 5b794c41fd533e3b2f61cf05
    And change password using current password = "password"
    And change password using new password = "P@$$w0rd1234"
    When PATCH /api/v1/accounts/users/local/password
    Then HTTP response status should be BAD_REQUEST
    And HTTP response error message should be "Password is not strong enough: This is similar to a commonly used password"

  Scenario: Incorrect current password
    Given user profileId 5b794c41fd533e3b2f61cf05
    And change password using current password = "password"
    And change password using new password = "321!veDhcdun"
    When PATCH /api/v1/accounts/users/local/password
    Then HTTP response status should be BAD_REQUEST
    And HTTP response error message should be "Invalid current password"

  Scenario: Valid password
    Given user profileId 5b794c41fd533e3b2f61cf05
    And change password using current password = "nudchDev!123"
    And change password using new password = "nudchDev!123"
    When PATCH /api/v1/accounts/users/local/password
    Then HTTP response status should be NO_CONTENT
