export class Account {
    id: any;
    emailAddress = '';
    firstName = '';
    lastName = '';
    dateCreated: any;

    constructor(email?: string, first?: string, last?: string) {
        if (email) {
            this.emailAddress = email;
        }
        if (first) {
            this.firstName = first;
        }
        if (last) {
            this.lastName = last;
        }
    }

    getEmailAddress() {
        return this.emailAddress;
    }

    toDatabase() {
        return {
            emailAddress: this.emailAddress,
            firstName: this.firstName,
            lastName: this.lastName,
            dateCreated: this.dateCreated,
        };
    }

    fromDatabase(data: any) {
        this.id = data._id;
        this.emailAddress = data.emailAddress;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.dateCreated = data.dateCreated;

        return this;
    }
}
