# Transactions

A browser for a wallet's transaction history: people look up, filter and sort the money movements that belong to different owners.

## Language

### Transactions

**Transaction**:
A single movement of money in or out of an Owner's wallet, identified to the outside world by its Reference ID.
_Avoid_: Payment, operation, record

**Reference ID**:
The number printed on a receipt that a person quotes to find a Transaction. Unique per Transaction, and read as an identifier, never as a quantity.
_Avoid_: Tracking code, transaction number, id

**Transaction Type**:
What kind of money movement a Transaction is: top-up, salary deposit, refund, withdrawal, card-to-card transfer, purchase, bill payment or fee. There is no separate "category"; the type is the category.
_Avoid_: Category, kind

**Direction**:
Whether a Transaction brings money In or takes it Out, decided entirely by its Transaction Type: top-up, salary deposit and refund are In; every other type is Out.
_Avoid_: Sign, flow

**Amount**:
How much money a Transaction moved, in Toman, always positive and whole; the Direction says which way.
_Avoid_: Price, value, sum

**Status**:
Where a Transaction is in its lifecycle: Success (money moved), Pending (not settled yet) or Failed (money did not move). Pending is short-lived; a Transaction settles to Success or Failed.
_Avoid_: State, result

**Owner**:
The person whose wallet a Transaction belongs to. Every Transaction has exactly one Owner.
_Avoid_: Customer, account, user (when talking about a Transaction's owner)

**Date**:
The moment a Transaction happened, shown to people on the Jalali (Solar Hijri) calendar.
_Avoid_: Time, created at

### Browsing

**Search**:
One free-text query that finds Transactions by Reference ID when it is all digits (in any script), and by Transaction Type otherwise.
_Avoid_: Query, lookup

**Filter**:
An exact match on Transaction Type, Status or Owner that narrows the Transactions alongside the Search. "All" means no Filter.
_Avoid_: Facet, condition

**Sort**:
The order Transactions are listed in: by Date or by Amount, ascending or descending. Newest first unless chosen otherwise.
_Avoid_: Order by, ranking

**Summary**:
Totals for every Transaction matching the current Search and Filters across all pages: Total In and Total Out add up only Successful Transactions, and the count includes every Status.
_Avoid_: Balance, report
