@recruit
@recruit_applicants
Feature: Recruit applicants

  Scenario: Get my applicant info
    Given user profileId 61e308efa4d9680019bc343c
    When GET /api/v1/recruit/applicants/me
    Then HTTP response status should be OK
    And recruit applicants should contain
      | id                                   | profileId                | roles.id                             | roles.name    | roles.selectedPriority | interview.start          |
      | 0190f4a5-76f8-7328-9b2d-769e7cc88bbe | 61e308efa4d9680019bc343c | 0190d09c-fe20-7a9c-ac5a-faa9192bb325 | Web Developer | 0                      | 2024-07-29T15:00:00.000Z |

  Scenario: Get my applicant info - no selection
    Given user profileId 5b794c41fd533e3b2f61cf05
    When GET /api/v1/recruit/applicants/me
    Then HTTP response status should be OK
    And recruit applicants should contain
      | id                                   | profileId                | roles.id | roles.name | roles.selectedPriority | interview.start |
      | 0190d09d-e0b0-7c3a-8602-8058c7177a28 | 5b794c41fd533e3b2f61cf05 |          |            |                        | undefined       |
