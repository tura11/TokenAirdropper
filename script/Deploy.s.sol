// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {MockToken} from "../src/MockToken.sol";
import {MockTSender} from "../src/MockTSender.sol";

contract Deploy is Script {
    function run() external {

        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;


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


//   MockToken deployed at: 0x851356ae760d987E095750cCeb3bC6014560891C
//   MockTSender deployed at: 0xf5059a5D33d5853360D16C683c16e67980206f36