let measurementUnits = [
    { label: 'g', type: 'weight', toGrams: 1 },
    { label: 'kg', type: 'weight', toGrams: 1000 },

    { label: 'lb', type: 'weight', toGrams: 453.592 },
    { label: 'oz', type: 'weight', toGrams: 28.3495 },

    { label: 'ml', type: 'volume', toMilliliters: 1 },
    { label: 'l', type: 'volume', toMilliliters: 1000 },

    { label: 'us gal', type: 'volume', toMilliliters: 3785.41 },
    { label: 'us qt', type: 'volume', toMilliliters: 946.353 },
    { label: 'us pt', type: 'volume', toMilliliters: 473.176 },
    { label: 'us cup', type: 'volume', toMilliliters: 240 },
    { label: 'us oz', type: 'volume', toMilliliters: 29.5735 },
    { label: 'us tbsp', type: 'volume', toMilliliters: 14.7868 },
    { label: 'us tsp', type: 'volume', toMilliliters: 4.9289317406874 },

    { label: 'imp gal', type: 'volume', toMilliliters: 4546.09 },
    { label: 'imp qt', type: 'volume', toMilliliters: 1136.52 },
    { label: 'imp pt', type: 'volume', toMilliliters: 568.261 },
    { label: 'imp cup', type: 'volume', toMilliliters: 284.131 },
    { label: 'imp oz', type: 'volume', toMilliliters: 28.4131 },
    { label: 'imp tbsp', type: 'volume', toMilliliters: 17.7582 },
    { label: 'imp tsp', type: 'volume', toMilliliters: 5.91939 },
];

export function validMeasurementUnit(unit: string) {
    for (let i = 0; i < measurementUnits.length; i++) {
        if (unit === measurementUnits[i].label) {
            return true;
        }
    }
}

export function toGrams(quantity: number, label: string) {
    const unit = measurementUnits.find((element) => element.label === label);

    if (unit !== undefined && unit.toGrams) {
        return Number.parseFloat((quantity * unit.toGrams).toFixed(0));
    } else {
        return -1;
    }
}

export function toMilliliters(quantity: number, label: string) {
    const unit = measurementUnits.find((element) => element.label === label);
    if (unit !== undefined && unit.toMilliliters) {
        return Number.parseFloat((quantity * unit.toMilliliters).toFixed(0));
    } else {
        return -1;
    }
}

export function getMeasurementType(unit: string) {
    for (let i = 0; i < measurementUnits.length; i++) {
        if (unit === measurementUnits[i].label) {
            return measurementUnits[i].type;
        }
    }

    return null;
}
