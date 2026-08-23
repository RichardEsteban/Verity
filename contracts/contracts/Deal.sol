// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Deal {
    enum Status {
        Created,
        Locked,
        Released,
        Refunded,
        SplitReleased
    }

    struct Deposit {
        address buyer;
        address seller;
        uint256 amount;
        uint256 repairAmount;
        uint256 refundAmount;
        Status status;
    }

    uint256 public nextDepositId;

    mapping(uint256 => Deposit) public deposits;

    event DepositCreated(
        uint256 indexed depositId,
        address indexed buyer,
        address indexed seller,
        uint256 amount
    );

    event DepositLocked(
        uint256 indexed depositId
    );

    event FullRefund(
        uint256 indexed depositId,
        uint256 amount
    );

    event SplitRelease(
        uint256 indexed depositId,
        uint256 repairAmount,
        uint256 refundAmount
    );

    function createDeposit(
        address seller
    ) external payable returns (uint256 depositId) {
        require(seller != address(0), "Invalid seller");
        require(msg.value > 0, "Amount must be greater than zero");

        depositId = nextDepositId++;

        deposits[depositId] = Deposit({
            buyer: msg.sender,
            seller: seller,
            amount: msg.value,
            repairAmount: 0,
            refundAmount: 0,
            status: Status.Created
        });

        emit DepositCreated(
            depositId,
            msg.sender,
            seller,
            msg.value
        );
    }

    function lockDeposit(
        uint256 depositId
    ) external {
        Deposit storage deposit = deposits[depositId];

        require(
            msg.sender == deposit.buyer,
            "Only buyer"
        );

        require(
            deposit.status == Status.Created,
            "Invalid status"
        );

        deposit.status = Status.Locked;

        emit DepositLocked(depositId);
    }

    function refundFull(
        uint256 depositId
    ) external {
        Deposit storage deposit = deposits[depositId];

        require(
            msg.sender == deposit.buyer,
            "Only buyer"
        );

        require(
            deposit.status == Status.Locked,
            "Deposit not locked"
        );

        uint256 amount = deposit.amount;

        deposit.status = Status.Refunded;

        (bool success, ) = payable(deposit.buyer).call{
            value: amount
        }("");

        require(success, "Refund failed");

        emit FullRefund(
            depositId,
            amount
        );
    }

    function splitRelease(
        uint256 depositId,
        uint256 repairAmount,
        uint256 refundAmount
    ) external {
        Deposit storage deposit = deposits[depositId];

        require(
            msg.sender == deposit.buyer,
            "Only buyer"
        );

        require(
            deposit.status == Status.Locked,
            "Deposit not locked"
        );

        require(
            repairAmount + refundAmount == deposit.amount,
            "Amounts must equal deposit"
        );

        deposit.repairAmount = repairAmount;
        deposit.refundAmount = refundAmount;
        deposit.status = Status.SplitReleased;

        (bool sellerSuccess, ) = payable(deposit.seller).call{
            value: repairAmount
        }("");

        require(
            sellerSuccess,
            "Seller payment failed"
        );

        (bool buyerSuccess, ) = payable(deposit.buyer).call{
            value: refundAmount
        }("");

        require(
            buyerSuccess,
            "Buyer refund failed"
        );

        emit SplitRelease(
            depositId,
            repairAmount,
            refundAmount
        );
    }

    function getDeposit(
        uint256 depositId
    )
        external
        view
        returns (
            address buyer,
            address seller,
            uint256 amount,
            uint256 repairAmount,
            uint256 refundAmount,
            Status status
        )
    {
        Deposit memory deposit = deposits[depositId];

        return (
            deposit.buyer,
            deposit.seller,
            deposit.amount,
            deposit.repairAmount,
            deposit.refundAmount,
            deposit.status
        );
    }
}