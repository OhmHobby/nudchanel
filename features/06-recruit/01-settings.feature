@recruit
@recruit_settings
Feature: Recruit settings

  Scenario: Current setting
    When GET /api/v1/recruit
    Then HTTP response status should be OK
    And recruit settings response should be
      | id                                   | year | name         | openWhen                 | closeWhen                | interviewStart           | interviewEnd             | announceWhen             | maximumRole | isActive | collections.id                       | collections.title   | collections.isCompleted |
      | 018ff83a-89a8-7864-b861-5a62507dfa40 | 2024 | apply_2024_0 | 2024-07-20T14:30:03.000Z | 2099-07-29T13:30:00.000Z | 2099-07-29T15:00:00.000Z | 2099-07-29T16:00:00.000Z | 2099-07-30T13:30:00.000Z | 2           | true     | 018ff83a-ef38-71b9-a31e-31d1369d8c89 | คำถามส่วนกลาง (stg) |                         |

  Scenario: Current setting with registered applicant
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch
    When GET /api/v1/recruit
    Then HTTP response status should be OK
    And recruit settings response should be
      | id                                   | year | name         | openWhen                 | closeWhen                | interviewStart           | interviewEnd             | announceWhen             | maximumRole | isActive | collections.id                       | collections.title   | collections.isCompleted |
      | 018ff83a-89a8-7864-b861-5a62507dfa40 | 2024 | apply_2024_0 | 2024-07-20T14:30:03.000Z | 2099-07-29T13:30:00.000Z | 2099-07-29T15:00:00.000Z | 2099-07-29T16:00:00.000Z | 2099-07-30T13:30:00.000Z | 2           | true     | 018ff83a-ef38-71b9-a31e-31d1369d8c89 | คำถามส่วนกลาง (stg) | false                   |

  Scenario: Current setting (override id)
    Given recruit id "017ab8b5-d068-717a-91b5-0362de7dd822"
    When GET /api/v1/recruit
    Then HTTP response status should be OK
    And recruit settings response should be
      | id                                   | year | name         | openWhen                 | closeWhen                | interviewStart | interviewEnd | announceWhen             | maximumRole | isActive | collections.id                       | collections.title | collections.isCompleted |
      | 017ab8b5-d068-717a-91b5-0362de7dd822 | 2021 | apply_2021_2 | 2022-01-15T17:00:00.000Z | 2022-01-22T16:59:59.000Z | null           | null         | 2022-01-31T01:00:00.000Z | 2           | false    | 017dcbdb-f610-7a22-9357-b422f937bad5 | คำถามส่วนกลาง     |                         |

  Scenario: Get settings
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch
    When GET /api/v1/recruit/settings
    Then HTTP response status should be OK
    And recruit settings response should be
      | id                                   | year | name         | openWhen                 | closeWhen                | interviewStart | interviewEnd | announceWhen             | maximumRole | isActive | collections.id | collections.title | collections.isCompleted |
      | 017ab8b5-d068-717a-91b5-0362de7dd822 | 2021 | apply_2021_2 | 2022-01-15T17:00:00.000Z | 2022-01-22T16:59:59.000Z | undefined      | undefined    | 2022-01-31T01:00:00.000Z | 2           | false    | undefined      | undefined         | undefined               |
      | 018ff83a-89a8-7864-b861-5a62507dfa40 | 2024 | apply_2024_0 | 2024-07-20T14:30:03.000Z | 2099-07-29T13:30:00.000Z | undefined      | undefined    | 2099-07-30T13:30:00.000Z | 2           | true     | undefined      | undefined         | undefined               |

  Scenario: Get setting
    Given user profileId 5b794c26fd533e3b2f61ce93
    And user groups nudch
    When GET /api/v1/recruit/settings/018ff83a-89a8-7864-b861-5a62507dfa40
    Then HTTP response status should be OK
    And recruit settings response should be
      | id                                   | year | name         | openWhen                 | closeWhen                | interviewStart | interviewEnd | announceWhen             | maximumRole | isActive | collections.id | collections.title | collections.isCompleted |
      | 018ff83a-89a8-7864-b861-5a62507dfa40 | 2024 | apply_2024_0 | 2024-07-20T14:30:03.000Z | 2099-07-29T13:30:00.000Z | undefined      | undefined    | 2099-07-30T13:30:00.000Z | 2           | true     | undefined      | undefined         | undefined               |

  Scenario: Get setting (forbidden)
    Given user profileId 5b794c41fd533e3b2f61cf05
    When GET /api/v1/recruit/settings/018ff83a-89a8-7864-b861-5a62507dfa40
    Then HTTP response status should be FORBIDDEN
