// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("MockToken", "MOCK") {
        _mint(msg.sender, initialSupply);
    }
}
//token addres 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
