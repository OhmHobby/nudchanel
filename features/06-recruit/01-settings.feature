@recruit
@recruit_settings
Feature: Recruit settings

  Scenario: Current setting
    When GET /api/v1/recruit
    Then HTTP response status should be OK
    And recruit settings response should be
      | id                                   | year | name         | openWhen                 | closeWhen                | announceWhen             | maximumRole | isActive | collections.id | collections.title | collections.isCompleted |
      | 018ff83a-89a8-7864-b861-5a62507dfa40 | 2024 | apply_2024_0 | 2024-07-20T14:30:03.000Z | 2024-07-27T07:51:37.000Z | 2024-07-27T07:51:37.000Z | 2           | true     | undefined      | undefined         | undefined               |

  Scenario: Current setting with registered applicant
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch
    When GET /api/v1/recruit
    Then HTTP response status should be OK
    And recruit settings response should be
      | id                                   | year | name         | openWhen                 | closeWhen                | announceWhen             | maximumRole | isActive | collections.id                       | collections.title   | collections.isCompleted |
      | 018ff83a-89a8-7864-b861-5a62507dfa40 | 2024 | apply_2024_0 | 2024-07-20T14:30:03.000Z | 2024-07-27T07:51:37.000Z | 2024-07-27T07:51:37.000Z | 2           | true     | 018ff83a-ef38-71b9-a31e-31d1369d8c89 | คำถามส่วนกลาง (stg) | false                   |

  Scenario: Get setting
    Given user profileId 5b794c26fd533e3b2f61ce93
    And user groups nudch
    When GET /api/v1/recruit/settings/018ff83a-89a8-7864-b861-5a62507dfa40
    Then HTTP response status should be OK
    And recruit settings response should be
      | id                                   | year | name         | openWhen                 | closeWhen                | announceWhen             | maximumRole | isActive | collections.id | collections.title | collections.isCompleted |
      | 018ff83a-89a8-7864-b861-5a62507dfa40 | 2024 | apply_2024_0 | 2024-07-20T14:30:03.000Z | 2024-07-27T07:51:37.000Z | 2024-07-27T07:51:37.000Z | 2           | true     | undefined      | undefined         | undefined               |

  Scenario: Get setting (forbidden)
    Given user profileId 5b794c41fd533e3b2f61cf05
    When GET /api/v1/recruit/settings/018ff83a-89a8-7864-b861-5a62507dfa40
    Then HTTP response status should be FORBIDDEN
