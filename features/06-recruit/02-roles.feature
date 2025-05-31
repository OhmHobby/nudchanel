@recruit
@recruit_roles
Feature: Recruit roles

  Scenario: Open roles
    When GET /api/v1/recruit/roles
    Then HTTP response status should be OK
    And recruit roles response should be
      | id                                   | name              | rank | isMandatory | collectionId |
      | 0190ea2b-88c0-74dc-87cf-0925476eb0be | Photographer      | 0    | undefined   | null         |
      | 0190ea2b-fdf0-7ea7-95cd-c17dc9eac61e | Videographer      | 1    | undefined   | null         |
      | 0190ea31-d9f0-7f0f-b09b-0843c410c057 | Editor            | 2    | undefined   | null         |
      | 0190ea31-f930-70bd-85f9-619822e8e435 | Sound Operations  | 3    | undefined   | null         |
      | 0190ea30-fb48-7cc1-ad57-ab15c2d5cb15 | Graphic Designer  | 4    | undefined   | null         |
      | 0190ea32-2040-7e53-add5-f7299e6d7cd6 | Public Relations  | 5    | undefined   | null         |
      | 0190ea3a-0b98-7b8a-b4e0-152533ea5716 | Tech Operations   | 6    | undefined   | null         |
      | 0190ea38-9880-75eb-a79f-f290ad5876f4 | Warehouse Manager | 7    | undefined   | null         |
      | 0190d09c-fe20-7a9c-ac5a-faa9192bb325 | Web Developer     | 8    | undefined   | null         |

  Scenario: All roles (FORBIDDEN)
    Given user profileId 5b794c41fd533e3b2f61cf05
    When GET /api/v1/recruit/roles?all=true
    Then HTTP response status should be BAD_REQUEST

  Scenario: All roles
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch
    When GET /api/v1/recruit/roles?all=true
    Then HTTP response status should be OK
    And recruit roles response should be
      | id                                   | name                | rank | isMandatory | collectionId                         |
      | 0190ea2b-88c0-74dc-87cf-0925476eb0be | Photographer        | 0    | false       | null                                 |
      | 018ff83a-89a8-7a1a-a9f4-f3ec10911f6d | คำถามส่วนกลาง (stg) | 0    | true        | 018ff83a-ef38-71b9-a31e-31d1369d8c89 |
      | 0190ea2b-fdf0-7ea7-95cd-c17dc9eac61e | Videographer        | 1    | false       | null                                 |
      | 0190ea31-d9f0-7f0f-b09b-0843c410c057 | Editor              | 2    | false       | null                                 |
      | 0190ea31-f930-70bd-85f9-619822e8e435 | Sound Operations    | 3    | false       | null                                 |
      | 0190ea30-fb48-7cc1-ad57-ab15c2d5cb15 | Graphic Designer    | 4    | false       | null                                 |
      | 0190ea32-2040-7e53-add5-f7299e6d7cd6 | Public Relations    | 5    | false       | null                                 |
      | 0190ea3a-0b98-7b8a-b4e0-152533ea5716 | Tech Operations     | 6    | false       | null                                 |
      | 0190ea38-9880-75eb-a79f-f290ad5876f4 | Warehouse Manager   | 7    | false       | null                                 |
      | 0190d09c-fe20-7a9c-ac5a-faa9192bb325 | Web Developer       | 8    | false       | null                                 |
      | 0190f4a1-5848-71cf-af15-1e9fdb2747a7 | Interview slot      | 9    | true        | null                                 |

  Scenario: Select role
    Given user profileId 61e308efa4d9680019bc343c
    And recruit applicant selected roles = "0190d09c-fe20-7a9c-ac5a-faa9192bb325"
    When PUT /api/v1/recruit/roles
    Then HTTP response status should be NO_CONTENT
