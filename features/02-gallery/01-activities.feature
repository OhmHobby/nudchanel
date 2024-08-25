@gallery_activities
Feature: Gallery activities

  Scenario: Query activities
    Given activities before 1635811204682
    And activities limit to 2
    When GET /api/v1/gallery/activities
    Then HTTP response status should be OK
    And activities should be
      | id      | title                                                                      | time          | cover                                | coverUrl                                                                            |
      | EiFyGSO | โครงการปัจฉิมนิเทศ​ ประจำปีการศึกษา 2563                                   | 1614751220675 | 37d38066-12a1-44cb-af35-a55a36580157 | https://photos.nudchannel.com/photos/cover/37d38066-12a1-44cb-af35-a55a36580157.jpg |
      | -LScjqC | โครงการเข้าค่ายลูกเสือ-เนตรนารี ระดับชั้นมัธยมศึกษาปีที่ 3 ปีการศึกษา 2563 | 1614128445354 | 88771af0-3413-4cf0-a07f-d00ad1a9ddd3 | https://photos.nudchannel.com/photos/cover/88771af0-3413-4cf0-a07f-d00ad1a9ddd3.jpg |

  Scenario: Search activities
    Given activities before 1635811204682
    And activities limit to 2
    And activities search "ปัจฉิม"
    When GET /api/v1/gallery/activities
    Then HTTP response status should be OK
    And activities should be
      | id      | title                                    | time          | cover                                | coverUrl                                                                            |
      | EiFyGSO | โครงการปัจฉิมนิเทศ​ ประจำปีการศึกษา 2563 | 1614751220675 | 37d38066-12a1-44cb-af35-a55a36580157 | https://photos.nudchannel.com/photos/cover/37d38066-12a1-44cb-af35-a55a36580157.jpg |
      | a0iSxyq | โครงการปัจฉิมนิเทศ​ ประจำปีการศึกษา 2562 | 1582117200000 | c04a84ce-9f33-467a-9f9f-f29fe5e76829 | https://photos.nudchannel.com/photos/cover/c04a84ce-9f33-467a-9f9f-f29fe5e76829.jpg |

  Scenario: Search activities with academic year
    Given activities before 1635811204682
    And activities limit to 10
    And activities year 2020
    And activities search "ปัจฉิม"
    When GET /api/v1/gallery/activities
    Then HTTP response status should be OK
    And activities should be
      | id      | title                                    | time          | cover                                | coverUrl                                                                            |
      | EiFyGSO | โครงการปัจฉิมนิเทศ​ ประจำปีการศึกษา 2563 | 1614751220675 | 37d38066-12a1-44cb-af35-a55a36580157 | https://photos.nudchannel.com/photos/cover/37d38066-12a1-44cb-af35-a55a36580157.jpg |

  Scenario: Get activity
    When GET /api/v1/gallery/activities/AINfyH5
    Then HTTP response status should be OK
    And activities should be
      | id      | title                                         | time          | cover                                | coverUrl                                                                            |
      | AINfyH5 | Audition Christmas Night Art & Music Festival | 1607332201618 | dd9d66ec-52db-4479-9149-fb0c3883bbce | https://photos.nudchannel.com/photos/cover/dd9d66ec-52db-4479-9149-fb0c3883bbce.jpg |
    And activity albums should be
      | id      | title                | cover                                | coverUrl                                                                            |
      | 0AZ7iw6 | Cover Dance Audition | 1e83a073-3709-4051-93fc-e92184739208 | https://photos.nudchannel.com/photos/cover/1e83a073-3709-4051-93fc-e92184739208.jpg |
      | PNBwEli | Music Band Audition  | d98a9bb3-2895-4f2f-9c3d-f39a1f2c8819 | https://photos.nudchannel.com/photos/cover/d98a9bb3-2895-4f2f-9c3d-f39a1f2c8819.jpg |
    And activity videos should be
      | title                          | url                          | cover                                                |
      | Cover Dance Audition 2020      | https://youtu.be/iAV_ID03AIk | https://i.ytimg.com/vi/iAV_ID03AIk/maxresdefault.jpg |
      | Music Band Audition 2020 (1/3) | https://youtu.be/7vW7wHDfAis | https://i.ytimg.com/vi/7vW7wHDfAis/maxresdefault.jpg |
      | Music Band Audition 2020 (2/3) | https://youtu.be/zVuMxpJPMFw | https://i.ytimg.com/vi/zVuMxpJPMFw/maxresdefault.jpg |
      | Music Band Audition 2020 (3/3) | https://youtu.be/Lm4iOuDAubs | https://i.ytimg.com/vi/Lm4iOuDAubs/maxresdefault.jpg |
