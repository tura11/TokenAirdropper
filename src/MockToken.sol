// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("MockToken", "MOCK") {
        _mint(msg.sender, initialSupply);
    }
}
//token addres 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
