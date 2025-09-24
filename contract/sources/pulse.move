module srujan_addr::pulse {
    use std::signer;
    use std::vector;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::aptos_account;

    /// Bill status constants
    const BILL_STATUS_PENDING: u8 = 0;
    const BILL_STATUS_PAID: u8 = 1;
    const BILL_STATUS_AUTOPAY_ENABLED: u8 = 2;

    /// Error codes
    const EBILL_NOT_FOUND: u64 = 1001;
    const EINVALID_STATUS: u64 = 1002;
    const EINSUFFICIENT_BALANCE: u64 = 1003;
    const EBILL_ALREADY_PAID: u64 = 1004;

    /// Individual bill structure
    struct Bill has copy, drop, store {
        id: u64,
        description: vector<u8>,
        amount: u64,
        due_date: u64, // optional, 0 if not set
        payee: address,
        storer: address,
        status: u8, // 0=pending, 1=paid
    }

    /// User's bill collection
    struct UserBills has key {
        bills: vector<Bill>,
    }

    /// Global counter for unique bill IDs across all users
    struct GlobalBillCounter has key {
        counter: u64,
    }

    /// Locked funds structure
    struct LockedFunds has key {
        amount: coin::Coin<AptosCoin>,
    }

    /// Individual transaction within a group
    struct Transaction has copy, drop, store {
        bill_id: u64,
        from_address: address,
        to_address: address,
        amount: u64,
        description: vector<u8>,
        timestamp: u64,
    }

    /// Group transaction structure
    struct GroupTransaction has copy, drop, store {
        group_id: u64,
        transactions: vector<Transaction>,
        total_amount: u64,
        timestamp: u64,
        status: u8, // 0=pending, 1=completed, 2=failed
    }

    /// User's transaction history
    struct UserTransactionHistory has key {
        groups: vector<GroupTransaction>,
        group_counter: u64,
    }

    /// Initialize the global bill counter - should be called by module deployer
    public entry fun initialize_global_counter(deployer: &signer) {
        let deployer_addr = signer::address_of(deployer);
        assert!(deployer_addr == @srujan_addr, 1001);
        if (!exists<GlobalBillCounter>(@srujan_addr)) {
            move_to(deployer, GlobalBillCounter { counter: 1 });
        };
    }

    /// Add a new bill for the user
    public entry fun add_bill(
        user: &signer,
        description: vector<u8>,
        amount: u64,
        payee: address,
        due_date: u64, // optional, 0 if not set
        bill_id: u64, // can be provided or use global counter
        status: u8 // initial status
    ) acquires UserBills, GlobalBillCounter {
        let storer = signer::address_of(user);
        let id = if (bill_id == 0) {
            let counter = borrow_global_mut<GlobalBillCounter>(@srujan_addr);
            let new_id = counter.counter;
            counter.counter = counter.counter + 1;
            new_id
        } else {
            bill_id
        };
        let new_bill = Bill {
            id,
            description,
            amount,
            due_date,
            payee,
            storer,
            status,
        };
        if (exists<UserBills>(storer)) {
            let user_bills = borrow_global_mut<UserBills>(storer);
            vector::push_back(&mut user_bills.bills, new_bill);
        } else {
            let bills = vector::singleton(new_bill);
            move_to(user, UserBills { bills });
        };
    }

    /// Update bill status (pay bill, mark as paid, etc.)
    public entry fun update_bill_status(
        user: &signer,
        bill_id: u64,
        new_status: u8
    ) acquires UserBills {
        let storer = signer::address_of(user);
        assert!(new_status == BILL_STATUS_PENDING || new_status == BILL_STATUS_PAID || new_status == BILL_STATUS_AUTOPAY_ENABLED, EINVALID_STATUS);
        assert!(exists<UserBills>(storer), EBILL_NOT_FOUND);
        let user_bills = borrow_global_mut<UserBills>(storer);
        let bills_len = vector::length(&user_bills.bills);
        let found = false;
        let i = 0;
        while (i < bills_len) {
            let bill = vector::borrow_mut(&mut user_bills.bills, i);
            if (bill.id == bill_id) {
                if (new_status == BILL_STATUS_PAID && bill.status == BILL_STATUS_PAID) {
                    abort EBILL_ALREADY_PAID;
                };
                bill.status = new_status;
                found = true;
                break;
            };
            i = i + 1;
        };
        assert!(found, EBILL_NOT_FOUND);
    }

    /// Pay a bill (transfers coins and updates status)
    public entry fun pay_bill(
        user: &signer,
        bill_id: u64
    ) acquires UserBills {
        let storer = signer::address_of(user);
        assert!(exists<UserBills>(storer), EBILL_NOT_FOUND);
        let user_bills = borrow_global_mut<UserBills>(storer);
        let bills_len = vector::length(&user_bills.bills);
        let found = false;
        let i = 0;
        let bill_amount = 0u64;
        let payee_addr = @0x0;
        while (i < bills_len) {
            let bill = vector::borrow_mut(&mut user_bills.bills, i);
            if (bill.id == bill_id) {
                assert!(bill.status != BILL_STATUS_PAID, EBILL_ALREADY_PAID);
                bill_amount = bill.amount;
                payee_addr = bill.payee;
                found = true;
                break;
            };
            i = i + 1;
        };
        assert!(found, EBILL_NOT_FOUND);
        let current_balance = coin::balance<AptosCoin>(storer);
        assert!(current_balance >= bill_amount, EINSUFFICIENT_BALANCE);
        let coins = coin::withdraw<AptosCoin>(user, bill_amount);
        coin::deposit<AptosCoin>(payee_addr, coins);
        let bill = vector::borrow_mut(&mut user_bills.bills, i);
        bill.status = BILL_STATUS_PAID;
    }

    /// Get all bills for a user
    #[view]
    public fun get_user_bills(storer: address): vector<Bill> acquires UserBills {
        if (exists<UserBills>(storer)) {
            let user_bills = borrow_global<UserBills>(storer);
            user_bills.bills
        } else {
            vector::empty<Bill>()
        }
    }

    /// Get bills by status for a user
    #[view]
    public fun get_bills_by_status(storer: address, status: u8): vector<Bill> acquires UserBills {
        if (exists<UserBills>(storer)) {
            let user_bills = borrow_global<UserBills>(storer);
            let filtered_bills = vector::empty<Bill>();
            let bills_len = vector::length(&user_bills.bills);
            let i = 0;
            while (i < bills_len) {
                let bill = vector::borrow(&user_bills.bills, i);
                if (bill.status == status) {
                    vector::push_back(&mut filtered_bills, *bill);
                };
                i = i + 1;
            };
            filtered_bills
        } else {
            vector::empty<Bill>()
        }
    }

    /// Get a specific bill by ID
    #[view]
    public fun get_bill_by_id(storer: address, bill_id: u64): (bool, Bill) acquires UserBills {
        if (exists<UserBills>(storer)) {
            let user_bills = borrow_global<UserBills>(storer);
            let bills_len = vector::length(&user_bills.bills);
            let i = 0;
            while (i < bills_len) {
                let bill = vector::borrow(&user_bills.bills, i);
                if (bill.id == bill_id) {
                    return (true, *bill);
                };
                i = i + 1;
            }
        };
        let empty_bill = Bill {
            id: 0,
            description: b"",
            amount: 0,
            due_date: 0,
            payee: @0x0,
            storer: @0x0,
            status: BILL_STATUS_PENDING,
        };
        (false, empty_bill)
    }

    /// Get bill count for a user
    #[view]
    public fun get_bill_count(storer: address): u64 acquires UserBills {
        if (exists<UserBills>(storer)) {
            let user_bills = borrow_global<UserBills>(storer);
            vector::length(&user_bills.bills)
        } else {
            0
        }
    }

    /// Get pending bills count for a user
    #[view]
    public fun get_pending_bills_count(storer: address): u64 acquires UserBills {
        if (exists<UserBills>(storer)) {
            let user_bills = borrow_global<UserBills>(storer);
            let bills_len = vector::length(&user_bills.bills);
            let count = 0u64;
            let i = 0;
            while (i < bills_len) {
                let bill = vector::borrow(&user_bills.bills, i);
                if (bill.status == BILL_STATUS_PENDING) {
                    count = count + 1;
                };
                i = i + 1;
            };
            count
        } else {
            0
        }
    }

    /// Delete a bill (only if not paid)
    public entry fun delete_bill(
        user: &signer,
        bill_id: u64
    ) acquires UserBills {
        let storer = signer::address_of(user);
        assert!(exists<UserBills>(storer), EBILL_NOT_FOUND);
        let user_bills = borrow_global_mut<UserBills>(storer);
        let bills_len = vector::length(&user_bills.bills);
        let i = 0;
        while (i < bills_len) {
            let bill = vector::borrow(&user_bills.bills, i);
            if (bill.id == bill_id) {
                assert!(bill.status != BILL_STATUS_PAID, EBILL_ALREADY_PAID);
                vector::remove(&mut user_bills.bills, i);
                return;
            };
            i = i + 1;
        };
        abort EBILL_NOT_FOUND;
    }

    /// Update bill details (only for pending bills)
    public entry fun update_bill(
        user: &signer,
        bill_id: u64,
        description: vector<u8>,
        amount: u64,
        payee: address,
        due_date: u64,
        status: u8
    ) acquires UserBills {
        let storer = signer::address_of(user);
        assert!(exists<UserBills>(storer), EBILL_NOT_FOUND);
        let user_bills = borrow_global_mut<UserBills>(storer);
        let bills_len = vector::length(&user_bills.bills);
        let i = 0;
        while (i < bills_len) {
            let bill = vector::borrow_mut(&mut user_bills.bills, i);
            if (bill.id == bill_id) {
                assert!(bill.status == BILL_STATUS_PENDING, EBILL_ALREADY_PAID);
                bill.description = description;
                bill.amount = amount;
                bill.payee = payee;
                bill.due_date = due_date;
                bill.status = status;
                return;
            };
            i = i + 1;
        };
        abort EBILL_NOT_FOUND;
    }

    /// Get user's balance
    #[view]
    public fun get_user_balance(addr: address): u64 {
        coin::balance<AptosCoin>(addr)
    }

    /// Get user's balance (generic)
    public fun get_user_balance_generic<CoinType>(addr: address): u64 {
        coin::balance<CoinType>(addr)
    }

    /// Get my balance (for signed user)
    public fun get_my_balance(user: &signer): u64 {
        let user_addr = signer::address_of(user);
        coin::balance<AptosCoin>(user_addr)
    }

    /// Check if user has sufficient balance
    public fun has_sufficient_balance(addr: address, required_amount: u64): bool {
        let current_balance = coin::balance<AptosCoin>(addr);
        current_balance >= required_amount
    }

    /// Get balance info
    public fun get_balance_info(addr: address): (u64, bool) {
        let balance = coin::balance<AptosCoin>(addr);
        let has_balance = balance > 0;
        (balance, has_balance)
    }

    /// Lock funds
    public entry fun lock_funds(user: &signer, amount: u64) acquires LockedFunds {
        let addr = signer::address_of(user);

        let current_balance = coin::balance<AptosCoin>(addr);
        assert!(current_balance >= amount, EINSUFFICIENT_BALANCE);

        let coins = coin::withdraw<AptosCoin>(user, amount);
        if (exists<LockedFunds>(addr)) {
            let locked = borrow_global_mut<LockedFunds>(addr);
            coin::merge(&mut locked.amount, coins);
        } else {
            move_to(user, LockedFunds { amount: coins });
        }
    }

    /// Get locked funds amount
    #[view]
    public fun get_locked_funds(addr: address): u64 acquires LockedFunds {
        if (exists<LockedFunds>(addr)) {
            let locked = borrow_global<LockedFunds>(addr);
            coin::value(&locked.amount)
        } else {
            0
        }
    }

    /// Pay a single bill using locked funds
    public entry fun pay_single_bill(user: &signer, bill_id: u64) 
    acquires UserBills, LockedFunds, UserTransactionHistory {
        let user_addr = signer::address_of(user);
        
        // Check if user has bills
        assert!(exists<UserBills>(user_addr), EBILL_NOT_FOUND);
        
        // Check if user has locked funds
        assert!(exists<LockedFunds>(user_addr), EINSUFFICIENT_BALANCE);
        
        let user_bills = borrow_global_mut<UserBills>(user_addr);
        let locked_funds = borrow_global_mut<LockedFunds>(user_addr);
        
        // Find the specific bill
        let i = 0;
        let bills_len = vector::length(&user_bills.bills);
        let found_bill = false;
        let bill_amount = 0u64;
        let bill_payee = @0x0;
        let bill_description = vector::empty<u8>();
        
        while (i < bills_len) {
            let bill = vector::borrow(&user_bills.bills, i);
            if (bill.id == bill_id && bill.status == BILL_STATUS_PENDING) {
                found_bill = true;
                bill_amount = bill.amount;
                bill_payee = bill.payee;
                bill_description = bill.description;
                break
            };
            i = i + 1;
        };
        
        assert!(found_bill, EBILL_NOT_FOUND);
        
        // Check if locked funds are sufficient
        let available_locked = coin::value(&locked_funds.amount);
        let gas_fee_estimate = 100000; // 0.001 APT in octas
        let total_needed = bill_amount + gas_fee_estimate;
        assert!(available_locked >= total_needed, EINSUFFICIENT_BALANCE);
        
        // Make the payment
        if (!coin::is_account_registered<AptosCoin>(bill_payee)) {
            let payment_coins = coin::extract(&mut locked_funds.amount, bill_amount);
            coin::deposit(user_addr, payment_coins);
            aptos_account::transfer(user, bill_payee, bill_amount);
        } else {
            let payment_coins = coin::extract(&mut locked_funds.amount, bill_amount);
            coin::deposit<AptosCoin>(bill_payee, payment_coins);
        };
        
        // Mark bill as paid
        let bill = vector::borrow_mut(&mut user_bills.bills, i);
        bill.status = BILL_STATUS_PAID;
        
        // Initialize transaction history if it doesn't exist
        if (!exists<UserTransactionHistory>(user_addr)) {
            move_to(user, UserTransactionHistory { 
                groups: vector::empty<GroupTransaction>(),
                group_counter: 1
            });
        };
        
        let tx_history = borrow_global_mut<UserTransactionHistory>(user_addr);
        let group_id = tx_history.group_counter;
        tx_history.group_counter = tx_history.group_counter + 1;
        
        // Create transaction record
        let transaction = Transaction {
            bill_id,
            from_address: user_addr,
            to_address: bill_payee,
            amount: bill_amount,
            description: bill_description,
            timestamp: group_id,
        };
        
        let transactions = vector::empty<Transaction>();
        vector::push_back(&mut transactions, transaction);
        
        // Create group transaction
        let group_transaction = GroupTransaction {
            group_id,
            transactions,
            total_amount: bill_amount,
            timestamp: group_id,
            status: 1, // completed
        };
        
        // Add to user's transaction history
        vector::push_back(&mut tx_history.groups, group_transaction);
    }

    /// Pay all pending bills using locked funds
    public entry fun pay_all_pending_bills(user: &signer) 
    acquires UserBills, LockedFunds, UserTransactionHistory {
        let user_addr = signer::address_of(user);
        
        // Check if user has bills
        assert!(exists<UserBills>(user_addr), EBILL_NOT_FOUND);
        
        // Check if user has locked funds  
        assert!(exists<LockedFunds>(user_addr), EINSUFFICIENT_BALANCE);
        
        let user_bills = borrow_global_mut<UserBills>(user_addr);
        let locked_funds = borrow_global_mut<LockedFunds>(user_addr);
        
        // Calculate total amount needed for pending bills
        let total_amount_needed = 0u64;
        let pending_bill_count = 0u64;
        let i = 0;
        let bills_len = vector::length(&user_bills.bills);
        
        while (i < bills_len) {
            let bill = vector::borrow(&user_bills.bills, i);
            if (bill.status == BILL_STATUS_PENDING) {
                total_amount_needed = total_amount_needed + bill.amount;
                pending_bill_count = pending_bill_count + 1;
            };
            i = i + 1;
        };
        
        // Check if there are pending bills
        assert!(pending_bill_count > 0, EBILL_NOT_FOUND);
        
        // Add gas fee estimation (0.001 APT per transaction)
        let gas_fee_estimate = pending_bill_count * 100000; // 0.001 APT in octas per bill
        let total_with_gas = total_amount_needed + gas_fee_estimate;
        
        // Check if locked funds are sufficient
        let available_locked = coin::value(&locked_funds.amount);
        assert!(available_locked >= total_with_gas, EINSUFFICIENT_BALANCE);
        
        // Initialize transaction history if it doesn't exist
        if (!exists<UserTransactionHistory>(user_addr)) {
            move_to(user, UserTransactionHistory { 
                groups: vector::empty<GroupTransaction>(),
                group_counter: 1
            });
        };
        
        let tx_history = borrow_global_mut<UserTransactionHistory>(user_addr);
        let group_id = tx_history.group_counter;
        tx_history.group_counter = tx_history.group_counter + 1;
        
        // Process each pending bill and make actual payments
        let transactions = vector::empty<Transaction>();
        let i = 0;
        let actual_paid_amount = 0u64;
        
        while (i < bills_len) {
            let bill = vector::borrow_mut(&mut user_bills.bills, i);
            if (bill.status == BILL_STATUS_PENDING) {
                // Validate payee address exists (will abort if invalid)
                assert!(bill.payee != @0x0, EBILL_NOT_FOUND);
                
                // Make individual payment to each payee
                if (!coin::is_account_registered<AptosCoin>(bill.payee)) {
                    // Use aptos_account::transfer for auto-registration
                    let payment_coins = coin::extract(&mut locked_funds.amount, bill.amount);
                    coin::deposit(user_addr, payment_coins);
                    aptos_account::transfer(user, bill.payee, bill.amount);
                } else {
                    // Direct coin transfer for registered payees
                    let payment_coins = coin::extract(&mut locked_funds.amount, bill.amount);
                    coin::deposit<AptosCoin>(bill.payee, payment_coins);
                };
                
                // Track the actual amount paid
                actual_paid_amount = actual_paid_amount + bill.amount;
                
                // Mark bill as paid
                bill.status = BILL_STATUS_PAID;
                
                // Create transaction record for history
                let transaction = Transaction {
                    bill_id: bill.id,
                    from_address: user_addr,
                    to_address: bill.payee,
                    amount: bill.amount,
                    description: bill.description,
                    timestamp: group_id,
                };
                
                vector::push_back(&mut transactions, transaction);
            };
            i = i + 1;
        };
        
        // Create group transaction with actual paid amount
        let group_transaction = GroupTransaction {
            group_id,
            transactions,
            total_amount: actual_paid_amount,
            timestamp: group_id,
            status: 1, // completed
        };
        
        // Add to user's transaction history
        vector::push_back(&mut tx_history.groups, group_transaction);
    }

    /// Get user's transaction history
    #[view]
    public fun get_user_transaction_history(addr: address): vector<GroupTransaction> 
    acquires UserTransactionHistory {
        if (exists<UserTransactionHistory>(addr)) {
            let history = borrow_global<UserTransactionHistory>(addr);
            history.groups
        } else {
            vector::empty<GroupTransaction>()
        }
    }

    /// Get APT balance of any address (for debugging payment verification)
    #[view]
    public fun get_apt_balance(addr: address): u64 {
        coin::balance<AptosCoin>(addr)
    }

    /// Verify if an address is valid and has been initialized for APT
    #[view]
    public fun is_address_initialized(addr: address): bool {
        coin::is_account_registered<AptosCoin>(addr)
    }

    /// Get specific group transaction
    #[view]
    public fun get_group_transaction(addr: address, group_id: u64): (bool, GroupTransaction)
    acquires UserTransactionHistory {
        if (exists<UserTransactionHistory>(addr)) {
            let history = borrow_global<UserTransactionHistory>(addr);
            let groups_len = vector::length(&history.groups);
            let i = 0;
            while (i < groups_len) {
                let group = vector::borrow(&history.groups, i);
                if (group.group_id == group_id) {
                    return (true, *group)
                };
                i = i + 1;
            };
        };
        (false, GroupTransaction {
            group_id: 0,
            transactions: vector::empty<Transaction>(),
            total_amount: 0,
            timestamp: 0,
            status: 0,
        })
    }

    /// Get pending bills total amount
    #[view] 
    public fun get_pending_bills_total(addr: address): (u64, u64) acquires UserBills {
        if (exists<UserBills>(addr)) {
            let user_bills = borrow_global<UserBills>(addr);
            let total_amount = 0u64;
            let bill_count = 0u64;
            let i = 0;
            let bills_len = vector::length(&user_bills.bills);
            
            while (i < bills_len) {
                let bill = vector::borrow(&user_bills.bills, i);
                if (bill.status == BILL_STATUS_PENDING) {
                    total_amount = total_amount + bill.amount;
                    bill_count = bill_count + 1;
                };
                i = i + 1;
            };
            (total_amount, bill_count)
        } else {
            (0, 0)
        }
    }
}
