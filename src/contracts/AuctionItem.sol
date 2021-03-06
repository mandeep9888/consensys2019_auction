pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";


contract AuctionItem is ERC721Full {


string[] public auctionItems;
mapping(string => bool) auctionItemExists;

constructor()
    ERC721Full("AuctionItem", "AUC")
    public
    {
}

    function mint(string memory _name)
    public
    returns (uint)
    {
    require(!auctionItemExists[_name],"auction exists already");
    uint _id = auctionItems.push(_name);
    _mint(msg.sender, _id);
    auctionItemExists[_name] = true;
     return _id;
    }
    function transferToken(address _from, address to, uint tokenid)
    public
    {
        require(tokenid <= auctionItems.length, "should be a minted token");
        _transferFrom(_from,  to,  tokenid);
    }

}
