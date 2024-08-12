@ping
Feature: Ping

  Scenario: Ping pong to server
    When GET /ping
    Then HTTP response status should be OK
    And HTTP response text should be "pong"

  Scenario: Ping pong to worker
    Given request to worker url
    When GET /ping
    Then HTTP response status should be OK
    And HTTP response text should be "pong"
