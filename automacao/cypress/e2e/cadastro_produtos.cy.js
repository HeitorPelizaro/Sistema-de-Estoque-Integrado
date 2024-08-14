/// <reference types="cypress" />

//const { it } = require("mocha");

describe('Gerente', () => {

    //fazer login
    it('Importar', () => {
  
        //visita um site
       cy.visit("http://localhost:3000/login")
  
       cy.get('#email').type("heitor@gmail.com")
       cy.get('#password').type("26112002")
       cy.get('button').click()
      
      // clica botao importar produtos
       cy.get('[href="/importar"] > button').click()
  
      // coloca os produtos separados por ;
      // Se desejar colar o banco de dados, é só colocar 
      // dentro do "" do type o texto separado por ; a cada parte 
      // do produto como por exemplo Cod de barras; Descrição; Qtd;
      // Para adicionar mais de um produto, separe por um {enter}.
       cy.get('textarea').should('be.empty')
       cy.get('textarea').type("123412; bbbb; 12{enter}").should("be.visible")
       cy.get('.submit-button').click()
    });
  
  });