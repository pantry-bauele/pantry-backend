import { Account } from '../src/account';
import { AccountMapper } from '../src/accountMapper';

test('Check for existing email address', async () => {
    let accountMapper = new AccountMapper();
    expect(await accountMapper.findAccountByEmail('kyle@dev.com')).toBeTruthy();
});

test('Check for non-existent email address', async () => {
    let accountMapper = new AccountMapper();
    expect(await accountMapper.findAccountByEmail('fake@dev.com')).toBeFalsy();
});

test('Create account with non-existent email address then delete', async () => {
    let account = new Account('john@super-dev.com');
    account.firstName = 'John';
    account.lastName = 'SuperDev';
    account.dateCreated = Date();
    let accountMapper = new AccountMapper();

    expect(await accountMapper.createAccount(account)).toBeTruthy();
    expect(await accountMapper.deleteAccount(account)).toBeTruthy();
});

test('Delete account with non-existient email address', async () => {
    let account = new Account('will@devcentre.com');
    account.firstName = 'Will';
    account.lastName = 'DevCentre';
    account.dateCreated = Date();
    let accountMapper = new AccountMapper();

    expect(await accountMapper.deleteAccount(account)).toBeFalsy();
});
