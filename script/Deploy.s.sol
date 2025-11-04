// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {MockToken} from "../src/MockToken.sol";
import {MockTSender} from  "../src/MockTsender.sol";

contract Deploy is Script {
    function run() external {
        // start broadcast (deploy z konta[0])
        vm.startBroadcast();

        // Deploy mock token
        MockToken mock = new MockToken(1000 * 10 ** 18);
        console.log("MockToken deployed at:", address(mock));

        // Deploy TSender
        MockTSender tsender = new MockTSender();
        console.log("TSender deployed at:", address(tsender));

        vm.stopBroadcast();
    }
}
// MockToken deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
 // TSender deployed at: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512