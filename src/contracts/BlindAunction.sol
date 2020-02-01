pragma solidity ^0.5.0;
import "@openzeppelin/contracts/math/Math.sol";
// import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";

contract AuctionFactory{
    BlindAuction[] public auctions;
    function createAuction (uint _startPrice, uint _startBlock, uint _endBlock, string memory _ipfsHash)
      public
      {
        require(_startPrice > 0,"Start Price should be greater than zero");
        // set the new instance
        BlindAuction newAuction = new BlindAuction(msg.sender, _startPrice , _startBlock, _endBlock, _ipfsHash);
        // push the auction address to auctions array
        auctions.push(newAuction);
    }
    function returnAllAuctions() public view returns(BlindAuction[] memory){
        return auctions;
    }
}

contract BlindAuction {
    using Math for uint;
    address public owner;
    uint public bidIncrement;
    uint public startBlock;
    uint public endBlock;
    string public ipfsHash;

    // state
    bool public canceled;
    uint public highestBindingBid;
    address public highestBidder;
    mapping(address => uint256) public fundsByBidder;
    bool ownerHasWithdrawn;
    event BidPlaced(address bidder, uint bid, address highestBidder, uint highestBid, uint highestBindingBid);
    event Withdraw(address withdrawer, address withdrawalAccount, uint amount);
    event BidCanceled();

    constructor(address _owner, uint _startPrice, uint _startBlock, uint _endBlock, string memory _ipfsHash)
        public
        {
        require(_startBlock < _endBlock,"starting block should be greater than the ending block");
        require(_startBlock < block.number,"start block number should be greater than the current block number");
        require(_owner != address(0),"owner address should be valid");
        owner = _owner;
        bidIncrement = _startPrice;
        startBlock = _startBlock;
        endBlock = _endBlock;
        ipfsHash = _ipfsHash;
    }
    modifier onlyOwner {
        require(msg.sender == owner,"only owner is authorized to perform this action");
        _;
    }

    modifier ownerNotAllowed {
        require(msg.sender != owner,"only owner is not allowed to perform this action");
        _;
    }

    modifier afterAuctionStart {
        require(block.number > startBlock,"current block number should be greater than start block number");
        _;
    }

    modifier beforeAuctionEnd {
        require(block.number < endBlock,"current block number should be less than end block number");
        _;
    }

    modifier auctionNotCanceled {
        require(!canceled,"auction is canceled");
        _;
    }

    modifier auctionEndedOrCanceled {
        require(block.number > endBlock || canceled,"auction has ended or has been canceled");
        _;
    }
    modifier auctionEnded {
        require(block.number > endBlock,"auction has ended");
        _;
    }
    modifier auctionCanceled{
        require(canceled,"has been canceled");
        _;
    }
    function getHighestBid()
        public
        view
        returns (uint)
    {
        return fundsByBidder[highestBidder];
    }

    function placeBid()
        public
        payable
        afterAuctionStart
        beforeAuctionEnd
        auctionNotCanceled
        ownerNotAllowed
        returns (bool success)
    {
        // reject payments of 0 ETH
        require(msg.value > 0, "value should be positive");

        // calculate the user's total bid based on the current amount they've sent to the contract
        // plus whatever has been sent with this transaction
        uint newBid = fundsByBidder[msg.sender] + msg.value;

        // if the user isn't even willing to overbid the highest binding bid, there's nothing for us
        // to do except revert the transaction.
        require(newBid > highestBindingBid,"Bid should be greater than highest bid");

        // grab the previous highest bid (before updating fundsByBidder, in case msg.sender is the
        // highestBidder and is just increasing their maximum bid).
        uint highestBid = fundsByBidder[highestBidder];

        fundsByBidder[msg.sender] = newBid;

        if (newBid <= highestBid) {
            // if the user has overbid the highestBindingBid but not the highestBid, we simply
            // increase the highestBindingBid and leave highestBidder alone.

            // note that this case is impossible if msg.sender == highestBidder because you can never
            // bid less ETH than you've already bid.

            highestBindingBid = min(newBid + bidIncrement, highestBid);
        } else {
            // if msg.sender is already the highest bidder, they must simply be wanting to raise
            // their maximum bid, in which case we shouldn't increase the highestBindingBid.

            // if the user is NOT highestBidder, and has overbid highestBid completely, we set them
            // as the new highestBidder and recalculate highestBindingBid.

            if (msg.sender != highestBidder) {
                highestBidder = msg.sender;
                highestBindingBid = min(newBid, highestBid + bidIncrement);
            }
            highestBid = newBid;
        }

        emit BidPlaced(msg.sender, newBid, highestBidder, highestBid, highestBindingBid);
        return true;
    }
    function min(uint a, uint b)
        private
        pure
        returns (uint)
    {
        if (a < b) return a;
        return b;
    }

    function cancelAuction()
        public
        onlyOwner
        beforeAuctionEnd
        auctionNotCanceled
        returns (bool success)
    {
        canceled = true;
        emit BidCanceled();
        return true;
    }

    function withdraw()
        public
        auctionEndedOrCanceled
        returns (bool success)
    {
        address withdrawalAccount;
        uint withdrawalAmount;

        if (canceled) {
            // if the auction was canceled, everyone should simply be allowed to withdraw their funds
            withdrawalAccount = msg.sender;
            withdrawalAmount = fundsByBidder[withdrawalAccount];

        } else {
            // the auction finished without being canceled

            if (msg.sender == owner) {
                // the auction's owner should be allowed to withdraw the highestBindingBid
                withdrawalAccount = highestBidder;
                withdrawalAmount = highestBindingBid;
                ownerHasWithdrawn = true;

            } else if (msg.sender == highestBidder) {
                // the highest bidder should only be allowed to withdraw the difference between their
                // highest bid and the highestBindingBid
                withdrawalAccount = highestBidder;
                if (ownerHasWithdrawn) {
                    withdrawalAmount = fundsByBidder[highestBidder];
                } else {
                    withdrawalAmount = fundsByBidder[highestBidder] - highestBindingBid;
                }

            } else {
                // anyone who participated but did not win the auction should be allowed to withdraw
                // the full amount of their funds
                withdrawalAccount = msg.sender;
                withdrawalAmount = fundsByBidder[withdrawalAccount];
            }
        }

        require(withdrawalAmount > 0,"withdrawal amount should be greater than zero");

        fundsByBidder[withdrawalAccount] -= withdrawalAmount;

        // transfer the funds
        msg.sender.transfer(withdrawalAmount);

        emit Withdraw(msg.sender, withdrawalAccount, withdrawalAmount);

        return true;
    }

}
