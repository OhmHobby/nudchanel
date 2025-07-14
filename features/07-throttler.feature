@throttler
Feature: Rate Limiting

  Background:
    Given I am making requests to test rate limiting

  Scenario: Allow 5 requests per second
    When I make 5 GET requests to /ping within 1 second
    Then all 5 requests should return OK status

  Scenario: Block 6th request in same second
    When I make 5 GET requests to /ping within 1 second
    And I make 1 additional GET request to /ping
    Then the 6th request should return TOO_MANY_REQUESTS status

  Scenario: Allow requests after 1 second window
    When I make 5 GET requests to /ping within 1 second
    And I wait for 1.1 seconds
    And I make 1 additional GET request to /ping
    Then the request should return OK status
