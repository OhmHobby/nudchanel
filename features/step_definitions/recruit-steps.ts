import { DataTable } from '@cucumber/cucumber'
import { binding, given, then } from 'cucumber-tsflow'
import expect from 'expect'
import { CommonSteps } from './common-steps'
import { Workspace } from './workspace'

@binding([Workspace])
export class RecruitSteps extends CommonSteps {
  constructor(private readonly workspace: Workspace) {
    super(workspace)
  }

  @given('recruit applicant selected roles = {string}')
  givenRecruitApplicantSelectedRoles(rolesString: string) {
    this.workspace.requestBody = { roleIds: rolesString.split(',') }
  }

  @given('recruit applicant form answers')
  givenRecruitApplicantFormAnswers(dataTable: DataTable) {
    this.workspace.requestBody = { items: dataTable.hashes() }
  }

  @then('recruit collection title should be {string}')
  thenRecruitCollectionTitle(title: string) {
    expect(this.workspace.response?.body.title).toBe(title)
  }

  @then('recruit collection isCompleted should be {string}')
  thenRecruitCollectionCompleted(isCompleted: string) {
    expect(String(this.workspace.response?.body.isCompleted)).toBe(isCompleted)
  }

  @then('recruit settings response should be')
  thenRecruitResponseShouldBe(dataTable: DataTable) {
    const normalizedResponse = [this.workspace.response?.body].flat().map((setting) => ({
      id: setting.id,
      year: String(setting.year),
      name: setting.name,
      openWhen: setting.openWhen,
      closeWhen: setting.closeWhen,
      announceWhen: setting.announceWhen,
      maximumRole: String(setting.maximumRole),
      isActive: String(setting.isActive),
      ['collections.id']: String(setting.collections?.map((el) => el.id).join(',')),
      ['collections.title']: String(setting.collections?.map((el) => el.title).join(',')),
      ['collections.isCompleted']: String(setting.collections?.map((el) => el.isCompleted).join(',')),
    }))
    expect(normalizedResponse).toStrictEqual(dataTable.hashes())
  }

  @then('recruit roles response should be')
  thenRecruitRolesResponseShouldBe(dataTable: DataTable) {
    const columns = dataTable.raw().at(0)
    const normalizedResponse = [this.workspace.response?.body?.roles]
      .flat()
      .map((role) => columns?.reduce((acc, column) => Object.assign(acc, { [column]: String(role[column]) }), {}))
    const normalizedTable = dataTable.hashes().map((row) => ({
      id: row.id ?? expect.anything(),
      name: row.name ?? expect.anything(),
      rank: row.rank ?? expect.anything(),
      isMandatory: row.isMandatory ?? expect.anything(),
      collectionId: row.collectionId ?? expect.anything(),
    }))
    normalizedTable.map((row) => expect(normalizedResponse).toContainEqual(expect.objectContaining(row)))
  }

  @then('recruit applicants should contain')
  thenRecruitApplicantShouldContain(dataTable: DataTable) {
    const normalizedResponse = [this.workspace.response?.body].flat().map((applicant) => ({
      id: applicant.id,
      profileId: applicant.profileId,
      ['roles.id']: applicant.roles.map((el) => el.id).join(','),
      ['roles.name']: applicant.roles.map((el) => el.name).join(','),
      ['roles.selectedPriority']: applicant.roles.map((el) => el.selectedPriority).join(','),
      interviewSlotStart: String(applicant.interviewSlotStart),
    }))
    dataTable.hashes().map((row) => expect(normalizedResponse).toContainEqual(expect.objectContaining(row)))
  }

  @then('recruit collection questions should be')
  thenRecruitCollectionQuestionsShouldBe(dataTable: DataTable) {
    const normalizedTable = dataTable.hashes().map((row) => ({
      id: row.id ?? expect.anything(),
      question: row.question ?? expect.anything(),
      input: row.input ?? expect.anything(),
      rank: row.rank ?? expect.anything(),
      answer: row.answer ?? expect.anything(),
    }))
    const columns = Object.keys(normalizedTable[0])
    const normalizedResponse = [this.workspace.response?.body?.questions]
      .flat()
      .map((role) => columns?.reduce((acc, column) => Object.assign(acc, { [column]: String(role[column]) }), {}))
    normalizedTable.map((row) => expect(normalizedResponse).toContainEqual(expect.objectContaining(row)))
  }
}
