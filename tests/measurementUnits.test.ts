import {
    validMeasurementUnit,
    toGrams,
    toMilliliters,
} from '../src/measurementUnits';

test('Validate measurement units', () => {
    expect(validMeasurementUnit('oz')).toBeTruthy();
    expect(validMeasurementUnit('ounce')).toBeFalsy();
    expect(validMeasurementUnit('lb')).toBeTruthy();
    expect(validMeasurementUnit('23')).toBeFalsy();
    expect(validMeasurementUnit('pound')).toBeFalsy();
});

test('Convert to grams', () => {
    expect(toGrams(10, 'oz')).toBe(283);
    expect(toGrams(3, 'lb')).toBe(1361);
    expect(toGrams(6, 'kg')).toBe(6000);
});

test('Convert to milliliters', () => {
    expect(toMilliliters(3, 'l')).toBe(3000);
    expect(toMilliliters(2, 'us gal')).toBe(7571);
    expect(toMilliliters(4, 'us qt')).toBe(3785);
    expect(toMilliliters(6, 'us pt')).toBe(2839);
    expect(toMilliliters(9, 'us cup')).toBe(2160);
    expect(toMilliliters(6, 'us oz')).toBe(177);
    expect(toMilliliters(2, 'us tbsp')).toBe(30);
    expect(toMilliliters(7, 'us tsp')).toBe(35);
    expect(toMilliliters(3, 'imp gal')).toBe(13638);
    expect(toMilliliters(6, 'imp qt')).toBe(6819);
    expect(toMilliliters(3, 'imp pt')).toBe(1705);
    expect(toMilliliters(5, 'imp cup')).toBe(1421);
    expect(toMilliliters(3, 'imp oz')).toBe(85);
    expect(toMilliliters(9, 'imp tbsp')).toBe(160);
    expect(toMilliliters(4, 'imp tsp')).toBe(24);
});
