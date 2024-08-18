@team_member
Feature: Team member

  Scenario: List team members
    When GET /api/v1/accounts/teams/2021
    Then HTTP response status should be OK
    And team members should contain
      | profileId                | firstname | lastname   | nickname | roles         | group       | photoUrl                                                                         |
      | 5b794c26fd533e3b2f61ce93 | Sila      | Sonpee     | Au       | Web Developer | NUD Channel | https://photos.nudchannel.com/profiles/82f58501-b804-4e71-86a4-81d60a1ed217.webp |
      | 5b794c41fd533e3b2f61cf05 | Nattawat  | Jamlongrad | Arm      | Web Developer | NUD Channel | https://photos.nudchannel.com/profiles/c3b39436-926a-577e-a549-f9161e11c9d9.webp |
