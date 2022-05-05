import { Item, VendorPrice } from '../src/item';
import { findCheapestVendor } from '../src/financialStatistics';

test('Find one cheapest vendor', () => {
    let item = new Item();
    item.setName('Ham');
    item.addVendorPrice('ShopB', 0.43);
    item.addVendorPrice('ShopA', 2.33);
    item.addVendorPrice('ShopC', 1.43);

    let cheapestVendor: VendorPrice[] | null;
    cheapestVendor = findCheapestVendor(item);

    // Despite the different ways this can be returned
    // I am expecting to get an array of one element
    if (cheapestVendor === null) {
        throw new Error('cheapestVendor should not be null');
    } else {
        expect(cheapestVendor).toBeTruthy();
        expect(cheapestVendor.length).toBe(1);
        expect(cheapestVendor[0].name).toBe('ShopB');
        expect(cheapestVendor[0].price).toBe(0.43);
    }
});

test('Find two cheapest vendors', () => {
    let item = new Item();
    item.setName('Ham');
    item.addVendorPrice('ShopB', 3.53);
    item.addVendorPrice('ShopA', 1.23);
    item.addVendorPrice('ShopC', 1.23);

    let cheapestVendor: VendorPrice[] | null;
    cheapestVendor = findCheapestVendor(item);

    // Despite the different ways this can be returned
    // I am expecting to get an array of one element
    if (cheapestVendor === null) {
        throw new Error('cheapestVendor should not be null');
    } else {
        console.log(cheapestVendor);

        expect(cheapestVendor).toBeTruthy();
        expect(cheapestVendor.length).toBe(2);
        expect(cheapestVendor[0].name).toBe('ShopA');
        expect(cheapestVendor[0].price).toBe(1.23);
        expect(cheapestVendor[1].name).toBe('ShopC');
        expect(cheapestVendor[1].price).toBe(1.23);
    }
});

test('Find three cheapest vendor', () => {
    let item = new Item();
    item.setName('Ham');
    item.addVendorPrice('ShopB', 3.53);
    item.addVendorPrice('ShopA', 1.23);
    item.addVendorPrice('ShopC', 1.23);
    item.addVendorPrice('ShopD', 1.23);

    let cheapestVendor: VendorPrice[] | null;
    cheapestVendor = findCheapestVendor(item);

    // Despite the different ways this can be returned
    // I am expecting to get an array of one element
    if (cheapestVendor === null) {
        throw new Error('cheapestVendor should not be null');
    } else {
        console.log(cheapestVendor);

        expect(cheapestVendor).toBeTruthy();
        expect(cheapestVendor.length).toBe(3);
        expect(cheapestVendor[0].name).toBe('ShopA');
        expect(cheapestVendor[0].price).toBe(1.23);
        expect(cheapestVendor[1].name).toBe('ShopC');
        expect(cheapestVendor[1].price).toBe(1.23);
        expect(cheapestVendor[2].name).toBe('ShopD');
        expect(cheapestVendor[2].price).toBe(1.23);
    }
});

test('Find one cheapest vendor', () => {
    let item = new Item();
    item.setName('Ham');
    item.addVendorPrice('ShopB', 3.53);
    item.addVendorPrice('ShopA', 1.23);
    item.addVendorPrice('ShopC', 3.23);
    item.addVendorPrice('ShopD', 0.53);
    item.addVendorPrice('ShopA', 4.33);
    item.addVendorPrice('ShopE', 0.34);

    let cheapestVendor: VendorPrice[] | null;
    cheapestVendor = findCheapestVendor(item);

    // Despite the different ways this can be returned
    // I am expecting to get an array of one element
    if (cheapestVendor === null) {
        throw new Error('cheapestVendor should not be null');
    } else {
        console.log(cheapestVendor);

        expect(cheapestVendor).toBeTruthy();
        expect(cheapestVendor.length).toBe(1);
        expect(cheapestVendor[0].name).toBe('ShopE');
        expect(cheapestVendor[0].price).toBe(0.34);
    }
});
