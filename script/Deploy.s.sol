// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {MockToken} from "../src/MockToken.sol";
import {MockTSender} from "../src/MockTSender.sol";

contract Deploy is Script {
    function run() external {

        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80; //first anvil private key


        vm.startBroadcast(deployerPrivateKey);

   
        MockToken mock = new MockToken(1000 * 10 ** 18);
        console.log("MockToken deployed at:", address(mock));


        MockTSender tsender = new MockTSender();
        console.log("MockTSender deployed at:", address(tsender));

        vm.stopBroadcast();

        console.log("------------------------------");
        console.log("MockToken:", address(mock));
        console.log("MockTSender:", address(tsender));
        console.log("------------------------------");
    }
}


//   MockToken: 0x5FbDB2315678afecb367f032d93F642f64180aa3
//   MockTSender: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512