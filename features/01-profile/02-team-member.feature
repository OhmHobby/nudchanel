@team_member
Feature: Team member

  Scenario: List team members
    When GET /api/v1/accounts/teams/2021
    Then HTTP response status should be OK
    And team members should contain
      | profileId                | firstname | lastname   | nickname | roles         | group       | photoUrl                                                                         |
      | 5b794c26fd533e3b2f61ce93 | Sila      | Sonpee     | Au       | Web Developer | NUD Channel | https://photos.nudchannel.com/photos/profiles/a9921514-e10d-5b09-87be-b2f8abe1f9b9.webp |
      | 5b794c41fd533e3b2f61cf05 | Nattawat  | Jamlongrad | Arm      | Web Developer | NUD Channel | https://photos.nudchannel.com/photos/profiles/c3b39436-926a-577e-a549-f9161e11c9d9.webp |
