@team_member
Feature: Team member

  Scenario: List team members
    When GET /api/v1/accounts/teams/2021
    Then HTTP response status should be OK
    And team members should contain
      | profileId                | firstname | lastname   | nickname | roles         | group       |
      | 5b794c26fd533e3b2f61ce93 | Sila      | Sonpee     | Au       | Web Developer | NUD Channel |
      | 5b794c41fd533e3b2f61cf05 | Nattawat  | Jamlongrad | Arm      | Web Developer | NUD Channel |
