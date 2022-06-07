import { validMeasurementUnit } from './measurementUnits';

export type VendorPrice = {
    name: string;
    price: number;
};

type ItemSize = {
    amount: number;
    unit: string;
};

export class Item {
    id = '';
    name = '';
    brand = '';
    calories = -1;
    vendorPrices: VendorPrice[] = [];

    totalQuantity: ItemSize = { amount: -1, unit: '' };
    servingSize: ItemSize = { amount: -1, unit: '' };

    constructor() {}

    setId(id: string) {
        this.id = id;
    }

    getId() {
        return this.id;
    }

    setName(name: string) {
        this.name = name;
    }

    getName() {
        return this.name;
    }

    setBrand(brand: string) {
        this.brand = brand;
    }

    getBrand() {
        return this.brand;
    }

    addVendorPrice(vendor: string, price: number) {
        if (price <= 0) {
            throw new Error('Cannot add a price with a negative or 0 value');
        }

        let vendorPrice: VendorPrice = { name: vendor, price: price };
        this.vendorPrices.push(vendorPrice);
    }

    removeVendorPrice(vendor: string) {
        for (let i = 0; i < this.vendorPrices.length; i++) {
            if (this.vendorPrices[i].name == vendor) {
                this.vendorPrices.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    getVendorPrices() {
        return this.vendorPrices;
    }

    setServingSize(quantity: number, unit: string) {
        if (quantity <= 0) {
            throw new Error('Cannot set quantity to a negative or 0 value');
        }

        if (!validMeasurementUnit(unit)) {
            throw new Error('Unit is invalid');
        }

        this.servingSize = { amount: quantity, unit: unit };
    }

    getServingSize() {
        return this.servingSize;
    }

    setTotalQuantity(quantity: number, unit: string) {
        if (quantity <= 0) {
            throw new Error('Cannot set quantity to a negative or 0 value');
        }

        if (!validMeasurementUnit(unit)) {
            throw new Error('Unit is invalid');
        }

        this.totalQuantity = { amount: quantity, unit: unit };
    }

    getTotalQuantity() {
        return this.totalQuantity;
    }

    setCalories(calories: number) {
        if (calories <= 0) {
            throw new Error('Cannot set calories to negative or 0 value');
        }

        this.calories = calories;
    }

    getCalories() {
        return this.calories;
    }

    //  This will return an object representing all of the values
    //  in the Item that have been set to values other than the
    //  class default.
    getSpecifiedProperties() {
        interface assignablePropertyObject {
            [key: string]: any;
        }

        var specifiedProperties: assignablePropertyObject = {};
        for (const property in this) {
            let value: any = this[property];
            if (typeof this[property] === 'number') {
                if (value !== -1) {
                    specifiedProperties[property] = value;
                }
            } else if (typeof this[property] === 'string') {
                if (value !== '') {
                    specifiedProperties[property] = value;
                }
            } else if (Array.isArray(this[property])) {
                if (value.length !== 0) {
                    specifiedProperties[property] = value;
                }
            }
        }

        return specifiedProperties;
    }
}
