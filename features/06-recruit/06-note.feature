@recruit
@recruit_note
Feature: Recruit note

  Scenario: Create note
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch
    And recruit note body "Created note"
    And recruit note onlyMe true
    When POST /api/v1/recruit/applicants/0190f4a5-76f8-7328-9b2d-769e7cc88bbe/notes
    Then HTTP response status should be CREATED
    And recruit applicant notes response should contain
      | note         | onlyMe | isFromMe |
      | Created note | true   | true     |

  Scenario: Edit note
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch
    And recruit note body "Edited note"
    When Update latest recruit applicant "0190f4a5-76f8-7328-9b2d-769e7cc88bbe" note
    Then HTTP response status should be NO_CONTENT

  Scenario: Get notes
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch
    When GET /api/v1/recruit/applicants/0190f4a5-76f8-7328-9b2d-769e7cc88bbe/notes
    Then HTTP response status should be OK
    And recruit applicant notes response should contain
      | note        | onlyMe | isFromMe |
      | Edited note | true   | true     |

  Scenario: Delete note
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch
    When Delete latest recruit applicant "0190f4a5-76f8-7328-9b2d-769e7cc88bbe" note
    Then HTTP response status should be NO_CONTENT
