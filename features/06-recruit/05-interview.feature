@recruit
@recruit_interview
Feature: Recruit interview

  Scenario: Get interview slots
    Given user profileId 61e308efa4d9680019bc343c
    When GET /api/v1/recruit/interview/slots
    Then HTTP response status should be OK
    And recruit interview slots should contain
      | refId         | start                    | end                      | isAvailable | isSelected |
      | 14kp50-14kp5u | 2099-07-29T15:00:00.000Z | 2099-07-29T15:30:00.000Z | false       | true       |
      | 14kp5u-14kp6o | 2099-07-29T15:30:00.000Z | 2099-07-29T16:00:00.000Z | true        | false      |

  Scenario: Rebook (same slot)
    Given user profileId 61e308efa4d9680019bc343c
    When GET /api/v1/recruit/interview/slots
    Then recruit interview slots should contain
      | refId         | start                    | end                      | isAvailable | isSelected |
      | 14kp50-14kp5u | 2099-07-29T15:00:00.000Z | 2099-07-29T15:30:00.000Z | false       | true       |
      | 14kp5u-14kp6o | 2099-07-29T15:30:00.000Z | 2099-07-29T16:00:00.000Z | true        | false      |
    When PUT /api/v1/recruit/interview/slots/14kp50-14kp5u/book
    Then HTTP response status should be NO_CONTENT
    When GET /api/v1/recruit/interview/slots
    Then recruit interview slots should contain
      | refId         | start                    | end                      | isAvailable | isSelected |
      | 14kp50-14kp5u | 2099-07-29T15:00:00.000Z | 2099-07-29T15:30:00.000Z | false       | true       |
      | 14kp5u-14kp6o | 2099-07-29T15:30:00.000Z | 2099-07-29T16:00:00.000Z | true        | false      |

  Scenario: Amend slot
    Given user profileId 61e308efa4d9680019bc343c
    When PUT /api/v1/recruit/interview/slots/14kp5u-14kp6o/book
    Then HTTP response status should be NO_CONTENT
    When GET /api/v1/recruit/interview/slots
    Then recruit interview slots should contain
      | refId         | start                    | end                      | isAvailable | isSelected |
      | 14kp50-14kp5u | 2099-07-29T15:00:00.000Z | 2099-07-29T15:30:00.000Z | true        | false      |
      | 14kp5u-14kp6o | 2099-07-29T15:30:00.000Z | 2099-07-29T16:00:00.000Z | false       | true       |

  Scenario: Cancel
    Given user profileId 61e308efa4d9680019bc343c
    When PUT /api/v1/recruit/interview/slots/cancel
    Then HTTP response status should be NO_CONTENT
    When GET /api/v1/recruit/interview/slots
    Then recruit interview slots should contain
      | refId         | start                    | end                      | isAvailable | isSelected |
      | 14kp50-14kp5u | 2099-07-29T15:00:00.000Z | 2099-07-29T15:30:00.000Z | true        | false      |
      | 14kp5u-14kp6o | 2099-07-29T15:30:00.000Z | 2099-07-29T16:00:00.000Z | true        | false      |

  Scenario: Book (reset to the original one for testing)
    Given user profileId 61e308efa4d9680019bc343c
    When PUT /api/v1/recruit/interview/slots/14kp50-14kp5u/book
    Then HTTP response status should be NO_CONTENT
    When GET /api/v1/recruit/interview/slots
    Then recruit interview slots should contain
      | refId         | start                    | end                      | isAvailable | isSelected |
      | 14kp50-14kp5u | 2099-07-29T15:00:00.000Z | 2099-07-29T15:30:00.000Z | false       | true       |
      | 14kp5u-14kp6o | 2099-07-29T15:30:00.000Z | 2099-07-29T16:00:00.000Z | true        | false      |
