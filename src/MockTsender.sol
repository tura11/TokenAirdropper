// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockTSender {
    error LengthsDontMatch();
    error ZeroAddress();
    error TransferFailed();
    error TotalDoesntAddUp();

    function airdropERC20(
        address tokenAddress,
        address[] calldata recipients,
        uint256[] calldata amounts,
        uint256 totalAmount
    ) external {
        if (recipients.length != amounts.length) revert LengthsDontMatch();
        if (recipients.length == 0) revert ZeroAddress();

        IERC20 token = IERC20(tokenAddress);

        // Najpierw pobieramy wszystkie tokeny od użytkownika
        bool success = token.transferFrom(msg.sender, address(this), totalAmount);
        if (!success) revert TransferFailed();

        uint256 addedAmount = 0;

        // A teraz rozsyłamy je do odbiorców
        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] == address(0)) revert ZeroAddress();

            success = token.transfer(recipients[i], amounts[i]);
            if (!success) revert TransferFailed();

            addedAmount += amounts[i];
        }

        if (addedAmount != totalAmount) revert TotalDoesntAddUp();
    }
}
