import { Item } from '../src/item';

import {
    getCaloriesPerDollar,
    VendorCaloriesPerDollar,
} from '../src/nutritionStatistics';

test('Calories per dollar 1', () => {
    let item = new Item();
    item.setCalories(280);
    item.setServingSize(95, 'g');
    item.setTotalQuantity(570, 'g');
    item.addVendorPrice('ShopA', 1);
    item.addVendorPrice('ShopC', 2);

    let caloriesPerDollar: VendorCaloriesPerDollar[] | null;
    caloriesPerDollar = getCaloriesPerDollar(item);

    if (caloriesPerDollar === null) {
        throw new Error('caloriesPerDollar should not be null');
    } else {
        expect(caloriesPerDollar.length).toBe(2);
        expect(caloriesPerDollar[0].vendor).toBe('ShopA');
        expect(caloriesPerDollar[0].value).toBe(1680);
        expect(caloriesPerDollar[1].vendor).toBe('ShopC');
        expect(caloriesPerDollar[1].value).toBe(840);
    }
});

// TODO: Item class has requirements for measurement units that
// do not allow nutritionStatistic to function correctly
// This needs to be addressed
test('Calories per dollar mismatch weight units', () => {
    let item = new Item();
    item.setCalories(120);
    item.setServingSize(4, 'oz');
    item.setTotalQuantity(1, 'lb');
    item.addVendorPrice('ShopA', 6.0);

    let caloriesPerDollar: VendorCaloriesPerDollar[] | null;
    caloriesPerDollar = getCaloriesPerDollar(item);

    if (caloriesPerDollar === null) {
        throw new Error('caloriesPerDollar should not be null');
    } else {
        expect(caloriesPerDollar.length).toBe(1);
        expect(caloriesPerDollar[0].vendor).toBe('ShopA');
        expect(Number.parseInt(caloriesPerDollar[0].value.toPrecision(2))).toBe(
            80
        );
    }
});

test('Calories per dollar mismatch weight units 2', () => {
    let item = new Item();
    item.setCalories(500);
    item.setServingSize(2, 'kg');
    item.setTotalQuantity(20, 'lb');
    item.addVendorPrice('ShopB', 16.0);

    let caloriesPerDollar: VendorCaloriesPerDollar[] | null;
    caloriesPerDollar = getCaloriesPerDollar(item);

    if (caloriesPerDollar === null) {
        throw new Error('caloriesPerDollar should not be null');
    } else {
        expect(caloriesPerDollar.length).toBe(1);
        expect(caloriesPerDollar[0].vendor).toBe('ShopB');
        expect(caloriesPerDollar[0].value).toBe(142);
    }
});

test('Calories per dollar mismatch volume units 1', () => {
    let item = new Item();
    item.setCalories(35);
    item.setServingSize(15, 'ml');
    item.setTotalQuantity(32, 'us oz');
    item.addVendorPrice('ShopA', 4.0);

    let caloriesPerDollar: VendorCaloriesPerDollar[] | null;
    caloriesPerDollar = getCaloriesPerDollar(item);

    if (caloriesPerDollar === null) {
        throw new Error('caloriesPerDollar should not be null');
    } else {
        expect(caloriesPerDollar.length).toBe(1);
        expect(caloriesPerDollar[0].vendor).toBe('ShopA');
        expect(caloriesPerDollar[0].value).toBe(552);
    }
});
