@sign_in_oidc
Feature: Sign in OIDC

  Scenario: Sign in with discord
    When GET /sign-in/discord
    Then HTTP response status should be FOUND
    And HTTP response redirect to be "https://discord.com/api/v10/oauth2/authorize?client_id=1095379875226988664&response_type=code&scope=identify+email&redirect_uri=https%3A%2F%2Faccounts.nudchannel.com%2Fsign-in%2Fdiscord%2Fcallback"

  Scenario: Sign in with google
    When GET /sign-in/google
    Then HTTP response status should be FOUND
    And HTTP response redirect to be "https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&prompt=consent&scope=email&redirect_uri=https%3A%2F%2Faccounts.nudchannel.com%2Fsign-in%2Fgoogle%2Fcallback&response_type=code&client_id=1083281018269-fvqevf7hgj2svu0m431anvq5ldofud8d.apps.googleusercontent.com"
