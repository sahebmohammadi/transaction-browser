# Transactions

A browser for a wallet's transaction history: people look up, filter and sort the money movements that belong to different owners.

## Language

**Transaction**:
A single movement of money in or out of an owner's wallet, identified to the outside world by its Reference ID.
_Avoid_: Payment, operation, record

**Reference ID**:
The numeric identifier printed on a receipt that a person quotes to find a Transaction (`refId`). Unique per Transaction.
_Avoid_: Tracking code, transaction number, id

**Transaction Type**:
What kind of money movement a Transaction is (top-up, withdrawal, card-to-card transfer, purchase, bill payment, refund, salary deposit, fee). There is no separate "category"; the type is the category.
_Avoid_: Category, kind

**Direction**:
Whether a Transaction brings money in or takes it out. It is decided entirely by the Transaction Type, never stored on its own.
_Avoid_: Sign, flow

**Amount**:
How much money a Transaction moved, in Toman, always positive; the Direction says which way. Stored in the `price` field for historical reasons.
_Avoid_: Price, value, sum

**Status**:
Where a Transaction is in its lifecycle: Success (money moved), Pending (not settled yet) or Failed (money did not move).
_Avoid_: State, result

**Owner**:
The user whose wallet a Transaction belongs to. Every Transaction has exactly one Owner.
_Avoid_: Customer, account, user (when talking about a Transaction's owner)

**Summary**:
Totals for every Transaction matching the current search and filters across all pages: Total In and Total Out add up only Successful Transactions, and the count includes every Status.
_Avoid_: Balance, report
