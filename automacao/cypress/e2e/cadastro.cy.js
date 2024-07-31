/// <reference types="cypress" />

describe('Teste Cadastro', () => {
  it('Cadastro', () => {
    cy.visit("http://localhost:3000/")
    // clica em algo de acordo com o texto inserido no front
    cy.contains("☰").click()
    cy.contains("Entrar").click()
    cy.contains("Cadastrar").click()
    cy.get('#nomeC').type("AAAAAA")
    cy.get('#cpfC').type("12312312312")
    cy.get('#emailC').type("teste@teste123.com")
    cy.get('#confEmailC').type("teste@teste123.com")
    cy.get('#telC').type(1212341234)
    cy.get('#cepC').type(12123123)
    cy.get('#endC').type("Teste")
    cy.get('#numC').type(12)
    cy.get('#compC').type("Não Obrigatório")
    cy.get('#bairoC').type("Teste")
    cy.get('#cidadeC').type("Teste")
    cy.get('#estadoC').type("Teste")
    cy.get('#senhaC').type("Teste123")
    cy.get('#senha2C').type("Teste123")
    cy.contains("Cadastrar").click()
  })
})