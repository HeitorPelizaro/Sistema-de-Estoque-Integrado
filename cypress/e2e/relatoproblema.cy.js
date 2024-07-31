/// <reference types="cypress" />

//const { it } = require("mocha");

//const { it } = require("mocha");

describe('Relatar um problema', () => {

    //fazer login
    it('Login', () => {

        //visita um site
        cy.visit("http://localhost:3000/")

        // clica em algo de acordo com o texto inserido no front
        cy.contains("☰").click()
        cy.contains("Entrar").click()

        // Coloca um texto
       cy.get('[type="text"]').type("46251486856")
       cy.get(':nth-child(3) > input').type("heitor26112002")

       cy.get('.buttonEntLogin').click()
       cy.get('.buttonEntLogin').click()
       cy.get('.buttonEntLogin').click()

       
    });
    it('Relato', () => {

      //cy.get('.hamburger').click()
      //cy.get(':nth-child(4) > span').click()

      // selecionar cidade
      //cy.get('#cidadeRP').click()

      // selecionar bairro
      //cy.get('#bairroRP').click()

    });
});