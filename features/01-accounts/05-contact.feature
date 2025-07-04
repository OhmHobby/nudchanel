@contact
Feature: Account contact

  Scenario: Update contact
    Given user profileId 5b794c41fd533e3b2f61cf05
    And profile contact tels "0812345678"
    And profile contact emails "test@test.com"
    When PUT /api/v1/accounts/profiles/me/contacts
    Then HTTP response status should be NO_CONTENT

  Scenario: Get contact
    Given user profileId 5b794c41fd533e3b2f61cf05
    When GET /api/v1/accounts/profiles/me/contacts
    Then HTTP response status should be OK
    And profile contact tels should be "0812345678"
    And profile contact emails should be "test@test.com"
