import { Item } from '../src/item';

test('Item construction', async () => {
    let newItem = new Item();

    newItem.setName('Hamburger');
    newItem.setBrand('Great Value');
    newItem.addVendorPrice('ShopA', 3.45);
    newItem.addVendorPrice('ShopC', 5.3);
    newItem.setCalories(300);

    expect(newItem.getName()).toBe('Hamburger');
    expect(newItem.getBrand()).toBe('Great Value');
    expect(newItem.getVendorPrices()).toEqual([
        { name: 'ShopA', price: 3.45 },
        { name: 'ShopC', price: 5.3 },
    ]);
    expect(newItem.getCalories()).toBe(300);
    expect(newItem.setTotalQuantity(660, 'g'));
    expect(newItem.setServingSize(90, 'g'));
    expect(newItem.getTotalQuantity()).toEqual({ amount: 660, unit: 'g' });
    expect(newItem.getServingSize()).toEqual({ amount: 90, unit: 'g' });
});

test('Removing price from item', async () => {
    let newItem = new Item();
    newItem.setName('Lettuce');
    newItem.addVendorPrice('ShopA', 3.45);
    newItem.addVendorPrice('ShopC', 5.3);

    expect(newItem.getVendorPrices()).toEqual([
        { name: 'ShopA', price: 3.45 },
        { name: 'ShopC', price: 5.3 },
    ]);
    expect(newItem.removeVendorPrice('ShopA')).toBeTruthy();
    expect(newItem.getVendorPrices()).toEqual([{ name: 'ShopC', price: 5.3 }]);
});

test('Removing invalid price from item', async () => {
    let newItem = new Item();
    newItem.setName('Pasta');
    newItem.addVendorPrice('ShopB', 1.45);
    newItem.addVendorPrice('ShopC', 1.3);

    expect(newItem.getVendorPrices()).toEqual([
        { name: 'ShopB', price: 1.45 },
        { name: 'ShopC', price: 1.3 },
    ]);
    expect(newItem.removeVendorPrice('ShopA')).toBeFalsy();
    expect(newItem.getVendorPrices()).toEqual([
        { name: 'ShopB', price: 1.45 },
        { name: 'ShopC', price: 1.3 },
    ]);
});

test('Set invalid measurement unit', async () => {
    let newItem = new Item();
    newItem.setName('Yogurt');

    expect(() => {
        expect(newItem.setServingSize(100, 'bl'));
    }).toThrow('Unit is invalid');

    expect(() => {
        expect(newItem.setTotalQuantity(200, 'qe'));
    }).toThrow('Unit is invalid');
});

test('Adding prices to item', () => {
    let newItem = new Item();

    expect(() => {
        newItem.addVendorPrice('ShopA', -2);
    }).toThrow('Cannot add a price with a negative or 0 value');

    newItem.addVendorPrice('ShopA', 3.45);
    expect(newItem.getVendorPrices()).toEqual([{ name: 'ShopA', price: 3.45 }]);
    newItem.addVendorPrice('ShopB', 123.43);
    expect(newItem.getVendorPrices()).toEqual([
        { name: 'ShopA', price: 3.45 },
        { name: 'ShopB', price: 123.43 },
    ]);

    expect(() => {
        newItem.addVendorPrice('ShopA', 0);
    }).toThrow('Cannot add a price with a negative or 0 value');
    expect(newItem.getVendorPrices()).toEqual([
        { name: 'ShopA', price: 3.45 },
        { name: 'ShopB', price: 123.43 },
    ]);
});

test('Setting calories to item', () => {
    let newItem = new Item();

    expect(() => {
        newItem.setCalories(-200);
    }).toThrow('Cannot set calories to negative or 0 value');

    newItem.setCalories(300);
    expect(newItem.getCalories()).toBe(300);
    newItem.setCalories(700);
    expect(newItem.getCalories()).toBe(700);

    expect(() => {
        newItem.setCalories(0);
    }).toThrow('Cannot set calories to negative or 0 value');
    expect(newItem.getCalories()).toBe(700);
});
