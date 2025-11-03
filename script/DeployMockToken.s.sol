// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MockToken.sol";

contract DeployMockToken is Script {
    function run() external {
        uint256 deployerPrivateKey = 0xAC0974BEC39A17E36BA4A6B4D238FF944BACB478CBED5EFCAE784D7BF4F2FF80;
        vm.startBroadcast(deployerPrivateKey);
        MockToken token = new MockToken(1000 * 10 ** 18);
        console.log("MockToken deployed at:", address(token));

        vm.stopBroadcast();
    }
}
