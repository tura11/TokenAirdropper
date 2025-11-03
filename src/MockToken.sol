// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    constructor() ERC20("Mock Token", "MOCK") {
        // Mint 1000000 tokenów do deployer'a
        _mint(msg.sender, 1000000 * 10**18);
    }
    
    // Funkcja do mintowania więcej tokenów (opcjonalna)
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

//token address 0x5FbDB2315678afecb367f032d93F642f64180aa3