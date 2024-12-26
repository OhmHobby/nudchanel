import { after, before, binding, given, then, when } from 'cucumber-tsflow'
import expect from 'expect'
import { Client, createClient, SearchEntry, SearchOptions } from 'ldapjs'

@binding()
export class LdapSteps {
  private client: Client

  private bindDn: string

  private bindSecret: string

  private searchBase: string

  private searchOption: SearchOptions

  private searchEntries: SearchEntry[]

  private responseError: Error | null

  @before()
  before() {
    this.client = createClient({
      url: [process.env.LDAP_SERVER_URL ?? `ldap://127.0.0.1:1389`],
      connectTimeout: 10000,
    })
    this.bindDn = ''
    this.bindSecret = 'secret'
    this.responseError = null
    this.searchBase = ''
    this.searchOption = {}
    this.searchEntries = []
  }

  @given('bindDn = {string}')
  givenBindDn(bindDn: string) {
    this.bindDn = bindDn
  }

  @given('bindSecret = {string}')
  givenBindSecret(bindSecret: string) {
    this.bindSecret = bindSecret
  }

  @given('searchBase = {string}')
  givenSearchBase(searchBase: string) {
    this.searchBase = searchBase
  }

  @given('searchScope = {string}')
  givenSearchScope(searchScope: string) {
    this.searchOption.scope = searchScope as any
  }

  @given('searchFilter = {string}')
  givenSearchFilter(searchFilter: string) {
    this.searchOption.filter = searchFilter
  }

  @given('searchAttributes += {string}')
  givenSearchAttribute(searchAttribute: string) {
    this.searchOption.attributes = (this.searchOption.attributes ?? []).concat(searchAttribute)
  }

  @when('do ldap bind')
  whenBind() {
    return new Promise<void>((resolve) =>
      this.client.bind(this.bindDn, this.bindSecret, (err) => {
        this.responseError = err
        resolve()
      }),
    )
  }

  @when('do ldap search')
  whenSearch() {
    return new Promise<void>((resolve) =>
      this.client.search(this.searchBase, this.searchOption, (err, res) => {
        if (err) {
          this.responseError = err
          resolve()
        }

        res.on('error', (resErr) => {
          this.responseError = resErr
          resolve()
        })

        res.on('searchEntry', (entry: SearchEntry) => {
          this.searchEntries.push(entry)
        })

        res.on('end', () => resolve())
      }),
    )
  }

  @when('do ldap bind and search')
  async whenBindAndSearch() {
    await this.whenBind()
    await this.whenSearch()
  }

  @then('ldap response should have error')
  thenShouldHaveError() {
    expect(this.responseError).toBeDefined()
  }

  @then('ldap response should not have error')
  thenShouldNotHaveError() {
    expect(this.responseError).toBeNull()
  }

  @then('search result DN {string} should have {string} = {string}')
  thenSearchResultDnShouldHave(dn: string, type: string, value: string) {
    expect(this.searchEntries.map((el) => el.json.objectName)).toContain(dn)
    expect(this.searchEntries.find((el) => el.json.objectName === dn)?.json.attributes).toContainEqual(
      expect.objectContaining({ type, vals: [value] }),
    )
  }

  @then('search result DN {string} should have {string} contains {string}')
  thenSearchResultDnShouldContain(dn: string, type: string, value: string) {
    expect(this.searchEntries.map((el) => el.json.objectName)).toContain(dn)
    expect(this.searchEntries.find((el) => el.json.objectName === dn)?.json.attributes).toContainEqual(
      expect.objectContaining({ type, vals: expect.arrayContaining([value]) }),
    )
  }

  @then('search result DN {string} should not have {string}')
  thenSearchResultDnShouldNotHave(dn: string, type: string) {
    expect(this.searchEntries.map((el) => el.json.objectName)).toContain(dn)
    expect(this.searchEntries.find((el) => el.json.objectName === dn)?.json.attributes).toContainEqual(
      expect.objectContaining({ type, vals: [] }),
    )
  }

  @then('search result should not have DN {string}')
  thenSearchResultShouldNotHaveDn(dn: string) {
    expect(this.searchEntries.map((el) => el.json.objectName)).not.toContain(dn)
  }

  @after()
  after() {
    this.client.destroy()
  }
}
