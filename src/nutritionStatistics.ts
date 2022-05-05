import { Item } from './item';
import {
    validMeasurementUnit,
    toGrams,
    getMeasurementType,
    toMilliliters,
} from './measurementUnits';

export type VendorCaloriesPerDollar = {
    vendor: string;
    value: number;
};

// Handles conversion between units if necessary for an entire package
// Like if a serving is 4 oz, but the total quanity is 2 lbs
export function getTotalCalories(item: Item) {
    if (item.getCalories() === -1) {
        throw new Error('Calories have not been set for item');
    }

    let servingSize = item.getServingSize();
    let totalQuantity = item.getTotalQuantity();
    if (
        item.servingSize.amount <= 0 ||
        item.servingSize.unit === '' ||
        item.totalQuantity.amount <= 0 ||
        item.totalQuantity.unit === ''
    ) {
        throw new Error('Quanity amounts or units have not been fully set');
    }

    let caloriesPerServing = item.getCalories();

    let totalCalories = -1;
    // If the measurement units are the same, no conversion is needed
    if (servingSize.unit === totalQuantity.unit) {
        let servings = totalQuantity.amount / servingSize.amount;
        totalCalories = caloriesPerServing * servings;
    }
    // If they are not the same, convert both to either grams or milliliters
    else {
        let servingUnitType = getMeasurementType(servingSize.unit);
        let quantityUnitType = getMeasurementType(totalQuantity.unit);

        if (servingUnitType !== quantityUnitType) {
            throw new Error('Cannot compare weight and volume');
        }

        if (servingUnitType === 'weight' && quantityUnitType === 'weight') {
            let servingAmountToGrams = toGrams(
                servingSize.amount,
                servingSize.unit
            );
            let quantityAmountToGrams = toGrams(
                totalQuantity.amount,
                totalQuantity.unit
            );

            let servings = quantityAmountToGrams / servingAmountToGrams;
            totalCalories = caloriesPerServing * servings;
        }
        if (servingUnitType === 'volume' && quantityUnitType === 'volume') {
            let servingAmountToMilliliters = toMilliliters(
                servingSize.amount,
                servingSize.unit
            );
            let quantityAmountToMilliliters = toMilliliters(
                totalQuantity.amount,
                totalQuantity.unit
            );

            let servings =
                quantityAmountToMilliliters / servingAmountToMilliliters;
            totalCalories = caloriesPerServing * servings;
        }
    }

    return totalCalories;
}

export function getCaloriesPerDollar(item: Item) {
    if (item.getVendorPrices().length === 0) {
        throw new Error('Prices have not been set for item');
    }

    let caloriesPerDollar: VendorCaloriesPerDollar[] = new Array();
    let totalCalories = getTotalCalories(item);
    if (totalCalories === -1) {
        throw new Error('totalCalories could not be computed');
    }

    item.getVendorPrices().forEach((data) => {
        caloriesPerDollar.push({
            vendor: data.name,
            value: Number.parseInt((totalCalories / data.price).toFixed(0)),
        });
    });

    return caloriesPerDollar;
}
