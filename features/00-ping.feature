@ping
Feature: Ping

  Scenario: Ping pong
    When GET /ping
    Then HTTP response status should be OK
    And HTTP response text should be "pong"
