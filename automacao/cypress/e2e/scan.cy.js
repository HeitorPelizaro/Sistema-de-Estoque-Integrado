/// <reference types="cypress" />

//const { it } = require("mocha");

describe('Usuário', () => {

  //fazer login
  it('Scan', () => {

      //visita um site
      cy.visit("http://localhost:3000/login")

      // clica em algo de acordo com o texto inserido no front
     // cy.contains("☰").click()
      //cy.contains("Entrar").click()

      // Coloca um texto
      cy.get('#email').type("heitor@gmail.com")
     //cy.get('[type="text"]').type("46251486856")
     cy.get('#password').type("26112002")
     //cy.get(':nth-child(3) > input').type("heitor26112002")
     cy.get('button').click()
     //cy.get('.buttonEntLogin').click()
     //cy.get('.buttonEntLogin').click()
     cy.get('[href="/scan"] > .btn').click()
     cy.get('#barcode').type("123412")
     cy.get('button').click()
     cy.get('.product-found > h2').should('exist')

  });
});