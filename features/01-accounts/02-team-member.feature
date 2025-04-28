@team_member
Feature: Team member

  Scenario: List team members
    When GET /api/v1/accounts/teams/2021
    Then HTTP response status should be OK
    And team members should contain
      | profileId                | firstname | lastname   | nickname | roles         | group       | email     | photoUrl                                                                                |
      | 5b794c26fd533e3b2f61ce93 | Sila      | Sonpee     | Au       | Web Developer | NUD Channel | undefined | https://photos.nudchannel.com/photos/profiles/a9921514-e10d-5b09-87be-b2f8abe1f9b9.webp |
      | 5b794c41fd533e3b2f61cf05 | Nattawat  | Jamlongrad | Arm      | Web Developer | NUD Channel | undefined | https://photos.nudchannel.com/photos/profiles/c3b39436-926a-577e-a549-f9161e11c9d9.webp |

  Scenario: List team members with authorized to group
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch_2021
    When GET /api/v1/accounts/teams/2021
    Then HTTP response status should be OK
    And team members should contain
      | profileId                | firstname | lastname | nickname | roles         | group       | email               | photoUrl                                                                                |
      | 61a645308b6e8a0019048681 | Worawan   | Chamarat | View     | Web Developer | NUD Channel | worawanc64@nu.ac.th | https://photos.nudchannel.com/photos/profiles/3cec9d49-d47a-5974-a71d-dddc6891faa5.webp |
