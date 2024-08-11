@x_api_key
Feature: X-Api-Key

  Scenario: Valid API Key
    Given API key "34999eb3-39d5-4206-9a1a-eb572c92dee2"
    When GET /api/v1/api-keys
    Then HTTP response status should be OK
    And API key service should be "photo-processor"

  Scenario: Invalid API Key
    Given API key "34999eb3-39d5-4206-9a1a-eb572c92dee3"
    When GET /api/v1/api-keys
    Then HTTP response status should be UNAUTHORIZED

Scenario: Malformed API Key
    Given API key "test"
    When GET /api/v1/api-keys
    Then HTTP response status should be BAD_REQUEST
