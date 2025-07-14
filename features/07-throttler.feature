@throttler
Feature: Rate Limiting

  Background:
    Given I am making requests to test rate limiting

  Scenario: Allow 50 requests per second
    When I make 50 GET requests to /ping within 1 second
    Then all 50 requests should return OK status

  Scenario: Block 51th request in same second
    When I make 50 GET requests to /ping within 1 second
    And I make 1 additional GET request to /ping
    Then the 51th request should return TOO_MANY_REQUESTS status

  Scenario: Allow requests after 1 second window
    When I make 50 GET requests to /ping within 1 second
    And I wait for 1.1 seconds
    And I make 1 additional GET request to /ping
    Then the request should return OK status
