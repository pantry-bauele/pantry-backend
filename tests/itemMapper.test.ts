import { Item } from '../pantry-shared/src/item';
import { ItemMapper } from '../src/itemMapper';
import { AccountMapper } from '../src/accountMapper';
import { Account } from '../src/account';
import { ObjectId } from 'mongodb';

test('Create item for user', async () => {
    let newItem = new Item();
    newItem.setName('Cheese');
    let itemMapper = new ItemMapper();
    let account = new Account('john@dev.com');
    account.id = 'testing-id';

    expect(await itemMapper.createItem(newItem, account)).toBeTruthy();
});

test('Delete item for user', async () => {
    let newItem = new Item();
    newItem.setName('Cheese');
    let itemMapper = new ItemMapper();
    let account = new Account('john@dev.com');
    account.id = 'testing-id';

    expect(await itemMapper.deleteItem(newItem, account)).toBeTruthy();
});

// This item will not be deleted by an automatic test, so running the
//  test multiple times will cause this item to be created again
test('Create permanent item for user', async () => {
    let newItem = new Item();
    newItem.setName('Bagel');
    newItem.setBrand('Generic');
    newItem.setCalories(280);
    newItem.addVendorPrice('ShopC', 4);
    newItem.addVendorPrice('ShopA', 3);
    newItem.setServingSize(95, 'g');
    let itemMapper = new ItemMapper();
    let account = new Account('luke@dev.com');
    account.id = 'testing-id';

    expect(await itemMapper.createItem(newItem, account)).toBeTruthy();
});

test('Delete item for non-existent user', async () => {
    let newItem = new Item();
    newItem.setName('Cheese');
    let itemMapper = new ItemMapper();
    let account = new Account('mark@dev.com');
    account.id = 'unused-id';

    expect(await itemMapper.deleteItem(newItem, account)).toBeFalsy();
});

// This test will fail once dummy records are removed from database
test('Get items from ShopA', async () => {
    let itemMapper = new ItemMapper();
    let account = new Account('mark@dev.com');
    account.id = 'unused-id';

    let results = await itemMapper.findItemsAtVendor('ShopA', account);
    expect(results.length).toBe(0);
});

// This test will fail once dummy records are removed from database
test('Get items from ShopC', async () => {
    let itemMapper = new ItemMapper();
    let account = new Account('mark@dev.com');
    account.id = 'unused-id';

    let results = await itemMapper.findItemsAtVendor('ShopC', account);
    expect(results.length).toBe(0);
});
