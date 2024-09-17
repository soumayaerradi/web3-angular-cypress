describe('test spec', () => {
    before(() => {
        cy.visit('/');
    });

    it('should accept connection request to metamask', () => {
        cy.get('#connectButton').click();
        cy.acceptMetamaskAccess();
        cy.get('#network').should('have.text', 'sepolia');
        cy.get('#chainId').should('have.text', '11155111');
        cy.get('#accounts').should('have.text', '0xc3c6f796335f9d1cceeb4f0ad92a21d6ad48a117');
    });

    it('should connect wallet using default metamask account', () => {
        cy.get('#disconnect').click();
        cy.disconnectMetamaskWalletFromAllDapps();
        cy.get('#connectButton').click();
        cy.acceptMetamaskAccess();
        cy.get('#accounts').should('have.text', '0xc3c6f796335f9d1cceeb4f0ad92a21d6ad48a117');
    });

    it('should import private key and connect wallet using imported metamask account', () => {
        cy.get('#disconnect').click();
        cy.disconnectMetamaskWalletFromAllDapps();
        cy.importMetamaskAccount('7f7fb59418ef0ca2583d1a7e899078347ab2e19d823fef3fb2d43497bde0fb9f');
        cy.get('#connectButton').click();
        cy.acceptMetamaskAccess();
        cy.get('#accounts').should('have.text', '0x99207f24db020810b9b63fec17e1cfa1801e4c28');
    });

    it('should add custom network', () => {
        cy.addMetamaskNetwork({
            networkName: 'SePolia Testnet',
            rpcUrl: 'https://ethereum-sepolia.publicnode.com',
            chainId: '0xaa36a7',
            symbol: 'SEPOLIA',
            blockExplorer: 'https://sepolia.etherscan.io',
            isTestnet: true
        });
        cy.get('#disconnect').click();
        cy.disconnectMetamaskWalletFromAllDapps();
        cy.get('#connectButton').click();
        cy.acceptMetamaskAccess();
        cy.get('#network').should('have.text', 'sepolia');
        cy.get('#chainId').should('have.text', '11155111');
    });

    it('should import token to metamask and read token balance', () => {
        const LINKContractAddress = '0x779877A7B0D9E8603169DdbD7836e478b4624789';
        cy.importMetamaskToken(LINKContractAddress);
        cy.get('#getBalance').click();
        cy.get('#balance').should('not.have.text', '');
    });

    it('should reject transaction for token transfer', () => {
        cy.get('#recipientInput').type('0xc3c6f796335f9d1cceeb4f0ad92a21d6ad48a117');
        cy.get('#amountInput').type('2');
        cy.get('#transferButton').click();
        cy.rejectMetamaskTransaction();
        cy.get('#transactionStatus').should('have.text', 'Transaction rejected');
    });

    it('should confirm transaction for token transfer', () => {
        cy.get('#recipientInput').clear();
        cy.get('#recipientInput').type('0xc3c6f796335f9d1cceeb4f0ad92a21d6ad48a117');
        cy.get('#amountInput').clear();
        cy.get('#amountInput').type('2');
        cy.get('#transferButton').click();
        cy.confirmMetamaskTransaction();
        cy.get('#transactionStatus').should('have.text', 'Transaction confirmed', { timeout: 60000 });
    });
});
