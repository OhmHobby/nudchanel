@recruit
@recruit_interview
Feature: Recruit interview

  Scenario: Get interview slots
    Given user profileId 61e308efa4d9680019bc343c
    When GET /api/v1/recruit/interview/slots
    Then HTTP response status should be OK
    And recruit interview slots should contain
      | refId       | start                    | end                      | isAvailable | isSelected |
      | h38h0-h38hu | 2024-07-29T15:00:00.000Z | 2024-07-29T15:30:00.000Z | false       | true       |
      | h38hu-h38io | 2024-07-29T15:30:00.000Z | 2024-07-29T16:00:00.000Z | true        | false      |

  Scenario: Rebook (same slot)
    Given user profileId 61e308efa4d9680019bc343c
    When GET /api/v1/recruit/interview/slots
    Then recruit interview slots should contain
      | refId       | start                    | end                      | isAvailable | isSelected |
      | h38h0-h38hu | 2024-07-29T15:00:00.000Z | 2024-07-29T15:30:00.000Z | false       | true       |
      | h38hu-h38io | 2024-07-29T15:30:00.000Z | 2024-07-29T16:00:00.000Z | true        | false      |
    When PUT /api/v1/recruit/interview/slots/h38h0-h38hu/book
    Then HTTP response status should be NO_CONTENT
    When GET /api/v1/recruit/interview/slots
    Then recruit interview slots should contain
      | refId       | start                    | end                      | isAvailable | isSelected |
      | h38h0-h38hu | 2024-07-29T15:00:00.000Z | 2024-07-29T15:30:00.000Z | false       | true       |
      | h38hu-h38io | 2024-07-29T15:30:00.000Z | 2024-07-29T16:00:00.000Z | true        | false      |

  Scenario: Amend slot
    Given user profileId 61e308efa4d9680019bc343c
    When PUT /api/v1/recruit/interview/slots/h38hu-h38io/book
    Then HTTP response status should be NO_CONTENT
    When GET /api/v1/recruit/interview/slots
    Then recruit interview slots should contain
      | refId       | start                    | end                      | isAvailable | isSelected |
      | h38h0-h38hu | 2024-07-29T15:00:00.000Z | 2024-07-29T15:30:00.000Z | true        | false      |
      | h38hu-h38io | 2024-07-29T15:30:00.000Z | 2024-07-29T16:00:00.000Z | false       | true       |

  Scenario: Cancel
    Given user profileId 61e308efa4d9680019bc343c
    When PUT /api/v1/recruit/interview/slots/cancel
    Then HTTP response status should be NO_CONTENT
    When GET /api/v1/recruit/interview/slots
    Then recruit interview slots should contain
      | refId       | start                    | end                      | isAvailable | isSelected |
      | h38h0-h38hu | 2024-07-29T15:00:00.000Z | 2024-07-29T15:30:00.000Z | true        | false      |
      | h38hu-h38io | 2024-07-29T15:30:00.000Z | 2024-07-29T16:00:00.000Z | true        | false      |

  Scenario: Book (reset to the original one for testing)
    Given user profileId 61e308efa4d9680019bc343c
    When PUT /api/v1/recruit/interview/slots/h38h0-h38hu/book
    Then HTTP response status should be NO_CONTENT
    When GET /api/v1/recruit/interview/slots
    Then recruit interview slots should contain
      | refId       | start                    | end                      | isAvailable | isSelected |
      | h38h0-h38hu | 2024-07-29T15:00:00.000Z | 2024-07-29T15:30:00.000Z | false       | true       |
      | h38hu-h38io | 2024-07-29T15:30:00.000Z | 2024-07-29T16:00:00.000Z | true        | false      |
