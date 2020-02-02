const AuctionItem = artifacts.require('./AuctionItem.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Color', (accounts) => {
  let contract

  before(async () => {
    contract = await AuctionItem.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = contract.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await contract.name()
      assert.equal(name, 'AuctionItem')
    })

    it('has a symbol', async () => {
      const symbol = await contract.symbol()
      assert.equal(symbol, 'AUC')
    })

  })

  describe('minting', async () => {

    it('creates a new token', async () => {
      const result = await contract.mint('newAuction')
      const totalSupply = await contract.totalSupply()
      // SUCCESS
      assert.equal(totalSupply, 1)
      const event = result.logs[0].args
      assert.equal(event.tokenId.toNumber(), 1, 'id is correct')
      assert.equal(event.from, '0x0000000000000000000000000000000000000000', 'from is correct')
      assert.equal(event.to, accounts[0], 'to is correct')

      // FAILURE: cannot mint same color twice
      await contract.mint('newAuction').should.be.rejected;
    })
  })

  describe('indexing', async () => {
    it('lists of auctions', async () => {
      // Mint 3 more tokens
      await contract.mint('mobile')
      await contract.mint('laptop')
      await contract.mint('oven')
      const totalSupply = await contract.totalSupply()

      let color
      let result = []

      for (var i = 1; i <= totalSupply; i++) {
        color = await contract.auctionItems(i - 1)
        result.push(color)
      }

      let expected = ['newAuction', 'mobile', 'laptop', 'oven']
      assert.equal(result.join(','), expected.join(','))
    })
  })

})