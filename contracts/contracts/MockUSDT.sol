// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice USDT de prueba para el track WDK: mismo estandar ERC-20 (6 decimales,
/// igual que el USDT real) desplegado en Avalanche Fuji, para poder mostrar
/// transferencias reales en testnet sin depender de un USDT oficial ahi.
/// Implementacion minima y autocontenida (sin dependencias externas) a
/// proposito, para mantener el deploy simple.
contract MockUSDT {
    string public constant name = "Mock Tether USD";
    string public constant symbol = "USDT";
    uint8 public constant decimals = 6;

    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    modifier onlyOwner() {
        require(msg.sender == owner, "MockUSDT: caller is not the owner");
        _;
    }

    constructor(address initialHolder, uint256 initialSupply) {
        owner = msg.sender;
        _mint(initialHolder, initialSupply * 10 ** decimals);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= amount, "MockUSDT: insufficient allowance");
        if (allowed != type(uint256).max) {
            allowance[from][msg.sender] = allowed - amount;
        }
        _transfer(from, to, amount);
        return true;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount * 10 ** decimals);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(to != address(0), "MockUSDT: transfer to zero address");
        uint256 balance = balanceOf[from];
        require(balance >= amount, "MockUSDT: insufficient balance");
        balanceOf[from] = balance - amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }
}
